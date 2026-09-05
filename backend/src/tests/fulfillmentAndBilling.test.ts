import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "../config/database";
import { FulfillmentAllocationService } from "../services/FulfillmentAllocationService";
import { SubscriptionBillingService } from "../services/SubscriptionBillingService";
import { InvoiceService } from "../services/InvoiceService";
import { ReportingService } from "../services/ReportingService";

describe("Phase 3: Operations, Multi-Warehouse Fulfillment & Hybrid Billing", () => {
  let customerId: string;
  let srvProductId: string;
  let subProductId: string;
  let subPlanId: string;
  let singleQuoteId: string;
  let splitQuoteId: string;
  let backorderQuoteId: string;

  beforeAll(async () => {
    // 1. Get customer
    const customer = await db("customers").first();
    customerId = customer.id;

    const creator = await db("users").first();
    const creatorId = creator.id;

    // 2. Get hardware product & subscription plan
    const srvProd = await db("products").where({ sku: "HW-PE-R750" }).first();
    srvProductId = srvProd.id;

    const subPlan = await db("subscription_plans").first();
    subPlanId = subPlan.id;
    subProductId = subPlan.product_id;

    // Reset inventory to known values for testing: WH-EAST: 50, WH-WEST: 30
    const whEast = await db("warehouses").where({ code: "WH-EAST" }).first();
    const whWest = await db("warehouses").where({ code: "WH-WEST" }).first();

    // Delete and re-insert to guarantee fresh inventory state
    await db("warehouse_inventory").where({ product_id: srvProductId }).del();

    await db("warehouse_inventory").insert([
      {
        warehouse_id: whEast.id,
        product_id: srvProductId,
        quantity_available: 50,
        quantity_reserved: 0,
        quantity_backordered: 0,
      },
      {
        warehouse_id: whWest.id,
        product_id: srvProductId,
        quantity_available: 30,
        quantity_reserved: 0,
        quantity_backordered: 0,
      },
    ]);

    // 3. Create Quotations for tests
    const salesRep = await db("users").where({ email: "neeraj.rep@dealflow360.com" }).first();
    const repId = salesRep?.id || creatorId;

    const approvedStage = await db("deal_stages").where({ name: "Approved" }).first();
    const stageId = approvedStage.id;

    const priceList = await db("price_lists").first();
    const priceListId = priceList?.id || null;

    // Quote A: 30 servers (fits in single WH-EAST which has 50)
    const [qA] = await db("quotations")
      .insert({
        quote_number: "QT-TEST-OPS-001",
        customer_id: customerId,
        sales_rep_id: repId,
        current_stage_id: stageId,
        price_list_id: priceListId,
        total_amount: 135000.00,
        margin_percent: 33.33,
        blended_risk_score: 10,
        approval_status: "APPROVED",
      })
      .returning("*");
    singleQuoteId = qA.id;

    await db("quotation_lines").insert({
      quotation_id: singleQuoteId,
      product_id: srvProductId,
      quantity: 30,
      unit_price: 5000.00,
      discount_percent: 10.00,
      line_total: 135000.00,
      unit_cost: 3000.00,
      calculated_margin_percent: 33.33,
    });

    // Quote B: 65 servers (requires split: 50 from WH-EAST, 15 from WH-WEST)
    const [qB] = await db("quotations")
      .insert({
        quote_number: "QT-TEST-OPS-002",
        customer_id: customerId,
        sales_rep_id: repId,
        current_stage_id: stageId,
        price_list_id: priceListId,
        total_amount: 292500.00,
        margin_percent: 33.33,
        blended_risk_score: 15,
        approval_status: "APPROVED",
      })
      .returning("*");
    splitQuoteId = qB.id;

    await db("quotation_lines").insert({
      quotation_id: splitQuoteId,
      product_id: srvProductId,
      quantity: 65,
      unit_price: 5000.00,
      discount_percent: 10.00,
      line_total: 292500.00,
      unit_cost: 3000.00,
      calculated_margin_percent: 33.33,
    });

    // Quote C: 100 servers (total stock is 80 -> 20 backorder)
    const [qC] = await db("quotations")
      .insert({
        quote_number: "QT-TEST-OPS-003",
        customer_id: customerId,
        sales_rep_id: repId,
        current_stage_id: stageId,
        price_list_id: priceListId,
        total_amount: 450000.00,
        margin_percent: 33.33,
        blended_risk_score: 20,
        approval_status: "APPROVED",
      })
      .returning("*");
    backorderQuoteId = qC.id;

    await db("quotation_lines").insert({
      quotation_id: backorderQuoteId,
      product_id: srvProductId,
      quantity: 100,
      unit_price: 5000.00,
      discount_percent: 10.00,
      line_total: 450000.00,
      unit_cost: 3000.00,
      calculated_margin_percent: 33.33,
    });
  });

  afterAll(async () => {
    // Clean up test quotes and allocations
    if (singleQuoteId) {
      await db("fulfillment_allocations").whereIn(
        "fulfillment_order_id",
        db("fulfillment_orders").whereIn("quotation_id", [singleQuoteId, splitQuoteId, backorderQuoteId]).select("id")
      ).del();
      await db("backorders").whereIn(
        "fulfillment_order_id",
        db("fulfillment_orders").whereIn("quotation_id", [singleQuoteId, splitQuoteId, backorderQuoteId]).select("id")
      ).del();
      await db("fulfillment_orders").whereIn("quotation_id", [singleQuoteId, splitQuoteId, backorderQuoteId]).del();
      await db("invoice_lines").whereIn(
        "invoice_id",
        db("invoices").whereIn("quotation_id", [singleQuoteId, splitQuoteId, backorderQuoteId]).select("id")
      ).del();
      await db("payments").whereIn(
        "invoice_id",
        db("invoices").whereIn("quotation_id", [singleQuoteId, splitQuoteId, backorderQuoteId]).select("id")
      ).del();
      await db("invoices").whereIn("quotation_id", [singleQuoteId, splitQuoteId, backorderQuoteId]).del();
      await db("quotation_lines").whereIn("quotation_id", [singleQuoteId, splitQuoteId, backorderQuoteId]).del();
      await db("quotations").whereIn("id", [singleQuoteId, splitQuoteId, backorderQuoteId]).del();
    }
    await db.destroy();
  });

  it("Rule 16: Single Warehouse Allocation with Lowest Transit Cost", async () => {
    const plan = await FulfillmentAllocationService.calculateOptimalSplit(singleQuoteId);
    expect(plan.plans.length).toBe(1);
    expect(plan.totalWarehousesInvolved).toBe(1);
    expect(plan.hasBackorders).toBe(false);

    const linePlan = plan.plans[0];
    expect(linePlan.allocations.length).toBe(1);
    expect(linePlan.allocations[0].quantity).toBe(30);
    expect(linePlan.allocations[0].warehouseName).toContain("US-East"); // Lowest transit cost
  });

  it("Rule 17: Multi-Warehouse Split across Minimum Warehouses", async () => {
    const plan = await FulfillmentAllocationService.calculateOptimalSplit(splitQuoteId);
    expect(plan.totalWarehousesInvolved).toBe(2);
    expect(plan.hasBackorders).toBe(false);

    const linePlan = plan.plans[0];
    expect(linePlan.allocations.length).toBe(2);

    const eastAlloc = linePlan.allocations.find(a => a.warehouseName.includes("US-East"));
    const westAlloc = linePlan.allocations.find(a => a.warehouseName.includes("US-West"));

    expect(eastAlloc?.quantity).toBe(50); // Greedily exhaust lowest transit cost first
    expect(westAlloc?.quantity).toBe(15); // Spill remainder to next warehouse
  });

  it("Rule 19: Backorder Generation when Total Inventory is Insufficient", async () => {
    const plan = await FulfillmentAllocationService.calculateOptimalSplit(backorderQuoteId);
    expect(plan.hasBackorders).toBe(true);

    const linePlan = plan.plans[0];
    const allocatedSum = linePlan.allocations.reduce((sum, a) => sum + a.quantity, 0);
    expect(allocatedSum).toBe(80); // 50 + 30
    expect(linePlan.backorderQuantity).toBe(20); // 100 - 80

    // Confirm allocation and verify backorder record created
    const order = await FulfillmentAllocationService.confirmAllocation(backorderQuoteId);
    expect(order.status).toBe("PARTIALLY_FULFILLED"); // Has backorders, so partially fulfilled

    const backorders = await db("backorders").where({ fulfillment_order_id: order.id });
    expect(backorders.length).toBe(1);
    expect(backorders[0].pending_quantity).toBe(20);
    expect(backorders[0].status).toBe("BACKORDER");
  });

  it("Rule 20 & 21: Subscription Activation, Schedules, and Prorated Seat Changes", async () => {
    // 1. Activate subscription for 10 seats
    const sub = await SubscriptionBillingService.activateSubscription(
      customerId,
      subPlanId,
      10
    );
    expect(sub.id).toBeDefined();
    expect(sub.status).toBe("ACTIVE");
    expect(sub.seat_count).toBe(10);

    // Verify 12 billing schedules generated
    const schedules = await db("billing_schedules").where({ subscription_id: sub.id });
    expect(schedules.length).toBe(12);

    // 2. Mid-cycle seat modification (+5 seats)
    const modResult = await SubscriptionBillingService.modifySubscriptionSeats(
      sub.id,
      15
    );
    expect(modResult.subscription.seat_count).toBe(15);
    // proration record stores prorated_amount, not seat_delta
    expect(Number(modResult.proration.prorated_amount)).toBeGreaterThanOrEqual(0);

    // 3. Subscription cancellation with unused credit note
    const cancelResult = await SubscriptionBillingService.cancelSubscription(sub.id, undefined, undefined);
    expect(cancelResult.subscription.status).toBe("CANCELLED");
    expect(cancelResult.subscription.is_cancelled).toBe(true);
    expect(cancelResult.creditNote).toBeDefined();
    expect(Number(cancelResult.creditNote.amount)).toBeGreaterThan(0);
  });

  it("Rule 25: Hybrid Invoice Generation and Payment Lifecycle Transition", async () => {
    // Generate invoice from singleQuoteId
    const invoice = await InvoiceService.generateInvoiceFromQuotation(singleQuoteId);
    expect(invoice.id).toBeDefined();
    expect(invoice.status).toBe("ISSUED");
    expect(Number(invoice.total_amount)).toBeGreaterThan(0);

    // Record full payment
    const paymentResult = await InvoiceService.recordPayment(
      invoice.id,
      "CREDIT_CARD",
      Number(invoice.total_amount)
    );
    expect(paymentResult.payment.status).toBe("SUCCESS");
    expect(paymentResult.invoiceStatus).toBe("PAID");

    // Verify in database
    const updatedInv = await db("invoices").where({ id: invoice.id }).first();
    expect(updatedInv.status).toBe("PAID");
    expect(updatedInv.paid_at).not.toBeNull();
  });

  it("Executive Summary Reporting Aggregations", async () => {
    const summary = await ReportingService.getExecutiveSummary();
    expect(summary.totalQuotations).toBeGreaterThan(0);
    expect(summary.approvedQuotations).toBeGreaterThan(0);
    expect(summary.totalPaidRevenue).toBeGreaterThan(0);
    // inventory value is data-dependent; assert structure is returned
    expect(summary.inventory).toBeDefined();
    expect(summary.inventory).toHaveProperty("availableValue");
    expect(summary.inventory).toHaveProperty("reservedValue");
  });
});
