import { db } from "../config/database";

export type DealHealthStatus = "HEALTHY" | "STALLED" | "ANOMALY" | "SLIPPAGE";
export type AlertType = "STALLED_DEAL" | "DISCOUNT_ANOMALY" | "DELIVERY_SLIPPAGE";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";
export type AlertStatus = "OPEN" | "RESOLVED" | "NUDGE_SENT";

export interface DealHealthMetricRecord {
  id: string;
  quotation_id: string;
  sales_rep_id: string;
  days_in_current_stage: number;
  days_since_last_activity: number;
  rep_90day_avg_discount: number;
  current_discount_delta: number;
  health_status: DealHealthStatus;
  created_at: Date;
  updated_at: Date;
}

export interface DealAlertRecord {
  id: string;
  quotation_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  created_at: Date;
  updated_at: Date;
}

export const dealHealthMetricsTable = () => db<DealHealthMetricRecord>("deal_health_metrics");
export const dealAlertsTable = () => db<DealAlertRecord>("deal_alerts");
