import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/categories", ProductController.listCategories);
router.post("/categories", authenticateJwt, requireRole("admin"), ProductController.createCategory);
router.get("/", ProductController.list);
router.get("/:id", ProductController.getById);
router.post("/", authenticateJwt, requireRole("admin"), ProductController.create);
router.patch("/:id", authenticateJwt, requireRole("admin"), ProductController.update);
router.post("/:id/variants", authenticateJwt, requireRole("admin"), ProductController.createVariant);

export const productRoutes = router;
