import { Router } from "express";
import { AuditLogController } from "../controllers/AuditLogController";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", authenticateJwt, requireRole("admin", "finance_director"), AuditLogController.list);
router.post("/", AuditLogController.recordExternal);

export const auditLogRoutes = router;
