import { Request, Response, NextFunction } from "express";
import { ReportingService } from "../services/ReportingService";

export class ReportController {
  public static async getSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await ReportingService.getExecutiveSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
