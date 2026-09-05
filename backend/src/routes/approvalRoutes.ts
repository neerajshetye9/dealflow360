import { Router } from "express";
import { ApprovalController } from "../controllers/ApprovalController";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

// Cross-repo quotation submission
router.post("/initiate", ApprovalController.initiate);

router.get("/pending", authenticateJwt, ApprovalController.listPending);
router.get("/quotation/:quotationId", authenticateJwt, ApprovalController.getForQuotation);
router.post(
  "/:id/decide",
  authenticateJwt,
  requireRole("admin", "sales_manager", "finance_director"),
  ApprovalController.decide
);

export const approvalRoutes = router;
