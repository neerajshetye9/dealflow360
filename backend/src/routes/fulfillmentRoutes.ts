import { Router } from "express";
import { FulfillmentController } from "../controllers/FulfillmentController";
import { authenticateJwt } from "../middlewares/authenticateJwt";

const router = Router();

router.post("/calculate-split", authenticateJwt, FulfillmentController.calculateSplit);
router.post("/confirm", authenticateJwt, FulfillmentController.confirmAllocation);
router.get("/orders", authenticateJwt, FulfillmentController.listOrders);
router.get("/orders/:id", authenticateJwt, FulfillmentController.getOrderDetails);
router.get("/warehouses", authenticateJwt, FulfillmentController.listWarehouses);

export const fulfillmentRoutes = router;
