import { Request, Response, NextFunction } from "express";

export function attachAuditContext(req: Request, _res: Response, next: NextFunction): void {
  if (req.user) {
    req.auditContext = {
      actorId: req.user.id,
      actorIp: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown",
    };
  }
  next();
}
