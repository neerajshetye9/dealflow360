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

  public static async triggerReApproval(
    quotationId: string,
    reason: string,
    actorIp?: string
  ): Promise<{ approvalRoute: string; decisions: ApprovalDecisionRecord[] }> {
    const { quotationsTable, quotationLinesTable } = await import("../models/Quotation.model");

    // 1. Update quotation status to UNDER_REVIEW
    await quotationsTable().where({ id: quotationId }).update({
      approval_status: "UNDER_REVIEW",
      updated_at: new Date(),
    });

    // 2. Void existing PENDING decisions
    await approvalDecisionsTable()
      .where({ quotation_id: quotationId, status: "PENDING" })
      .update({
        status: "RETURNED",
        decision_reason: `Superceded by re-approval trigger: ${reason}`,
        decided_at: new Date(),
        updated_at: new Date(),
      });

    // 3. Fetch lines and recalculate risk score
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    const lines = await quotationLinesTable().where({ quotation_id: quotationId });

    if (!quotation) {
      throw new Error(`Quotation not found: ${quotationId}`);
    }

    const lineInputs = lines.map((l) => ({
      productId: l.product_id,
      categoryId: (l as any).category_id || "",
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
      unitCost: Number(l.unit_cost),
      requestedDiscountPercent: Number(l.discount_percent),
    }));

    const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
      quotation.customer_id,
      lineInputs
    );

    // 4. Update quotation risk metrics
    await quotationsTable().where({ id: quotationId }).update({
      blended_risk_score: riskResult.blendedRiskScore,
      margin_percent: riskResult.weightedMarginPercent,
    });

    // 5. Initiate fresh workflow
    const result = await this.initiateApprovalWorkflow(
      quotationId,
      riskResult,
      undefined,
      actorIp
    );

    await AuditLogService.recordEvent(
      null,
      actorIp || "127.0.0.1",
      "QUOTATION",
      quotationId,
      "REAPPROVAL_TRIGGERED",
      null,
      { reason, route: result.approvalRoute, blendedRiskScore: riskResult.blendedRiskScore }
    );

    return result;
  }
}
