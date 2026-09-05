import { Router } from "express";
import { PriceListController } from "../controllers/PriceListController";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", PriceListController.list);
router.get("/:id", PriceListController.getById);
router.post("/", authenticateJwt, requireRole("admin"), PriceListController.create);
router.post("/:priceListId/items", authenticateJwt, requireRole("admin"), PriceListController.upsertItem);

export const priceListRoutes = router;
