import { db } from "../config/database";

export type FulfillmentOrderStatus = "PENDING" | "ALLOCATED" | "PARTIALLY_FULFILLED" | "SHIPPED" | "DELIVERED";

export interface FulfillmentOrderRecord {
  id: string;
  quotation_id: string;
  status: FulfillmentOrderStatus;
  total_shipping_cost: number;
  created_at: Date;
  updated_at: Date;
}

export interface FulfillmentAllocationRecord {
  id: string;
  fulfillment_order_id: string;
  warehouse_id: string;
  product_id: string;
  allocated_quantity: number;
  is_manual_override: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ShipmentRecord {
  id: string;
  fulfillment_order_id: string;
  warehouse_id: string;
  carrier: string;
  tracking_number: string;
  status: "DISPATCHED" | "IN_TRANSIT" | "DELIVERED";
  dispatched_at: Date;
  estimated_delivery?: Date | null;
  delivered_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface BackorderRecord {
  id: string;
  fulfillment_order_id: string;
  product_id: string;
  pending_quantity: number;
  expected_arrival_date?: Date | null;
  status: "BACKORDER" | "ARRIVED" | "ALLOCATED";
  created_at: Date;
  updated_at: Date;
}

export const fulfillmentOrdersTable = () => db<FulfillmentOrderRecord>("fulfillment_orders");
export const fulfillmentAllocationsTable = () => db<FulfillmentAllocationRecord>("fulfillment_allocations");
export const shipmentsTable = () => db<ShipmentRecord>("shipments");
export const backordersTable = () => db<BackorderRecord>("backorders");
