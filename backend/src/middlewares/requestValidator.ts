import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateRequestBody<T>(schema: ZodSchema<T>) {
  return function validationMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      next(parseResult.error);
      return;
    }
    req.body = parseResult.data;
    next();
  };
}

export function validateRequestQuery<T>(schema: ZodSchema<T>) {
  return function queryValidationMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const parseResult = schema.safeParse(req.query);
    if (!parseResult.success) {
      next(parseResult.error);
      return;
    }
    next();
  };
}
