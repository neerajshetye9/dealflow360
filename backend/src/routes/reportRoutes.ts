import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

router.get("/summary", authenticateJwt, ReportController.getSummary);

export const reportRoutes = router;
