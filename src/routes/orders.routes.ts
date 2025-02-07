import { Router } from "express";
import hostValidator from "../middlewares/hostValidator";
import { OrdersController } from "../controllers/orders.controller";
import { ordersCreationValidator } from "../validators/orders.validators";

// init router
const router = Router();

// instance controller
const controller = new OrdersController();

/**
 * Create orders
 */
router.post(
  "/",
  hostValidator,
  ordersCreationValidator,
  controller.createOrders
);

// export router
export { router };