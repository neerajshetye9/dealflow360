import {
  productPairingsTable,
  promotionsTable,
  recommendationHistoryTable,
} from "../models/Recommendation.model";
import { quotationLinesTable, quotationsTable } from "../models/Quotation.model";
import { productsTable, productCategoriesTable } from "../models/Product.model";
import { customersTable } from "../models/Customer.model";
import { DiscountGovernanceService } from "./DiscountGovernanceService";
import { QuotationService } from "./QuotationService";

export interface RecommendationResult {
  productId: string;
  name: string;
  sku: string;
  basePrice: number;
  unitCost: number;
  recommendationType: "UPSELL" | "CROSS_SELL";
  calculatedScore: number;
  projectedMarginImpact: number;
  hasActivePromotion: boolean;
  promotionBonusMultiplier: number;
  loyaltyPreference: number; // 1.0 = neutral, >1.0 = preferential, <1.0 = discounted
}

export class UpsellCrossSellService {
  /**
   * Generates smart Upsell and Cross-sell suggestions (Rules 13, 14, 15)
   * ENhanced: 15% profit guardrail enforcement and loyalty-based preferences
   */
  public static async generateSuggestions(quotationId: string, loyaltyScore: number = 0.0): Promise<RecommendationResult[]> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    const lines = await quotationLinesTable().where({ quotation_id: quotationId });
    if (lines.length === 0) return [];

    const existingProductIds = new Set(lines.map((l) => l.product_id));
    const suggestions: RecommendationResult[] = [];

    // Calculate current quote total and cost
    let currentTotal = 0;
    let currentCost = 0;
    for (const l of lines) {
      currentTotal += Number(l.line_total);
      currentCost += Number(l.unit_cost) * l.quantity;
    }

    // Active promotions map
    const activePromotions = await promotionsTable().where({ is_active: true });
    const promoMap = new Map(activePromotions.map((p) => [p.product_id, p]));

    // Compute relationship multiplier for loyalty-based preferences
    const multiplier = DiscountGovernanceService["computeRelationshipMultiplier"]
      ? DiscountGovernanceService["computeRelationshipMultiplier"](loyaltyScore)
      : 1.0;

    for (const line of lines) {
      // Find affinity pairings
      const pairings = await productPairingsTable()
        .where({ base_product_id: line.product_id })
        .orderBy("affinity_score", "desc");

      for (const pair of pairings) {
        const candidateId = pair.paired_product_id;
        if (existingProductIds.has(candidateId)) continue;

        const candidateProduct = await productsTable().where({ id: candidateId, is_active: true }).first();
        if (!candidateProduct) continue;

        const candPrice = Number(candidateProduct.base_price);
        const candCost = Number(candidateProduct.unit_cost);
        const candMarginPercent = candPrice > 0 ? ((candPrice - candCost) / candPrice) * 100 : 0;

        // **15% PROFIT GUARDRAIL**: Suppress any recommendation that would dilute overall quote margin below 15%
        const simulatedTotal = currentTotal + candPrice;
        const simulatedCost = currentCost + candCost;
        const simulatedQuoteMargin = simulatedTotal > 0
          ? ((simulatedTotal - simulatedCost) / simulatedTotal) * 100
          : 0;

        if (simulatedQuoteMargin < 15.0) {
          // Guardrail: would violate 15% net profit minimum
          continue;
        }

        // Rule 13: Upsell rank = pairing affinity * margin contribution * promotion weight
        // Loyalty preference: loyal customers see preferential upsell rankings
        const promo = promoMap.get(candidateId);
        const promoMultiplier = promo ? Number(promo.rank_bonus_multiplier) : 1.0;
        const marginContributionFactor = Math.max(0.1, candMarginPercent / 100);

        // Base score affinity * margin * promotion
        const baseScore = Number(pair.affinity_score) * marginContributionFactor * promoMultiplier;

        // Apply loyalty preference: loyal customers get shown upsells that maintain margin better
        // Loyalty preference factor: 1.0 + (loyaltyScore * 0.2) = 1.0 to 1.2 range
        const loyaltyPreference = 1.0 + Math.min(0.2, loyaltyScore * 0.3);
        const score = baseScore * loyaltyPreference;

        suggestions.push({
          productId: candidateId,
          name: candidateProduct.name,
          sku: candidateProduct.sku,
          basePrice: candPrice,
          unitCost: candCost,
          recommendationType: "UPSELL",
          calculatedScore: Number(score.toFixed(4)),
          projectedMarginImpact: Number((simulatedQuoteMargin - Number(quotation.margin_percent)).toFixed(2)),
          hasActivePromotion: !!promo,
          promotionBonusMultiplier: promoMultiplier,
          loyaltyPreference: Number(loyaltyPreference.toFixed(2)),
        });

        // Record history
        await recommendationHistoryTable().insert({
          quotation_id: quotationId,
          product_id: candidateId,
          recommendation_type: "UPSELL",
          calculated_score: score,
          was_accepted: false,
          loyalty_score_at_recommendation: loyaltyScore,
        });
      }
    }

    // Deduplicate and sort descending by calculatedScore
    const uniqueMap = new Map<string, RecommendationResult>();
    for (const s of suggestions) {
      if (!uniqueMap.has(s.productId) || uniqueMap.get(s.productId)!.calculatedScore < s.calculatedScore) {
        uniqueMap.set(s.productId, s);
      }
    }

    return Array.from(uniqueMap.values()).sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  /**
   * Accepts a upsell suggestion and adds it to the quotation
   */
  public static async acceptSuggestion(
    quotationId: string,
    productId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<any> {
    const line = await QuotationService.addLineItem(
      quotationId,
      productId,
      1,
      0, // standard price - discount will be recalculated
      null,
      true, // is_upsell = true
      actorId,
      actorIp
    );

    // Mark as accepted in history
    await recommendationHistoryTable()
      .where({ quotation_id: quotationId, product_id: productId })
      .update({ was_accepted: true });

    return line;
  }
}