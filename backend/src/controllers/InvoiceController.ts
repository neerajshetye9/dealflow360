import { Request, Response, NextFunction } from "express";
import { InvoiceService } from "../services/InvoiceService";

export class InvoiceController {
  public static async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quotationId } = req.body;
      if (!quotationId) {
        res.status(400).json({ error: "quotationId is required" });
        return;
      }
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const inv = await InvoiceService.generateInvoiceFromQuotation(
        quotationId,
        actorId,
        actorIp
      );
      res.status(201).json({ success: true, data: inv });
    } catch (error) {
      next(error);
    }
  }

  public static async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoices = await InvoiceService.listInvoices();
      res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const details = await InvoiceService.getInvoiceDetails(id);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  public static async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentMethod, amount } = req.body;
      if (!paymentMethod || amount === undefined) {
        res.status(400).json({ error: "paymentMethod and amount are required" });
        return;
      }
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const result = await InvoiceService.recordPayment(
        id,
        paymentMethod,
        Number(amount),
        actorId,
        actorIp
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
