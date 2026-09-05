import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { ApiErrorResponse } from "../types";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function globalErrorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    const validationErrorResponse: ApiErrorResponse = {
      success: false,
      error: "Validation failed",
      details: error.flatten().fieldErrors,
      statusCode: 400,
    };
    res.status(400).json(validationErrorResponse);
    return;
  }

  if (error instanceof AppError && error.isOperational) {
    const operationalErrorResponse: ApiErrorResponse = {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    };
    res.status(error.statusCode).json(operationalErrorResponse);
    return;
  }

  logger.error("Unhandled error:", error);

  const serverErrorResponse: ApiErrorResponse = {
    success: false,
    error: "An unexpected internal server error occurred",
    statusCode: 500,
  };
  res.status(500).json(serverErrorResponse);
}
