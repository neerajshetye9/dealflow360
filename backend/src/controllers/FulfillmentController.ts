import { Request, Response, NextFunction } from "express";
import { FulfillmentAllocationService } from "../services/FulfillmentAllocationService";
import { warehousesTable, warehouseInventoryTable } from "../models/Warehouse.model";

export class FulfillmentController {
  public static async calculateSplit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quotationId } = req.body;
      if (!quotationId) {
        res.status(400).json({ error: "quotationId is required" });
        return;
      }
      const result = await FulfillmentAllocationService.calculateOptimalSplit(quotationId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async confirmAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quotationId, manualOverride } = req.body;
      if (!quotationId) {
        res.status(400).json({ error: "quotationId is required" });
        return;
      }
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const order = await FulfillmentAllocationService.confirmAllocation(
        quotationId,
        !!manualOverride,
        actorId,
        actorIp
      );
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  public static async listOrders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await FulfillmentAllocationService.listFulfillmentOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  public static async getOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const details = await FulfillmentAllocationService.getFulfillmentDetails(id);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  public static async listWarehouses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouses = await warehousesTable().where({ is_active: true }).orderBy("transit_cost_multiplier", "asc");
      const inventory = await warehouseInventoryTable();
      res.status(200).json({ success: true, data: { warehouses, inventory } });
    } catch (error) {
      next(error);
    }
  }
}
