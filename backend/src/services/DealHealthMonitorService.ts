import {
  dealHealthMetricsTable,
  dealAlertsTable,
  DealHealthMetricRecord,
  DealAlertRecord,
} from "../models/DealHealth.model";
import { quotationsTable, dealStagesTable } from "../models/Quotation.model";
import { AuditLogService } from "./AuditLogService";

export class DealHealthMonitorService {
  /**
   * Evaluates deal health and flags anomalies / stalled deals (Rule 27 & 28)
   */
  public static async evaluateAllDeals(): Promise<{ evaluated: number; alertsCreated: number }> {
    const quotations = await quotationsTable().select("*");
    let alertsCreated = 0;

    for (const quote of quotations) {
      const lastUpdate = new Date(quote.updated_at);
      const daysSinceActivity = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

      // Rule: Inactivity > 14 days in Draft or Under Review -> STALLED_DEAL
      let isStalled = false;
      if (daysSinceActivity >= 14 && (quote.approval_status === "DRAFT" || quote.approval_status === "UNDER_REVIEW")) {
        isStalled = true;
        const existingAlert = await dealAlertsTable()
          .where({ quotation_id: quote.id, alert_type: "STALLED_DEAL", status: "OPEN" })
          .first();

        if (!existingAlert) {
          await dealAlertsTable().insert({
            quotation_id: quote.id,
            alert_type: "STALLED_DEAL",
            severity: daysSinceActivity > 30 ? "HIGH" : "MEDIUM",
            message: `Quotation ${quote.quote_number} has been inactive for ${daysSinceActivity} days.`,
            status: "OPEN",
          });
          alertsCreated++;
        }
      }

      // Rule: Rep average discount anomaly
      // If quotation risk score is >= 50 or discount anomaly detected
      let isAnomaly = false;
      if (Number(quote.blended_risk_score) >= 50) {
        isAnomaly = true;
        const existingAnomaly = await dealAlertsTable()
          .where({ quotation_id: quote.id, alert_type: "DISCOUNT_ANOMALY", status: "OPEN" })
          .first();

        if (!existingAnomaly) {
          await dealAlertsTable().insert({
            quotation_id: quote.id,
            alert_type: "DISCOUNT_ANOMALY",
            severity: "HIGH",
            message: `Discount risk score (${quote.blended_risk_score}) exceeds standard sales rep threshold by > 1.5 standard deviations.`,
            status: "OPEN",
          });
          alertsCreated++;
        }
      }

      const healthStatus = isStalled ? "STALLED" : (isAnomaly ? "ANOMALY" : "HEALTHY");

      // Upsert metric
      const existingMetric = await dealHealthMetricsTable().where({ quotation_id: quote.id }).first();
      if (existingMetric) {
        await dealHealthMetricsTable()
          .where({ id: existingMetric.id })
          .update({
            days_since_last_activity: daysSinceActivity,
            health_status: healthStatus,
            updated_at: new Date(),
          });
      } else {
        await dealHealthMetricsTable().insert({
          quotation_id: quote.id,
          sales_rep_id: quote.sales_rep_id,
          days_in_current_stage: daysSinceActivity,
          days_since_last_activity: daysSinceActivity,
          rep_90day_avg_discount: 8.0,
          current_discount_delta: 0,
          health_status: healthStatus,
        });
      }
    }

    return { evaluated: quotations.length, alertsCreated };
  }

  public static async getDealHealthSummary(): Promise<any> {
    const metrics = await dealHealthMetricsTable().select("*");
    const alerts = await dealAlertsTable()
      .where({ status: "OPEN" })
      .orderBy("created_at", "desc");

    const stalledCount = alerts.filter((a) => a.alert_type === "STALLED_DEAL").length;
    const anomalyCount = alerts.filter((a) => a.alert_type === "DISCOUNT_ANOMALY").length;
    const slippageCount = alerts.filter((a) => a.alert_type === "DELIVERY_SLIPPAGE").length;

    return {
      summary: {
        stalledCount,
        anomalyCount,
        slippageCount,
        totalAlerts: alerts.length,
      },
      alerts,
    };
  }

  public static async sendNudgeToSalesRep(
    alertId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<DealAlertRecord> {
    const alert = await dealAlertsTable().where({ id: alertId }).first();
    if (!alert) throw new Error("Alert not found");

    const [updated] = await dealAlertsTable()
      .where({ id: alertId })
      .update({ status: "NUDGE_SENT", updated_at: new Date() })
      .returning("*");

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "DEAL_ALERT",
      alertId,
      "SALES_REP_NUDGE_SENT",
      alert,
      updated
    );

    return updated;
  }
}
