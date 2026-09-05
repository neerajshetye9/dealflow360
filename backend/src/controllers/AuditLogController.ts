import { Request, Response, NextFunction } from "express";
import { AuditLogService } from "../services/AuditLogService";

export class AuditLogController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityType, entityId, limit } = req.query;
      const logs = await AuditLogService.getAuditLogs(
        entityType as string | undefined,
        entityId as string | undefined,
        limit ? parseInt(limit as string, 10) : 50
      );
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  public static async recordExternal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { actorId, entityType, entityId, action, beforeState, afterState } = req.body;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const record = await AuditLogService.recordEvent(
        actorId || req.user?.id || null,
        actorIp,
        entityType,
        entityId,
        action,
        beforeState,
        afterState
      );

      res.status(201).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }
}
