import { Router } from "express";
import { InvoiceController } from "../controllers/InvoiceController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

router.post("/generate", authenticateJwt, InvoiceController.generate);
router.get("/", authenticateJwt, InvoiceController.list);
router.get("/:id", authenticateJwt, InvoiceController.getById);
router.post("/:id/payment", authenticateJwt, InvoiceController.recordPayment);

export const invoiceRoutes = router;
