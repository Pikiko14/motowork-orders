import { Router } from "express";
import hostValidator from "../middlewares/hostValidator";
import { OrdersController } from "../controllers/orders.controller";
import { initPaymentValidator, orderIdValidator, ordersCreationValidator, orderStatusValidator } from "../validators/orders.validators";
import sessionCheck from "../middlewares/sessions.middleware";
import perMissionMiddleware from "../middlewares/permission.middleware";
import { PaginationValidator } from "../validators/request.validator";

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

/**
 * Init orders payment
 */
router.post(
  "/:id/init-payment",
  hostValidator,
  initPaymentValidator,
  controller.initPayment
);

/**
 * Show order
 */
router.get(
  "/:id",
  hostValidator,
  orderIdValidator,
  controller.showOrder
);

/**
 * Payment web hook
 */
router.post(
  "/payment-webhook",
  controller.validatePayment
);

/**
 * Show order
 */
router.get(
  "/",
  hostValidator,
  sessionCheck,
  perMissionMiddleware('list-orders'),
  PaginationValidator,
  controller.listOrders
);

/**
 * Show order
 */
router.get(
  "/get/count",
  hostValidator,
  sessionCheck,
  perMissionMiddleware('list-orders'),
  controller.countOrders
);

/**
 * Update order
 */
router.put(
  "/:id",
  hostValidator,
  sessionCheck,
  perMissionMiddleware('update-orders'),
  orderIdValidator,
  orderStatusValidator,

  controller.updateOrderStatus
);

// export router
export { router };