import { Request, Response, NextFunction } from "express";
import { NegotiationService } from "../services/NegotiationService";

export class NegotiationController {
  public static async getPortal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const session = await NegotiationService.getPortalSession(token);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  public static async submitCounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { proposedDiscountPercent, notes, comments } = req.body;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const updated = await NegotiationService.submitCounterProposal(
        token,
        proposedDiscountPercent,
        notes,
        comments,
        actorIp
      );

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  public static async addSalesRepComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { negotiationRequestId, commentText, quotationLineId } = req.body;
      const salesRepUserId = req.user?.id || "unknown-rep";
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const comment = await NegotiationService.addSalesRepComment(
        negotiationRequestId,
        salesRepUserId,
        commentText,
        quotationLineId,
        actorIp
      );

      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
}
