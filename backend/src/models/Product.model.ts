import { db } from "../config/database";

export type ProductType = "ONE_TIME" | "SUBSCRIPTION";

export interface ProductCategoryRecord {
  id: string;
  name: string;
  code: string;
  discount_ceiling_percent: number;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  product_type: ProductType;
  base_price: number;
  unit_cost: number;
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductVariantRecord {
  id: string;
  product_id: string;
  variant_name: string;
  sku: string;
  price_adjustment: number;
  attributes: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const productCategoriesTable = () => db<ProductCategoryRecord>("product_categories");
export const productsTable = () => db<ProductRecord>("products");
export const productVariantsTable = () => db<ProductVariantRecord>("product_variants");
