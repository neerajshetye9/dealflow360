import { negotiationRequestsTable, negotiationCommentsTable, NegotiationRequestRecord, NegotiationCommentRecord } from "../models/Negotiation.model";
import { AuthService } from "./AuthService";
import { DiscountGovernanceService } from "./DiscountGovernanceService";
import { ApprovalEngineService } from "./ApprovalEngineService";
import { AuditLogService } from "./AuditLogService";

export class NegotiationService {
  public static async getPortalSession(portalToken: string): Promise<{
    request: NegotiationRequestRecord;
    comments: NegotiationCommentRecord[];
  }> {
    const { quotationId, negotiationRequestId } = await AuthService.verifyCustomerPortalToken(portalToken);
    const request = await negotiationRequestsTable().where({ id: negotiationRequestId }).first();
    if (!request) {
      throw new Error("Negotiation session not found");
    }

    const comments = await negotiationCommentsTable()
      .where({ negotiation_request_id: negotiationRequestId })
      .orderBy("created_at", "asc");

    return { request, comments };
  }

  public static async submitCounterProposal(
    portalToken: string,
    counterDiscountPercent: number,
    notes?: string,
    comments?: Array<{ quotationLineId?: string; commentText: string }>,
    actorIp?: string
  ): Promise<NegotiationRequestRecord & { needsReapproval?: boolean }> {
    const { negotiationRequestId, quotationId } = await AuthService.verifyCustomerPortalToken(portalToken);
    const current = await negotiationRequestsTable().where({ id: negotiationRequestId }).first();
    if (!current || current.status !== "ACTIVE") {
      throw new Error("Negotiation session is not active for submission");
    }

    const [updated] = await negotiationRequestsTable()
      .where({ id: negotiationRequestId })
      .update({
        status: "SUBMITTED",
        proposed_discount_percent: counterDiscountPercent,
        customer_notes: notes || null,
        updated_at: new Date(),
      })
      .returning("*");

    if (comments && comments.length > 0) {
      for (const c of comments) {
        await negotiationCommentsTable().insert({
          negotiation_request_id: negotiationRequestId,
          quotation_line_id: c.quotationLineId || null,
          author_type: "CUSTOMER",
          comment_text: c.commentText,
        });
      }
    }

    await AuditLogService.recordEvent(
      null,
      actorIp || "127.0.0.1",
      "NEGOTIATION",
      negotiationRequestId,
      "CUSTOMER_COUNTER_PROPOSAL_SUBMITTED",
      current,
      updated
    );

    // Re-approval trigger: Recalculate blended risk & check if counter-proposal
    // exceeds governance thresholds (soul.md 2.3, edge_cases.md CP-002)
    let needsReapproval = false;
    try {
      const { quotationLinesTable: qlTable } = await import("../models/Quotation.model");
      const { quotationsTable: qTable } = await import("../models/Quotation.model");
      const quotation = await qTable().where({ id: quotationId }).first();
      const lines = await qlTable().where({ quotation_id: quotationId });

      if (quotation && lines.length > 0) {
        const lineInputs = lines.map((l: any) => ({
          productId: l.product_id,
          categoryId: l.category_id || "",
          quantity: Number(l.quantity),
          unitPrice: Number(l.unit_price),
          unitCost: Number(l.unit_cost),
          requestedDiscountPercent: counterDiscountPercent,
        }));

        const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
          quotation.customer_id,
          lineInputs
        );

        // If risk score no longer auto-approved OR margin < 15%, force re-approval
        if (riskResult.approvalRoute !== "AUTO_APPROVED" || riskResult.weightedMarginPercent < 15.0) {
          needsReapproval = true;
          // Trigger re-approval by resetting status
          await ApprovalEngineService.triggerReApproval(
            quotationId,
            `Customer counter-proposal: ${counterDiscountPercent}% discount. Blended risk: ${riskResult.blendedRiskScore}, margin: ${riskResult.weightedMarginPercent}%`,
            actorIp || "127.0.0.1"
          );
        }
      }
    } catch (reapprovalErr) {
      // Log but don't block — re-approval is a governance safeguard
      console.error("Re-approval trigger error:", reapprovalErr);
    }

    return { ...updated, needsReapproval };
  }

  public static async addSalesRepComment(
    negotiationRequestId: string,
    salesRepUserId: string,
    commentText: string,
    quotationLineId?: string,
    actorIp?: string
  ): Promise<NegotiationCommentRecord> {
    const [created] = await negotiationCommentsTable()
      .insert({
        negotiation_request_id: negotiationRequestId,
        quotation_line_id: quotationLineId || null,
        author_type: "SALES_REP",
        comment_text: commentText,
      })
      .returning("*");

    await AuditLogService.recordEvent(
      salesRepUserId,
      actorIp || "127.0.0.1",
      "NEGOTIATION_COMMENT",
      created.id,
      "SALES_REP_COMMENT_ADDED",
      null,
      created
    );

    return created;
  }
}
