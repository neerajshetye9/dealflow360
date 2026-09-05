import { db } from "../config/database";

export interface WarehouseRecord {
  id: string;
  code: string;
  name: string;
  location: string;
  transit_cost_multiplier: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WarehouseInventoryRecord {
  id: string;
  warehouse_id: string;
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_backordered: number;
  created_at: Date;
  updated_at: Date;
}

export type StockMovementType = "INBOUND" | "RESERVATION" | "DISPATCH" | "ADJUSTMENT";

export interface StockMovementRecord {
  id: string;
  warehouse_id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  reference_id?: string | null;
  created_at: Date;
}

export const warehousesTable = () => db<WarehouseRecord>("warehouses");
export const warehouseInventoryTable = () => db<WarehouseInventoryRecord>("warehouse_inventory");
export const stockMovementsTable = () => db<StockMovementRecord>("stock_movements");
