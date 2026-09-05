import { db } from "../config/database";

export interface ProductPairingRecord {
  id: string;
  base_product_id: string;
  paired_product_id: string;
  co_purchase_count: number;
  affinity_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductRecommendationRuleRecord {
  id: string;
  source_category_id: string;
  target_product_id: string;
  rule_type: "UPSELL" | "CROSS_SELL";
  priority_boost: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PromotionRecord {
  id: string;
  name: string;
  product_id: string;
  discount_bonus_percent: number;
  rank_bonus_multiplier: number;
  starts_at: Date;
  ends_at?: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RecommendationHistoryRecord {
  id: string;
  quotation_id: string;
  product_id: string;
  recommendation_type: "UPSELL" | "CROSS_SELL";
  calculated_score: number;
  was_accepted: boolean;
  created_at: Date;
}

export const productPairingsTable = () => db<ProductPairingRecord>("product_pairings");
export const productRecommendationRulesTable = () => db<ProductRecommendationRuleRecord>("product_recommendation_rules");
export const promotionsTable = () => db<PromotionRecord>("promotions");
export const recommendationHistoryTable = () => db<RecommendationHistoryRecord>("recommendation_history");
