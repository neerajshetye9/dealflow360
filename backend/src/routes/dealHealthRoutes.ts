import { Router } from "express";
import { DealHealthController } from "../controllers/DealHealthController";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", authenticateJwt, DealHealthController.getSummary);
router.post("/evaluate", authenticateJwt, requireRole("admin", "sales_manager"), DealHealthController.evaluate);
router.post("/:id/nudge", authenticateJwt, requireRole("admin", "sales_manager"), DealHealthController.nudge);

export const dealHealthRoutes = router;
