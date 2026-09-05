import { Request, Response, NextFunction } from "express";
import { DiscountGovernanceService } from "../services/DiscountGovernanceService";
import { discountRulesTable } from "../models/DiscountRule.model";

export class DiscountRuleController {
  /**
   * Evaluates live discount - supports single check or multi-line batch
   * Atharva -> Neeraj cross-repo endpoint: POST /api/discount-rules/evaluate
   */
  public static async evaluateLiveDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, categoryId, requestedDiscountPercent, lines } = req.body;

      if (lines && Array.isArray(lines)) {
        const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(customerId, lines);
        res.status(200).json({ success: true, data: riskResult });
        return;
      }

      // Single line check
      const effectiveCeiling = await DiscountGovernanceService.computeEffectiveDiscountCeiling(customerId, categoryId);
      const isViolation = requestedDiscountPercent > effectiveCeiling;
      const overBy = Math.max(0, requestedDiscountPercent - effectiveCeiling);

      res.status(200).json({
        success: true,
        data: {
          effectiveCeiling,
          isViolation,
          overBy: Number(overBy.toFixed(2)),
          approvalRoute: isViolation ? (overBy > 15 ? "SEQUENTIAL_TWO_LEVEL" : "SALES_MANAGER") : "AUTO_APPROVED",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async listRules(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rules = await discountRulesTable().select("*");
      res.status(200).json({ success: true, data: rules });
    } catch (error) {
      next(error);
    }
  }
}
