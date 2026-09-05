import { Router } from "express";
import { DiscountRuleController } from "../controllers/DiscountRuleController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

// Live evaluation is accessible to authenticated internal users or inter-service calls
router.post("/evaluate", DiscountRuleController.evaluateLiveDiscount);
router.get("/", authenticateJwt, DiscountRuleController.listRules);

export const discountRuleRoutes = router;
