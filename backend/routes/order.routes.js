import express from "express";
import {
  acceptOrder,
  getCurrentOrder,
  getMyOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
  getDeliveryBoyAssignment,sendDeliveryOtp,
  verifyDeliveryOtp,
  createPaymentSession,
  verifyPayment,
  cancelPayment,
  safepayWebhook,
} from "../controllers/order.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);

// Safepay payment routes
orderRouter.post("/create-payment-session", isAuth, createPaymentSession);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.post("/cancel-payment", isAuth, cancelPayment);
orderRouter.post("/safepay-webhook", safepayWebhook);

export default orderRouter;
