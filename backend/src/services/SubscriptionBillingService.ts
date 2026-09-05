import {
  subscriptionPlansTable,
  activeSubscriptionsTable,
  billingSchedulesTable,
  prorationRecordsTable,
  ActiveSubscriptionRecord,
} from "../models/Subscription.model";
import { creditNotesTable } from "../models/Invoice.model";
import { AuditLogService } from "./AuditLogService";
import { db } from "../config/database";

export class SubscriptionBillingService {
  /**
   * Activates a subscription and generates automated billing schedules (Rule 20)
   */
  public static async activateSubscription(
    customerId: string,
    planId: string,
    seatCount = 1,
    actorId?: string,
    actorIp?: string
  ): Promise<ActiveSubscriptionRecord> {
    const plan = await subscriptionPlansTable().where({ id: planId }).first();
    if (!plan) throw new Error("Subscription plan not found");

    const now = new Date();
    const cycleDays = plan.billing_cadence === "ANNUAL" ? 365 : 30;
    const periodEnd = new Date(now.getTime() + cycleDays * 24 * 60 * 60 * 1000);

    const [subscription] = await activeSubscriptionsTable()
      .insert({
        customer_id: customerId,
        plan_id: planId,
        status: "ACTIVE",
        starts_at: now,
        current_period_start: now,
        current_period_end: periodEnd,
        next_billing_date: periodEnd,
        seat_count: seatCount,
        unit_price: Number(plan.price),
        is_cancelled: false,
      })
      .returning("*");

    // Generate billing schedules for next 12 cycles
    const totalAmountPerCycle = Number(plan.price) * seatCount;
    for (let i = 1; i <= 12; i++) {
      const scheduleDate = new Date(now.getTime() + i * cycleDays * 24 * 60 * 60 * 1000);
      await billingSchedulesTable().insert({
        subscription_id: subscription.id,
        scheduled_date: scheduleDate,
        amount: totalAmountPerCycle,
        status: "PENDING",
      });
    }

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "SUBSCRIPTION",
      subscription.id,
      "SUBSCRIPTION_ACTIVATED",
      null,
      subscription
    );

    return subscription;
  }

  /**
   * Computes daily proration adjustment per Rule 21:
   * Prorated Charge = (Remaining Days in Cycle / Total Days in Cycle) * (New Price - Old Price)
   */
  public static async modifySubscriptionSeats(
    subscriptionId: string,
    newSeatCount: number,
    actorId?: string,
    actorIp?: string
  ): Promise<any> {
    const sub = await activeSubscriptionsTable().where({ id: subscriptionId }).first();
    if (!sub || sub.status !== "ACTIVE") throw new Error("Subscription not active");

    const now = new Date();
    const periodEnd = new Date(sub.current_period_end);
    const periodStart = new Date(sub.current_period_start);

    const totalDaysInCycle = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.round((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const oldCyclePrice = Number(sub.unit_price) * sub.seat_count;
    const newCyclePrice = Number(sub.unit_price) * newSeatCount;
    const priceDelta = newCyclePrice - oldCyclePrice;

    const proratedAmount = Number(((daysRemaining / totalDaysInCycle) * priceDelta).toFixed(2));

    const [proration] = await prorationRecordsTable()
      .insert({
        subscription_id: subscriptionId,
        adjustment_type: newSeatCount > sub.seat_count ? "SEAT_ADDITION" : "DOWNGRADE",
        old_price: oldCyclePrice,
        new_price: newCyclePrice,
        days_remaining: daysRemaining,
        total_days_in_cycle: totalDaysInCycle,
        prorated_amount: proratedAmount,
        effective_date: now,
      })
      .returning("*");

    const [updatedSub] = await activeSubscriptionsTable()
      .where({ id: subscriptionId })
      .update({ seat_count: newSeatCount, updated_at: new Date() })
      .returning("*");

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "SUBSCRIPTION",
      subscriptionId,
      "SUBSCRIPTION_SEATS_MODIFIED",
      sub,
      { updatedSub, proration }
    );

    return { subscription: updatedSub, proration };
  }

  /**
   * Rule 22: Cancellation workflow with credit note for unused prepaid days
   */
  public static async cancelSubscription(
    subscriptionId: string,
    actorId?: string,
    reason?: string,
    actorIp?: string
  ): Promise<any> {
    const sub = await activeSubscriptionsTable().where({ id: subscriptionId }).first();
    if (!sub) throw new Error("Subscription not found");

    const now = new Date();
    const periodEnd = new Date(sub.current_period_end);
    const periodStart = new Date(sub.current_period_start);

    const totalDays = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const unusedDays = Math.max(0, Math.round((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const totalCyclePrice = Number(sub.unit_price) * sub.seat_count;
    const unusedCredit = Number(((unusedDays / totalDays) * totalCyclePrice).toFixed(2));

    let creditNote = null;
    if (unusedCredit > 0) {
      const [cn] = await creditNotesTable()
        .insert({
          customer_id: sub.customer_id,
          amount: unusedCredit,
          reason: "Prorated credit for cancelled subscription (" + unusedDays + " unused days)",
          status: "ACTIVE",
        })
        .returning("*");
      creditNote = cn;
    }

    const [cancelled] = await activeSubscriptionsTable()
      .where({ id: subscriptionId })
      .update({
        status: "CANCELLED",
        is_cancelled: true,
        updated_at: new Date(),
      })
      .returning("*");

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "SUBSCRIPTION",
      subscriptionId,
      "SUBSCRIPTION_CANCELLED",
      sub,
      { cancelled, creditNote }
    );

    return { subscription: cancelled, creditNote };
  }

  public static async listSubscriptions(): Promise<any[]> {
    const list = await db("active_subscriptions as sub")
      .join("customers as c", "sub.customer_id", "c.id")
      .join("subscription_plans as p", "sub.plan_id", "p.id")
      .select(
        db.raw('sub.*, c.company_name as "customerCompanyName", p.name as "planName", p.billing_cadence as "billingCadence"')
      )
      .orderBy("sub.created_at", "desc");
    return list;
  }
}
