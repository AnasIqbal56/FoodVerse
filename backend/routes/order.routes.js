import express from "express";
import {
  acceptOrder,
  getCurrentOrder,
  getMyOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
  getDeliveryBoyAssignment,
  sendDeliveryOtp,
  verifyDeliveryOtp,
  initiatePayFastPayment,
  verifyPayFastPayment,
  handlePayFastWebhook,
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

// PayFast payment routes
orderRouter.post("/initiate-payfast-payment", isAuth, initiatePayFastPayment);
orderRouter.post("/verify-payfast-payment/:orderId", isAuth, verifyPayFastPayment);

// PayFast webhook (ITN) - No auth required, PayFast will post here
orderRouter.post("/payfast-webhook", handlePayFastWebhook);

export default orderRouter;
