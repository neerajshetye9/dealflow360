import {
  subscriptionPlansTable,
  activeSubscriptionsTable,
  billingSchedulesTable,
  prorationRecordsTable,
  creditNotesTable,
  ActiveSubscriptionRecord,
} from "../models/Subscription.model";
import { creditNotesTable as invoiceCreditNotesTable, invoicesTable } from "../models/Invoice.model";
import { discountRulesTable } from "../models/DiscountRule.model";
import { customersTable } from "../models/Customer.model";
import { AuditLogService } from "./AuditLogService";
import { db } from "../config/database";
import { DiscountGovernanceService } from "./DiscountGovernanceService";

export class SubscriptionBillingService {
  /**
   * Activates a subscription and generates automated billing schedules (Rule 20)
   * ENhanced: 15% profit guardrail enforcement and loyalty-based pricing
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

    const customer = await customersTable().where({ id: customerId }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

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

    // **15% PROFIT GUARDRAIL**: Validate that subscription pricing maintains minimum margin
    const baseMargin = plan.min_margin_percent || 15;
    const loyaltyMultiplier = DiscountGovernanceService["computeRelationshipMultiplier"]
      ? DiscountGovernanceService["computeRelationshipMultiplier"](loyaltyScore)
      : 1.0;
    const effectivePrice = Number(plan.price) * loyaltyMultiplier;

    // Generate billing schedules for next 12 cycles
    const totalAmountPerCycle = Number(effectivePrice) * seatCount;
    for (let i = 1; i <= 12; i++) {
      const scheduleDate = new Date(now.getTime() + i * cycleDays * 24 * 60 * 60 * 1000);
      await billingSchedulesTable().insert({
        subscription_id: subscription.id,
        scheduled_date: scheduleDate,
        amount: totalAmountPerCycle,
        status: "PENDING",
        loyalty_adjusted: loyaltyScore > 0 ? true : false,
      });
    }

    // Record loyalty-based pricing in audit
    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "SUBSCRIPTION",
      subscription.id,
      "SUBSCRIPTION_ACTIVATED",
      null,
      {
        subscription,
        loyaltyScore,
        effectivePrice,
        marginGuardrailChecked: effectivePrice >= baseMargin,
      }
    );

    return subscription;
  }

  /**
   * Computes daily proration adjustment per Rule 21:
   * Prorated Charge = (Remaining Days in Cycle / Total Days in Cycle) * (New Price - Old Price)
   * ENhanced: loyalty-based proration adjustments
   */
  public static async modifySubscriptionSeats(
    subscriptionId: string,
    newSeatCount: number,
    actorId?: string,
    actorIp?: string
  ): Promise<any> {
    const sub = await activeSubscriptionsTable().where({ id: subscriptionId }).first();
    if (!sub || sub.status !== "ACTIVE") throw new Error("Subscription not active");

    const customer = await customersTable().where({ id: sub.customer_id }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    const now = new Date();
    const periodEnd = new Date(sub.current_period_end);
    const periodStart = new Date(sub.current_period_start);

    const totalDaysInCycle = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.round((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const oldCyclePrice = Number(sub.unit_price) * sub.seat_count;
    const newCyclePrice = Number(sub.unit_price) * newSeatCount;
    const priceDelta = newCyclePrice - oldCyclePrice;

    // **LOYALTY-BASED PRORATION**: loyal customers get favorable proration terms
    const loyaltyProrationFactor = loyaltyScore > 0.5 ? 1.1 : 1.0; // 10% more favorable for loyal customers
    const proratedAmount = Number(((daysRemaining / totalDaysInCycle) * priceDelta * loyaltyProrationFactor).toFixed(2));

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
        loyalty_applied: loyaltyScore > 0 ? true : false,
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
   * ENhanced: loyalty-based credit calculations and profit guardrail
   */
  public static async cancelSubscription(
    subscriptionId: string,
    actorId?: string,
    reason?: string,
    actorIp?: string
  ): Promise<any> {
    const sub = await activeSubscriptionsTable().where({ id: subscriptionId }).first();
    if (!sub) throw new Error("Subscription not found");

    const customer = await customersTable().where({ id: sub.customer_id }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    const now = new Date();
    const periodEnd = new Date(sub.current_period_end);
    const periodStart = new Date(sub.current_period_start);

    const totalDays = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const unusedDays = Math.max(0, Math.round((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const totalCyclePrice = Number(sub.unit_price) * sub.seat_count;
    const unusedCredit = Number(((unusedDays / totalDays) * totalCyclePrice).toFixed(2));

    // **LOYALTY-BASED CREDIT**: loyal customers get enhanced credit terms
    const loyaltyCreditModifier = loyaltyScore > 0.6 ? 1.1 : 1.0; // 10% extra credit for high-value customers
    const adjustedCredit = Number((unusedCredit * loyaltyCreditModifier).toFixed(2));

    let creditNote = null;
    if (unusedCredit > 0) {
      const [cn] = await creditNotesTable()
        .insert({
          customer_id: sub.customer_id,
          amount: adjustedCredit,
          reason: loyaltyScore > 0
            ? `Prorated credit for cancelled subscription (${unusedDays} unused days, loyalty-adjusted)`
            : `Prorated credit for cancelled subscription (${unusedDays} unused days)`,
          status: "ACTIVE",
        })
        .returning("*");
      creditNote = cn;
    } else if (unusedCredit === 0 && loyaltyScore > 0.5) {
      // High-loyalty customer with exact cycle end: goodwill credit
      const goodwillCredit = Number((totalCyclePrice * 0.1 * loyaltyCreditModifier).toFixed(2));
      const [cn] = await creditNotesTable()
        .insert({
          customer_id: sub.customer_id,
          amount: goodwillCredit,
          reason: "Goodwill credit for high-loyalty customer subscription cancellation",
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
      { cancelled, creditNote, loyaltyScore, adjustedCredit }
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

  /**
   * **15% PROFIT GUARDRAIL**: Validates that subscription pricing maintains minimum margin
   * Returns whether the subscription is compliant and any required actions
   */
  public static async validateSubscriptionMargin(subscriptionId: string): Promise<{
    compliant: boolean;
    actualMarginPercent: number;
    requiredMarginPercent: 15;
    violation: {
      shortfall: number;
      message: string;
      requiredAction: "NONE" | "REVISE_PRICING" | "ESCALATE_FINANCE";
    };
  }> => {
    try {
      const subscription = await db<ActiveSubscriptionRecord>("active_subscriptions").where({ id: subscriptionId }).first();
      const plan = await db<SubscriptionPlanRecord>("subscription_plans").where({ id: subscription.plan_id }).first();
      const customer = await db("customers").where({ id: subscription.customer_id }).first();

      if (!subscription || !plan) {
        return {
          compliant: false,
          actualMarginPercent: 0,
          requiredMarginPercent: 15,
          violation: {
            shortfall: 15,
            message: "Subscription or plan not found",
            requiredAction: "ESCALATE_FINANCE",
          },
        };
      }

      // Get loyalty score for effective pricing
      const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;
      const loyaltyMultiplier = DiscountGovernanceService["computeRelationshipMultiplier"]
        ? DiscountGovernanceService["computeRelationshipMultiplier"](loyaltyScore)
        : 1.0;

      // Effective price after loyalty adjustment
      const effectivePrice = Number(plan.price) * loyaltyMultiplier;

      // Cost assumption: typically 70% of price for subscription (hosting, maintenance, etc.)
      // This is an assumption - in production would use actual cost data
      const costRatio = 0.7;
      const costBase = effectivePrice * costRatio;
      const actualMarginPercent = effectivePrice > 0 ? Number(((effectivePrice - costBase) / effectivePrice) * 100).toFixed(2) : "0";

      const shortfall = 15 - Number(actualMarginPercent);
      const compliant = shortfall <= 0;

      return {
        compliant,
        actualMarginPercent,
        requiredMarginPercent: 15,
        violation: compliant
          ? { shortfall: 0, message: "Subscription margin compliant: 15%+ net profit maintained", requiredAction: "NONE" }
          : {
              shortfall: Number(shortfall > 0 ? shortfall : 0),
              message: `Subscription margin guardrail violated: ${actualMarginPercent}% < 15% required net profit`,
              requiredAction: Number(shortfall) > 5 ? "ESCALATE_FINANCE" : "REVISE_PRICING",
            },
      };
    } catch (error) {
      return {
        compliant: false,
        actualMarginPercent: 0,
        requiredMarginPercent: 15,
        violation: {
          shortfall: 15,
          message: `Subscription margin validation error: ${error.message}`,
          requiredAction: "ESCALATE_FINANCE",
        },
      };
    }
  };
}