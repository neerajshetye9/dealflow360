import { db } from "../config/database";

export interface PriceListRecord {
  id: string;
  name: string;
  currency: string;
  effective_from: Date;
  effective_to?: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PriceListItemRecord {
  id: string;
  price_list_id: string;
  product_id: string;
  variant_id?: string | null;
  custom_price: number;
  created_at: Date;
  updated_at: Date;
}

export const priceListsTable = () => db<PriceListRecord>("price_lists");
export const priceListItemsTable = () => db<PriceListItemRecord>("price_list_items");
