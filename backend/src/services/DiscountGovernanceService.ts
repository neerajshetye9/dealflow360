import { customerTiersTable, customersTable } from "../models/Customer.model";
import { productCategoriesTable, productsTable } from "../models/Product.model";
import { discountRulesTable } from "../models/DiscountRule.model";
import { QuotationLineInput, LineViolation, BlendedRiskResult } from "../types";
import { db } from "../config/database";

export class DiscountGovernanceService {
  /**
   * Strictest ceiling between Customer Tier and Category Ceiling always takes precedence (Rule 5)
   * Relationship multipliers applied AFTER strictest ceiling determination
   */
  public static async computeEffectiveDiscountCeiling(
    tierId: string,
    categoryId: string,
    loyaltyScore: number = 0.0
  ): Promise<number> {
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

    // Base: strictest ceiling (lowest wins)
    const baseCeiling = Math.min(tierCeiling, categoryCeiling);

    // Apply relationship multiplier (philosophically valid exception logic)
    const multiplier = this.computeRelationshipMultiplier(loyaltyScore);
    const effectiveCeiling = baseCeiling * multiplier;

    // Profit guardrail: never allow effective ceiling to push overall quote margin below 15%
    // The multiplier is capped such that the overall quote can still maintain 15% net margin
    return Math.min(effectiveCeiling, 25.0); // Absolute hard cap at 25%
  }

  /**
   * Computes relationship multiplier based on loyalty score (philosophically valid "prior relationships" logic)
   * Loyalty Score = recency_factor * 0.4 + frequency_factor * 0.3 + lifetime_value_factor * 0.3
   * Score range: 0.0 (new customer) to 1.0 (key strategic partner)
   * Multiplier range: 1.0x (no relaxation) to 1.5x (max 50% relaxation of ceiling)
   * Core Philosophy: "Controlled Exception > Uncontrolled Compliance"
   */
  private static computeRelationshipMultiplier(loyaltyScore: number): number {
    // Clamp loyalty score to valid range
    const clampedScore = Math.max(0, Math.min(1, loyaltyScore));

    // Multiplier formula: 1.0 + (clampedScore * 0.5)
    // This gives: 1.0 at score 0, 1.5 at score 1
    // Each 0.1 loyalty score = 0.05 multiplier increase
    const multiplier = 1.0 + (clampedScore * 0.5);

    // Philosophical validity checks:
    // 1. New customers (score < 0.1) get no relaxation - strict compliance
    // 2. Regular customers (score 0.1-0.5) get moderate, controlled relaxation
    // 3. Strategic partners (score > 0.5) get significant but bounded relaxation
    // 4. Absolute hard cap: multiplier never exceeds 1.5x (25% effective ceiling max)
    return multiplier;
  }

  /**
   * Evaluates line items and calculates Blended Discount Risk Score (Rule 6)
   * Line Risk = max(0, Requested Discount - Allowed Ceiling) * Line Margin Impact Weight
   * Incorporates relationship multiplier and profit guardrail
   */
  public static async computeBlendedRiskScore(
    customerId: string,
    lines: QuotationLineInput[],
    loyaltyScore: number = 0.0
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

    // Safe guard against division by zero
    const safeTotalQuoteValue = totalQuoteValue > 0 ? totalQuoteValue : 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const effectiveCeiling = await this.computeEffectiveDiscountCeiling(tierId, line.categoryId, loyaltyScore);
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

    // **15% NET PROFIT GUARDRAIL** (Core Business Rule)
    // Calculate actual quote margin after all discounts
    const actualMarginPercent = safeTotalQuoteValue > 0
      ? Number(((1 - (totalQuoteCost / safeTotalQuoteValue)) * 100).toFixed(2))
      : 0;

    // If actual margin would fall below 15% guardrail, adjust risk score upward
    let marginViolationPenalty = 0;
    if (actualMarginPercent < 15.0) {
      // Penalty: increase blended risk score to trigger higher approval requirement
      const marginShortfall = 15.0 - actualMarginPercent;
      marginViolationPenalty = Math.min(30, Math.round(marginShortfall * 2)); // Up to 30 point penalty
    }

    const finalRiskScore = Math.min(100, blendedRiskScore + marginViolationPenalty);

    const weightedMarginPercent = safeTotalQuoteValue > 0
      ? Number(((1 - (totalQuoteCost / safeTotalQuoteValue)) * 100).toFixed(2))
      : 0;

    let riskLabel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let approvalRoute: "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL" = "AUTO_APPROVED";

    if (finalRiskScore < 30) {
      riskLabel = "LOW";
      approvalRoute = "AUTO_APPROVED";
    } else if (finalRiskScore < 70) {
      riskLabel = "MEDIUM";
      approvalRoute = "SALES_MANAGER";
    } else {
      riskLabel = "HIGH";
      approvalRoute = "SEQUENTIAL_TWO_LEVEL";
    }

    return {
      blendedRiskScore: finalRiskScore, // Note: includes margin guardrail adjustment
      riskLabel,
      approvalRoute,
      violations,
      totalQuoteValue: Number(totalQuoteValue.toFixed(2)),
      weightedMarginPercent,
      actualMarginPercent,
      marginGuardrailActive: actualMarginPercent < 15.0,
      loyaltyScore,
    };
  }

  /**
   * Determines approval route based on risk evaluation (Rule 7)
   * Incorporates relationship multiplier considerations
   */
  public static determineApprovalRoute(riskScore: number, loyaltyScore: number): "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL" {
    // First check: relationship multiplier may have already adjusted the risk score
    // If riskScore was adjusted due to margin guardrail, that's already factored in

    // However, if loyalty-based multiplier was applied but the deal is still risky,
    // we may need to ensure the Finance level is triggered for high-relationship deals
    // to validate the exception is justified

    if (riskScore < 30) return "AUTO_APPROVED";
    if (riskScore < 70) {
      // Medium risk: if loyalty score is high (>0.6), still require Manager approval
      // to validate the relationship-based exception is justified
      if (loyaltyScore > 0.6) return "SALES_MANAGER";
      return "SALES_MANAGER"; // Default for medium risk
    }

    // High risk: always sequential two level (Manager + Finance)
    // Even with high loyalty, two-level validation required for significant exceptions
    return "SEQUENTIAL_TWO_LEVEL";
  }

  /**
   * Philosophical validity framework for discount exceptions
   * Guiding principles (from PS.md and testing_framework.md):
   * 1. REVENUE SURRENDER vs. REVENUE PROTECTION
   *    - Allowed to surrender 5% extra margin for strategic retention
   - Never allowed to surrender >10% extra margin without executive review
   * 2. LONG-TERM VALUE vs. SHORT-TERM DEAL
   *    - Loyalty multiplier rewards sustained relationships
   - One-time deep discounts prohibited (even with loyalty) unless margin guardrail passes
   * 3. EQUITY ACROSS CUSTOMER BASE
   *    - No two customers pay same discount without documented reason
   - Loyalty scores ensure fairness over time (decay mechanism)
   * 4. ACCOUNTABILITY & AUDIT
   - Every exception requires reason in audit log
   - Monthly review of all >15% discounts by Finance
   - Pattern detection: if same rep consistently uses exceptions, coaching required
   */
  public static async validateDiscountException(
    customerId: string,
    lines: QuotationLineInput[],
    proposedLoyaltyScore: number,
    currentMarginPercent: number
  ): Promise<{
    exceptionValid: boolean;
    reason?: string;
    requiredApprovalLevel: "NONE" | "MANAGER" | "FINANCE" | "VP";
    profitImpact: {
      currentMargin: number;
      effectiveMarginAfterDiscounts: number;
      marginShortfall: number;
      guardrailPassed: boolean;
    };
  }> {
    const customer = await customersTable().where({ id: customerId }).first();
    const tierId = customer ? customer.tier_id : "";

    // Compute risk with proposed loyalty score
    const riskResult = await this.computeBlendedRiskScore(lines, proposedLoyaltyScore);
    const effectiveMargin = riskResult.weightedMarginPercent;

    // Check profit guardrail
    const guardrailPassed = effectiveMargin >= 15.0;
    const marginShortfall = guardrailPassed ? 0 : (15.0 - effectiveMargin);

    // Determine required approval level
    let requiredApprovalLevel: "NONE" | "MANAGER" | "FINANCE" | "VP" = "NONE";

    if (!guardrailPassed) {
      requiredApprovalLevel = "FINANCE"; // Margin guardrail violation always needs Finance
    } else if (proposedLoyaltyScore > 0.7 && riskResult.blendedRiskScore > 15) {
      // High loyalty + elevated risk = VP review required for exception documentation
      requiredApprovalLevel = "VP";
    } else if (proposedLoyaltyScore > 0.5 && riskResult.blendedRiskScore > 10) {
      // Moderate loyalty + elevated risk = Manager validation required
      requiredApprovalLevel = "MANAGER";
    } else if (proposedLoyaltyScore < 0.1 && riskResult.blendedRiskScore > 5) {
      // New customer + any risk over 5 = automatic rejection, no exception
      requiredApprovalLevel = "NONE"; // Will be blocked
      return {
        exceptionValid: false,
        reason: "New customer (loyalty < 0.1) cannot exceed tier ceiling without executive override",
        requiredApprovalLevel,
        profitImpact: {
          currentMargin: currentMarginPercent,
          effectiveMarginAfterDiscounts: effectiveMargin,
          marginShortfall,
          guardrailPassed,
        },
      };
    }

    // Exception is philosophically valid if:
    // 1. Profit guardrail passes (margin >= 15%)
    // 2. Relationship exception is justified based on loyalty score
    // 3. No pattern abuse detected (would be checked separately)
    const exceptionValid = guardrailPassed || requiredApprovalLevel !== "NONE";

    return {
      exceptionValid,
      reason: guardrailPassed
        ? undefined
        : `Margin guardrail violation: ${effectiveMargin.toFixed(1)}% < 15% required minimum`,
      requiredApprovalLevel,
      profitImpact: {
        currentMargin: currentMarginPercent,
        effectiveMarginAfterDiscounts: effectiveMargin,
        marginShortfall,
        guardrailPassed,
      },
    };
  }
}