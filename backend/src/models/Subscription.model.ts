import { db } from "../config/database";

export type BillingCadence = "MONTHLY" | "QUARTERLY" | "ANNUAL";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface SubscriptionPlanRecord {
  id: string;
  product_id: string;
  name: string;
  billing_cadence: BillingCadence;
  price: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ActiveSubscriptionRecord {
  id: string;
  customer_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: Date;
  current_period_start: Date;
  current_period_end: Date;
  next_billing_date: Date;
  seat_count: number;
  unit_price: number;
  is_cancelled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BillingScheduleRecord {
  id: string;
  subscription_id: string;
  scheduled_date: Date;
  amount: number;
  status: "PENDING" | "INVOICED" | "SKIPPED";
  created_at: Date;
  updated_at: Date;
}

export interface ProrationRecord {
  id: string;
  subscription_id: string;
  adjustment_type: "TIER_UPGRADE" | "SEAT_ADDITION" | "DOWNGRADE";
  old_price: number;
  new_price: number;
  days_remaining: number;
  total_days_in_cycle: number;
  prorated_amount: number;
  effective_date: Date;
  created_at: Date;
  updated_at: Date;
}

export const subscriptionPlansTable = () => db<SubscriptionPlanRecord>("subscription_plans");
export const activeSubscriptionsTable = () => db<ActiveSubscriptionRecord>("active_subscriptions");
export const billingSchedulesTable = () => db<BillingScheduleRecord>("billing_schedules");
export const prorationRecordsTable = () => db<ProrationRecord>("proration_records");
