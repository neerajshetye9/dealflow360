import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/environment";
import { JwtAccessPayload, AuthenticatedUser } from "../types";
import { AppError } from "./globalErrorHandler";

export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "No authentication token provided"));
  }

  const bearerToken = authorizationHeader.split(" ")[1];

  try {
    const decodedPayload = jwt.verify(bearerToken, env.JWT_ACCESS_SECRET) as JwtAccessPayload;

    req.user = {
      id: decodedPayload.userId,
      email: decodedPayload.email,
      fullName: "",
      role: decodedPayload.role,
    };

    next();
  } catch (jwtVerificationError) {
    next(new AppError(401, "Invalid or expired authentication token"));
  }
}
