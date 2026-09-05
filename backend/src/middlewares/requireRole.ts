import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";
import { AppError } from "./globalErrorHandler";

export function requireRole(...allowedRoles: UserRole[]) {
  return function roleGuard(req: Request, _res: Response, next: NextFunction): void {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }

    const userHasRequiredRole = allowedRoles.includes(req.user.role);

    if (!userHasRequiredRole) {
      return next(
        new AppError(
          403,
          `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
}
