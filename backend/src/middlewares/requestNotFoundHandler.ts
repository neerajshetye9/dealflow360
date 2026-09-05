import { Request, Response } from "express";
import { ApiErrorResponse } from "../types";

export function requestNotFoundHandler(req: Request, res: Response): void {
  const notFoundResponse: ApiErrorResponse = {
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: 404,
  };
  res.status(404).json(notFoundResponse);
}
