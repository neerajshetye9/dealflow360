import { customerTiersTable, customersTable } from "../models/Customer.model";
import { productCategoriesTable, productsTable } from "../models/Product.model";
import { discountRulesTable } from "../models/DiscountRule.model";
import { QuotationLineInput, LineViolation, BlendedRiskResult } from "../types";

export class DiscountGovernanceService {
  /**
   * Calculates relationship multiplier based on customer loyalty score (0.0 to 1.0)
   * Formula per testing_framework.md Section 2.2: MULTIPLIER = 1.0 + (loyalty_score * 0.5)
   */
  public static computeRelationshipMultiplier(loyaltyScore = 0): number {
    const clampedScore = Math.max(0, Math.min(1.0, Number(loyaltyScore) || 0));
    return 1.0 + clampedScore * 0.5; // range: 1.0x to 1.5x
  }

  /**
   * Strictest ceiling between Customer Tier (relaxed by loyalty multiplier) and Category Ceiling (Rule 5 & testing_framework.md 2.2)
   */
  public static async computeEffectiveDiscountCeiling(tierId: string, categoryId: string, loyaltyScore = 0): Promise<number> {
    const tier = await customerTiersTable().where({ id: tierId }).first();
    const baseTierCeiling = tier ? Number(tier.discount_ceiling_percent) : 5.0;

    const multiplier = this.computeRelationshipMultiplier(loyaltyScore);
    const relaxedTierCeiling = baseTierCeiling * multiplier;

    const category = await productCategoriesTable().where({ id: categoryId }).first();
    const categoryCeiling = category ? Number(category.discount_ceiling_percent) : 10.0;

    // Optional specific override from discount_rules
    const specificRule = await discountRulesTable()
      .where({ tier_id: tierId, category_id: categoryId })
      .first();

    if (specificRule) {
      return Number(specificRule.max_discount_percent);
    }

    // Category ceiling protection: Category ceiling cannot be exceeded by multiplier unless specific override
    return Math.min(relaxedTierCeiling, categoryCeiling);
  }

  /**
   * Evaluates line items and calculates Blended Discount Risk Score (Rule 6 & testing_framework.md)
   * Enforces 15% Net Profit Guardrail requirement.
   */
  public static async computeBlendedRiskScore(
    customerId: string,
    lines: QuotationLineInput[]
  ): Promise<BlendedRiskResult> {
    const customer = await customersTable().where({ id: customerId }).first();
    const tierId = customer ? customer.tier_id : "";
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    const violations: LineViolation[] = [];
    let totalQuoteValue = 0;
    let totalQuoteCost = 0;
    let weightedRiskSum = 0;

    // Calculate line totals first
    const lineValues: number[] = [];
    for (const line of lines) {
      // Validate bounds: non-negative discount, max 100%
      const discount = Math.max(0, Math.min(100, Number(line.requestedDiscountPercent) || 0));
      const discountedUnitPrice = line.unitPrice * (1 - discount / 100);
      const lineTotal = discountedUnitPrice * line.quantity;
      const lineCost = line.unitCost * line.quantity;
      totalQuoteValue += lineTotal;
      totalQuoteCost += lineCost;
      lineValues.push(lineTotal);
    }

    // Default totalQuoteValue if 0
    const safeTotalQuoteValue = totalQuoteValue > 0 ? totalQuoteValue : 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const effectiveCeiling = await this.computeEffectiveDiscountCeiling(tierId, line.categoryId, loyaltyScore);
      const requestedDiscount = Math.max(0, Math.min(100, Number(line.requestedDiscountPercent) || 0));
      const overByPoints = Math.max(0, requestedDiscount - effectiveCeiling);

      // Line Margin Impact Weight = (lineTotal / totalQuoteValue) * marginSensitivity
      const lineTotal = lineValues[i];
      const nominalMargin = line.unitPrice > 0 ? ((line.unitPrice - line.unitCost) / line.unitPrice) : 0;
      const marginSensitivity = Math.max(1.0, 2.0 - nominalMargin); // 1.0 to 2.0 multiplier

      const lineWeightByMarginImpact = (lineTotal / safeTotalQuoteValue) * marginSensitivity;
      const lineRisk = overByPoints * lineWeightByMarginImpact;

      weightedRiskSum += lineRisk;

      if (overByPoints > 0) {
        violations.push({
          lineIndex: i,
          productId: line.productId,
          requestedDiscountPercent: requestedDiscount,
          effectiveCeilingPercent: effectiveCeiling,
          overByPoints,
          lineTotal,
          lineMarginImpactWeight: Number(lineWeightByMarginImpact.toFixed(4)),
          lineRiskContribution: Number(lineRisk.toFixed(2)),
        });
      }
    }

    // Profit Net Guardrail Check (testing_framework.md 2.4): OVERALL_QUOTE_PROFIT_MARGIN >= 15%
    const weightedMarginPercent = safeTotalQuoteValue > 0
      ? Number((((safeTotalQuoteValue - totalQuoteCost) / safeTotalQuoteValue) * 100).toFixed(2))
      : 0;

    // If profit margin < 15%, add extra risk penalty to enforce Finance review
    if (weightedMarginPercent < 15.0 && safeTotalQuoteValue > 0) {
      const marginDeficit = 15.0 - weightedMarginPercent;
      weightedRiskSum += marginDeficit * 2.5;
    }

    const rawScore = Math.min(100, Math.round(weightedRiskSum * 3.5));
    const blendedRiskScore = rawScore;

    let riskLabel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let approvalRoute: "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL" = "AUTO_APPROVED";

    if (blendedRiskScore < 30 && weightedMarginPercent >= 15.0) {
      riskLabel = "LOW";
      approvalRoute = "AUTO_APPROVED";
    } else if (blendedRiskScore < 70) {
      riskLabel = "MEDIUM";
      approvalRoute = "SALES_MANAGER";
    } else {
      riskLabel = "HIGH";
      approvalRoute = "SEQUENTIAL_TWO_LEVEL";
    }

    return {
      blendedRiskScore,
      riskLabel,
      approvalRoute,
      violations,
      totalQuoteValue: Number(totalQuoteValue.toFixed(2)),
      weightedMarginPercent,
    };
  }

  public static determineApprovalRoute(riskScore: number): "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL" {
    if (riskScore < 30) return "AUTO_APPROVED";
    if (riskScore < 70) return "SALES_MANAGER";
    return "SEQUENTIAL_TWO_LEVEL";
  }
}
