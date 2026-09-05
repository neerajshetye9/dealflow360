import {
  warehousesTable,
  warehouseInventoryTable,
  stockMovementsTable,
  WarehouseRecord,
} from "../models/Warehouse.model";
import {
  fulfillmentOrdersTable,
  fulfillmentAllocationsTable,
  shipmentsTable,
  backordersTable,
  FulfillmentOrderRecord,
} from "../models/Fulfillment.model";
import { quotationsTable, quotationLinesTable } from "../models/Quotation.model";
import { productsTable } from "../models/Product.model";
import { AuditLogService } from "./AuditLogService";
import { db } from "../config/database";

export interface LineAllocationPlan {
  productId: string;
  productName: string;
  requiredQuantity: number;
  allocations: Array<{
    warehouseId: string;
    warehouseName: string;
    quantity: number;
    transitCostMultiplier: number;
  }>;
  backorderQuantity: number;
}

export interface SplitPlanResult {
  quotationId: string;
  plans: LineAllocationPlan[];
  totalWarehousesInvolved: number;
  hasBackorders: boolean;
  estimatedShippingCost: number;
}

export class FulfillmentAllocationService {
  /**
   * Computes optimal warehouse split according to Rules 16, 17, 18, 19
   */
  public static async calculateOptimalSplit(quotationId: string): Promise<SplitPlanResult> {
    const lines = await quotationLinesTable().where({ quotation_id: quotationId });
    const warehouses = await warehousesTable().where({ is_active: true }).orderBy("transit_cost_multiplier", "asc");

    const plans: LineAllocationPlan[] = [];
    const usedWarehouseIds = new Set<string>();
    let hasBackorders = false;
    let totalShippingCost = 0;

    for (const line of lines) {
      const product = await productsTable().where({ id: line.product_id }).first();
      // Skip subscription / digital services
      if (!product || product.product_type === "SUBSCRIPTION") continue;

      let remainingNeeded = line.quantity;
      const lineAllocations: LineAllocationPlan["allocations"] = [];

      // Rule 16: Check single warehouse with complete stock & lowest transit cost
      let singleWarehouseFound = false;
      for (const wh of warehouses) {
        const inv = await warehouseInventoryTable()
          .where({ warehouse_id: wh.id, product_id: line.product_id })
          .first();

        if (inv && inv.quantity_available >= remainingNeeded) {
          lineAllocations.push({
            warehouseId: wh.id,
            warehouseName: wh.name,
            quantity: remainingNeeded,
            transitCostMultiplier: Number(wh.transit_cost_multiplier),
          });
          usedWarehouseIds.add(wh.id);
          totalShippingCost += 50 * Number(wh.transit_cost_multiplier);
          remainingNeeded = 0;
          singleWarehouseFound = true;
          break;
        }
      }

      // Rule 17: Multi-warehouse split across minimum warehouses
      if (!singleWarehouseFound) {
        for (const wh of warehouses) {
          if (remainingNeeded <= 0) break;

          const inv = await warehouseInventoryTable()
            .where({ warehouse_id: wh.id, product_id: line.product_id })
            .first();

          if (inv && inv.quantity_available > 0) {
            const take = Math.min(inv.quantity_available, remainingNeeded);
            lineAllocations.push({
              warehouseId: wh.id,
              warehouseName: wh.name,
              quantity: take,
              transitCostMultiplier: Number(wh.transit_cost_multiplier),
            });
            usedWarehouseIds.add(wh.id);
            totalShippingCost += 50 * Number(wh.transit_cost_multiplier);
            remainingNeeded -= take;
          }
        }
      }

      // Rule 19: Backorder if total stock across all warehouses is insufficient
      let backorderQty = 0;
      if (remainingNeeded > 0) {
        backorderQty = remainingNeeded;
        hasBackorders = true;
      }

      plans.push({
        productId: line.product_id,
        productName: product.name,
        requiredQuantity: line.quantity,
        allocations: lineAllocations,
        backorderQuantity: backorderQty,
      });
    }

    return {
      quotationId,
      plans,
      totalWarehousesInvolved: usedWarehouseIds.size,
      hasBackorders,
      estimatedShippingCost: Number(totalShippingCost.toFixed(2)),
    };
  }

  /**
   * Confirms split allocation, reserves inventory atomically, creates backorders if needed
   */
  public static async confirmAllocation(
    quotationId: string,
    manualOverride = false,
    actorId?: string,
    actorIp?: string
  ): Promise<FulfillmentOrderRecord> {
    const splitPlan = await this.calculateOptimalSplit(quotationId);

    const [order] = await fulfillmentOrdersTable()
      .insert({
        quotation_id: quotationId,
        status: splitPlan.hasBackorders ? "PARTIALLY_FULFILLED" : "ALLOCATED",
        total_shipping_cost: splitPlan.estimatedShippingCost,
      })
      .returning("*");

    for (const plan of splitPlan.plans) {
      for (const alloc of plan.allocations) {
        // Record allocation
        await fulfillmentAllocationsTable().insert({
          fulfillment_order_id: order.id,
          warehouse_id: alloc.warehouseId,
          product_id: plan.productId,
          allocated_quantity: alloc.quantity,
          is_manual_override: manualOverride,
        });

        // Reserve inventory atomically
        await warehouseInventoryTable()
          .where({ warehouse_id: alloc.warehouseId, product_id: plan.productId })
          .decrement("quantity_available", alloc.quantity)
          .increment("quantity_reserved", alloc.quantity);

        // Record stock movement
        await stockMovementsTable().insert({
          warehouse_id: alloc.warehouseId,
          product_id: plan.productId,
          movement_type: "RESERVATION",
          quantity: alloc.quantity,
          reference_id: order.id,
        });
      }

      // Record backorder if any
      if (plan.backorderQuantity > 0) {
        const expectedArrival = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
        await backordersTable().insert({
          fulfillment_order_id: order.id,
          product_id: plan.productId,
          pending_quantity: plan.backorderQuantity,
          expected_arrival_date: expectedArrival,
          status: "BACKORDER",
        });
      }
    }

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "FULFILLMENT_ORDER",
      order.id,
      "FULFILLMENT_ALLOCATED",
      null,
      order
    );

    return order;
  }

  public static async dispatchShipment(
    fulfillmentOrderId: string,
    warehouseId: string,
    carrier: string,
    trackingNumber: string,
    actorId?: string,
    actorIp?: string
  ): Promise<any> {
    const [shipment] = await shipmentsTable()
      .insert({
        fulfillment_order_id: fulfillmentOrderId,
        warehouse_id: warehouseId,
        carrier,
        tracking_number: trackingNumber,
        status: "DISPATCHED",
        dispatched_at: new Date(),
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      })
      .returning("*");

    // Update allocations stock movements to DISPATCH
    const allocations = await fulfillmentAllocationsTable()
      .where({ fulfillment_order_id: fulfillmentOrderId, warehouse_id: warehouseId });

    for (const a of allocations) {
      await warehouseInventoryTable()
        .where({ warehouse_id: warehouseId, product_id: a.product_id })
        .decrement("quantity_reserved", a.allocated_quantity);

      await stockMovementsTable().insert({
        warehouse_id: warehouseId,
        product_id: a.product_id,
        movement_type: "DISPATCH",
        quantity: a.allocated_quantity,
        reference_id: shipment.id,
      });
    }

    await fulfillmentOrdersTable()
      .where({ id: fulfillmentOrderId })
      .update({ status: "SHIPPED", updated_at: new Date() });

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "SHIPMENT",
      shipment.id,
      "SHIPMENT_DISPATCHED",
      null,
      shipment
    );

    return shipment;
  }

  public static async listFulfillmentOrders(): Promise<any[]> {
    const orders = await db("fulfillment_orders as fo")
      .join("quotations as q", "fo.quotation_id", "q.id")
      .join("customers as c", "q.customer_id", "c.id")
      .select(
        db.raw('fo.*, q.quote_number as "quoteNumber", c.company_name as "customerCompanyName"')
      )
      .orderBy("fo.created_at", "desc");
    return orders;
  }

  public static async getFulfillmentDetails(id: string): Promise<any> {
    const order = await fulfillmentOrdersTable().where({ id }).first();
    if (!order) throw new Error("Fulfillment order not found");

    const allocations = await db("fulfillment_allocations as fa")
      .join("warehouses as w", "fa.warehouse_id", "w.id")
      .join("products as p", "fa.product_id", "p.id")
      .where({ "fa.fulfillment_order_id": id })
      .select(
        db.raw('fa.*, w.name as "warehouseName", w.location as "warehouseLocation", p.name as "productName", p.sku as "productSku"')
      );

    const shipments = await shipmentsTable().where({ fulfillment_order_id: id });
    const backorders = await backordersTable().where({ fulfillment_order_id: id });

    return { order, allocations, shipments, backorders };
  }
}
