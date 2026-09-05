import { Request, Response, NextFunction } from "express";
import { UpsellCrossSellService } from "../services/UpsellCrossSellService";

export class RecommendationController {
  public static async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const suggestions = await UpsellCrossSellService.generateSuggestions(id);
      res.status(200).json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  }

  public static async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { productId } = req.body;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const line = await UpsellCrossSellService.acceptSuggestion(id, productId, actorId, actorIp);
      res.status(201).json({ success: true, data: line, message: "Upsell item added to quotation" });
    } catch (error) {
      next(error);
    }
  }
}
