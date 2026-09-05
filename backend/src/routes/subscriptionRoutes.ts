import { Router } from "express";
import { SubscriptionController } from "../controllers/SubscriptionController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

router.get("/plans", authenticateJwt, SubscriptionController.listPlans);
router.post("/activate", authenticateJwt, SubscriptionController.activate);
router.get("/active", authenticateJwt, SubscriptionController.listActive);
router.post("/:id/modify-seats", authenticateJwt, SubscriptionController.modifySeats);
router.post("/:id/cancel", authenticateJwt, SubscriptionController.cancel);

export const subscriptionRoutes = router;
