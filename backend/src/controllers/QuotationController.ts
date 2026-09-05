import { Request, Response, NextFunction } from "express";
import { QuotationService } from "../services/QuotationService";

export class QuotationController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { salesRepId, stageId } = req.query;
      const quotations = await QuotationService.listQuotations(
        salesRepId as string | undefined,
        stageId as string | undefined
      );
      res.status(200).json({ success: true, data: quotations });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const details = await QuotationService.getQuotationDetails(req.params.id);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, priceListId } = req.body;
      const salesRepId = req.user?.id || req.body.salesRepId;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const quotation = await QuotationService.createQuotation(salesRepId, customerId, priceListId, actorIp);
      res.status(201).json({ success: true, data: quotation });
    } catch (error) {
      next(error);
    }
  }

  public static async addLine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { productId, quantity, discountPercent, variantId, isUpsell } = req.body;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const line = await QuotationService.addLineItem(
        id,
        productId,
        quantity || 1,
        discountPercent || 0,
        variantId,
        isUpsell || false,
        actorId,
        actorIp
      );

      res.status(201).json({ success: true, data: line });
    } catch (error) {
      next(error);
    }
  }

  public static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const result = await QuotationService.submitForApproval(id, actorId, actorIp);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async revision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const result = await QuotationService.createRevision(id, actorId, reason, actorIp);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
