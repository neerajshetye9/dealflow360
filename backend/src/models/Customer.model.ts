import { db } from "../config/database";

export type CustomerTierName = "Platinum" | "Gold" | "Silver" | "Standard";

export interface CustomerTierRecord {
  id: string;
  name: CustomerTierName;
  discount_ceiling_percent: number;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerRecord {
  id: string;
  name: string;
  company_name: string;
  email: string;
  tier_id: string;
  credit_rating: string;
  credit_limit: number;
  created_at: Date;
  updated_at: Date;
}

export const customerTiersTable = () => db<CustomerTierRecord>("customer_tiers");
export const customersTable = () => db<CustomerRecord>("customers");
