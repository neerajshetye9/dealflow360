import { db } from "../config/database";

export interface DiscountRuleRecord {
  id: string;
  tier_id?: string | null;
  category_id?: string | null;
  max_discount_percent: number;
  min_margin_percent: number;
  requires_approval_above: number;
  created_at: Date;
  updated_at: Date;
}

export const discountRulesTable = () => db<DiscountRuleRecord>("discount_rules");
