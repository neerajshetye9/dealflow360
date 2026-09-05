import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/refresh", AuthController.refresh);
router.get("/me", authenticateJwt, AuthController.me);
router.post("/logout", AuthController.logout);

export const authRoutes = router;
