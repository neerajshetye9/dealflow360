import { customerTiersTable, customersTable } from "../models/Customer.model";
import { productCategoriesTable, productsTable } from "../models/Product.model";
import { discountRulesTable } from "../models/DiscountRule.model";
import { QuotationLineInput, LineViolation, BlendedRiskResult } from "../types";

export class DiscountGovernanceService {
  /**
   * Strictest ceiling between Customer Tier and Category Ceiling always takes precedence (Rule 5)
   */
  public static async computeEffectiveDiscountCeiling(tierId: string, categoryId: string): Promise<number> {
    const tier = await customerTiersTable().where({ id: tierId }).first();
    const tierCeiling = tier ? Number(tier.discount_ceiling_percent) : 5.0;

    const category = await productCategoriesTable().where({ id: categoryId }).first();
    const categoryCeiling = category ? Number(category.discount_ceiling_percent) : 10.0;

    // Optional specific override from discount_rules
    const specificRule = await discountRulesTable()
      .where({ tier_id: tierId, category_id: categoryId })
      .first();

    if (specificRule) {
      return Number(specificRule.max_discount_percent);
    }

    return Math.min(tierCeiling, categoryCeiling);
  }

  /**
   * Evaluates line items and calculates Blended Discount Risk Score (Rule 6)
   * Line Risk = max(0, Requested Discount - Allowed Ceiling) * Line Margin Impact Weight
   */
  public static async computeBlendedRiskScore(
    customerId: string,
    lines: QuotationLineInput[]
  ): Promise<BlendedRiskResult> {
    const customer = await customersTable().where({ id: customerId }).first();
    const tierId = customer ? customer.tier_id : "";

    const violations: LineViolation[] = [];
    let totalQuoteValue = 0;
    let totalQuoteCost = 0;
    let weightedRiskSum = 0;

    // Calculate line totals first
    const lineValues: number[] = [];
    for (const line of lines) {
      const discountedUnitPrice = line.unitPrice * (1 - line.requestedDiscountPercent / 100);
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
      const effectiveCeiling = await this.computeEffectiveDiscountCeiling(tierId, line.categoryId);
      const requestedDiscount = line.requestedDiscountPercent;
      const overByPoints = Math.max(0, requestedDiscount - effectiveCeiling);

      // Line Margin Impact Weight = (lineTotal / totalQuoteValue) * marginSensitivity
      // Lower margin products have higher sensitivity
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

    // Normalized to 0 - 100 scale. If weightedRiskSum is 0, score is strictly 0.
    // If maximum violations (e.g. 50% over ceiling across high impact), risk scales to 100
    const rawScore = Math.min(100, Math.round(weightedRiskSum * 3.5));
    const blendedRiskScore = rawScore;

    const weightedMarginPercent = safeTotalQuoteValue > 0
      ? Number((((safeTotalQuoteValue - totalQuoteCost) / safeTotalQuoteValue) * 100).toFixed(2))
      : 0;

    let riskLabel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let approvalRoute: "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL" = "AUTO_APPROVED";

    if (blendedRiskScore < 30) {
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
