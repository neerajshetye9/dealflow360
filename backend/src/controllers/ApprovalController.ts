import { Request, Response, NextFunction } from "express";
import { ApprovalEngineService } from "../services/ApprovalEngineService";
import { DiscountGovernanceService } from "../services/DiscountGovernanceService";

export class ApprovalController {
  /**
   * Atharva -> Neeraj cross-repo endpoint: POST /api/approvals/initiate
   */
  public static async initiate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quotationId, customerId, lines } = req.body;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      let riskResult = req.body.riskResult;
      if (!riskResult && lines && customerId) {
        riskResult = await DiscountGovernanceService.computeBlendedRiskScore(customerId, lines);
      }

      if (!riskResult) {
        res.status(400).json({ success: false, error: "Missing riskResult or lines+customerId for risk computation" });
        return;
      }

      const workflow = await ApprovalEngineService.initiateApprovalWorkflow(quotationId, riskResult, actorId, actorIp);
      res.status(201).json({ success: true, data: workflow });
    } catch (error) {
      next(error);
    }
  }

  public static async listPending(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pending = await ApprovalEngineService.listPendingApprovals();
      res.status(200).json({ success: true, data: pending });
    } catch (error) {
      next(error);
    }
  }

  public static async getForQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const decisions = await ApprovalEngineService.getApprovalsForQuotation(req.params.quotationId);
      res.status(200).json({ success: true, data: decisions });
    } catch (error) {
      next(error);
    }
  }

  public static async decide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { action, reason, reasonCode } = req.body;
      const actorUserId = req.user?.id || "unknown-actor";
      const actorRole = req.user?.role || "sales_manager";
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const result = await ApprovalEngineService.recordApprovalDecision(
        id,
        actorUserId,
        actorRole,
        action,
        reason,
        reasonCode,
        actorIp
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
