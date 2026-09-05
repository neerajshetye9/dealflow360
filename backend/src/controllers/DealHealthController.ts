import { Request, Response, NextFunction } from "express";
import { DealHealthMonitorService } from "../services/DealHealthMonitorService";

export class DealHealthController {
  public static async getSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DealHealthMonitorService.getDealHealthSummary();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public static async evaluate(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DealHealthMonitorService.evaluateAllDeals();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async nudge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const updated = await DealHealthMonitorService.sendNudgeToSalesRep(id, actorId, actorIp);
      res.status(200).json({ success: true, data: updated, message: "Nudge sent to sales representative" });
    } catch (error) {
      next(error);
    }
  }
}
