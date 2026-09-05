import { Router } from "express";
import { QuotationController } from "../controllers/QuotationController";
import { RecommendationController } from "../controllers/RecommendationController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

router.get("/", authenticateJwt, QuotationController.list);
router.get("/:id", authenticateJwt, QuotationController.getById);
router.post("/", authenticateJwt, QuotationController.create);
router.post("/:id/lines", authenticateJwt, QuotationController.addLine);
router.patch("/lines/:lineId", authenticateJwt, QuotationController.updateLine);
router.delete("/lines/:lineId", authenticateJwt, QuotationController.deleteLine);
router.post("/:id/submit", authenticateJwt, QuotationController.submit);
router.post("/:id/revision", authenticateJwt, QuotationController.revision);

// Recommendations nested under quotations
router.get("/:id/recommendations", authenticateJwt, RecommendationController.getSuggestions);
router.post("/:id/recommendations/accept", authenticateJwt, RecommendationController.accept);

export const quotationRoutes = router;
