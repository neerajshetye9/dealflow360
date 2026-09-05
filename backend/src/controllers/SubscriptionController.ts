import { Request, Response, NextFunction } from "express";
import { SubscriptionBillingService } from "../services/SubscriptionBillingService";
import { subscriptionPlansTable } from "../models/Subscription.model";

export class SubscriptionController {
  public static async listPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await subscriptionPlansTable().where({ is_active: true });
      res.status(200).json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  public static async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, planId, seatCount } = req.body;
      if (!customerId || !planId) {
        res.status(400).json({ error: "customerId and planId are required" });
        return;
      }
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const sub = await SubscriptionBillingService.activateSubscription(
        customerId,
        planId,
        seatCount || 1,
        actorId,
        actorIp
      );
      res.status(201).json({ success: true, data: sub });
    } catch (error) {
      next(error);
    }
  }

  public static async modifySeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { newSeatCount } = req.body;
      if (newSeatCount === undefined) {
        res.status(400).json({ error: "newSeatCount is required" });
        return;
      }
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const result = await SubscriptionBillingService.modifySubscriptionSeats(
        id,
        Number(newSeatCount),
        actorId,
        actorIp
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async listActive(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await SubscriptionBillingService.listSubscriptions();
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  public static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actorId = req.user?.id;
      const actorIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const result = await SubscriptionBillingService.cancelSubscription(
        id,
        actorId,
        actorIp
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
