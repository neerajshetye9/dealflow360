import { approvalChainsTable, approvalStepsTable, approvalDecisionsTable, ApprovalDecisionRecord } from "../models/Approval.model";
import { rolesTable, usersTable } from "../models/User.model";
import { DiscountGovernanceService } from "./DiscountGovernanceService";
import { AuditLogService } from "./AuditLogService";
import { BlendedRiskResult, QuotationLineInput, UserRole } from "../types";
import { db } from "../config/database";

export class ApprovalEngineService {
  /**
   * Initiates the approval workflow based on risk evaluation (Rule 7)
   */
  public static async initiateApprovalWorkflow(
    quotationId: string,
    riskResult: BlendedRiskResult,
    actorId?: string,
    actorIp?: string
  ): Promise<{ approvalRoute: string; decisions: ApprovalDecisionRecord[] }> {
    const route = riskResult.approvalRoute;

    if (route === "AUTO_APPROVED") {
      const [autoDecision] = await approvalDecisionsTable()
        .insert({
          quotation_id: quotationId,
          status: "APPROVED",
          decision_reason: "Automatically approved: Blended risk score below threshold (< 30)",
          decided_at: new Date(),
        })
        .returning("*");

      await AuditLogService.recordEvent(
        actorId || null,
        actorIp || "127.0.0.1",
        "QUOTATION",
        quotationId,
        "APPROVAL_AUTO_APPROVED",
        null,
        { riskScore: riskResult.blendedRiskScore }
      );

      return { approvalRoute: route, decisions: [autoDecision] };
    }

    // Find configured chain or create matching steps
    const createdDecisions: ApprovalDecisionRecord[] = [];

    if (route === "SALES_MANAGER") {
      // Level 1: Sales Manager
      const smRole = await rolesTable().where({ name: "sales_manager" }).first();
      const [decision] = await approvalDecisionsTable()
        .insert({
          quotation_id: quotationId,
          status: "PENDING",
          decision_reason: `Requires Sales Manager review (Risk score: ${riskResult.blendedRiskScore})`,
        })
        .returning("*");
      createdDecisions.push(decision);
    } else if (route === "SEQUENTIAL_TWO_LEVEL") {
      // Step 1: Sales Manager
      const [decision1] = await approvalDecisionsTable()
        .insert({
          quotation_id: quotationId,
          status: "PENDING",
          decision_reason: `Level 1/2: Requires Sales Manager review (High Risk score: ${riskResult.blendedRiskScore})`,
        })
        .returning("*");

      // Step 2: Finance Director
      const [decision2] = await approvalDecisionsTable()
        .insert({
          quotation_id: quotationId,
          status: "PENDING",
          decision_reason: `Level 2/2: Requires Finance Director review`,
        })
        .returning("*");

      createdDecisions.push(decision1, decision2);
    }

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION",
      quotationId,
      "APPROVAL_WORKFLOW_INITIATED",
      null,
      { route, riskScore: riskResult.blendedRiskScore, violationsCount: riskResult.violations.length }
    );

    return { approvalRoute: route, decisions: createdDecisions };
  }

  public static async recordApprovalDecision(
    decisionId: string,
    actorUserId: string,
    actorRole: UserRole,
    action: "APPROVE" | "REJECT" | "RETURN_FOR_REVISION",
    reason?: string,
    reasonCode?: string,
    actorIp?: string
  ): Promise<ApprovalDecisionRecord> {
    const decision = await approvalDecisionsTable().where({ id: decisionId }).first();
    if (!decision) {
      throw new Error("Approval decision record not found");
    }

    if (decision.status !== "PENDING") {
      throw new Error(`Decision already finalized with status: ${decision.status}`);
    }

    // Enforce Rule 8: A rejection requires a mandatory reason code and textual explanation
    if (action === "REJECT" && (!reason || !reasonCode)) {
      throw new Error("Rejection requires a mandatory reason code and textual explanation");
    }

    let nextStatus = "APPROVED";
    if (action === "REJECT") nextStatus = "REJECTED";
    if (action === "RETURN_FOR_REVISION") nextStatus = "RETURNED";

    const [updated] = await approvalDecisionsTable()
      .where({ id: decisionId })
      .update({
        status: nextStatus as any,
        approver_id: actorUserId,
        decision_reason: reason || null,
        reason_code: reasonCode || null,
        decided_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");

    await AuditLogService.recordEvent(
      actorUserId,
      actorIp || "127.0.0.1",
      "APPROVAL_DECISION",
      decisionId,
      `APPROVAL_${action}`,
      decision,
      updated
    );

    return updated;
  }

  public static async getApprovalsForQuotation(quotationId: string): Promise<ApprovalDecisionRecord[]> {
    return approvalDecisionsTable().where({ quotation_id: quotationId }).orderBy("created_at", "asc");
  }

  public static async listPendingApprovals(): Promise<any[]> {
    const decisions = await approvalDecisionsTable()
      .where({ status: "PENDING" })
      .orderBy("created_at", "desc");
    return decisions;
  }
}
