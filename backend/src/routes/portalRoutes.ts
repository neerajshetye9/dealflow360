import { Router } from "express";
import { NegotiationController } from "../controllers/NegotiationController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

// Customer portal relies on token authentication in the URL params
router.get("/:token", NegotiationController.getPortal);
router.post("/:token/counter", NegotiationController.submitCounter);
router.post("/comments", authenticateJwt, NegotiationController.addSalesRepComment);

export const portalRoutes = router;
