import { Request, Response, NextFunction } from "express";
import { PriceListService } from "../services/PriceListService";

export class PriceListController {
  public static async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lists = await PriceListService.listPriceLists();
      res.status(200).json({ success: true, data: lists });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priceList = await PriceListService.getPriceListById(req.params.id);
      res.status(200).json({ success: true, data: priceList });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const created = await PriceListService.createPriceList(req.body, actorId, actorIp);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }

  public static async upsertItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priceListId } = req.params;
      const { productId, customPrice, variantId } = req.body;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const item = await PriceListService.upsertPriceListItem(
        priceListId,
        productId,
        customPrice,
        variantId,
        actorId,
        actorIp
      );
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }
}
