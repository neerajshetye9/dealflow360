import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/ProductService";

export class ProductController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId, search } = req.query;
      const products = await ProductService.listProducts(
        categoryId as string | undefined,
        search as string | undefined
      );
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const details = await ProductService.getProductById(req.params.id);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const product = await ProductService.createProduct(req.body, actorId, actorIp);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const updated = await ProductService.updateProduct(req.params.id, req.body, actorId, actorIp);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  public static async listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductService.listCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  public static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const category = await ProductService.createCategory(req.body, actorId, actorIp);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  public static async createVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const variant = await ProductService.createVariant(req.params.id, req.body, actorId, actorIp);
      res.status(201).json({ success: true, data: variant });
    } catch (error) {
      next(error);
    }
  }
}
