import express from "express"
import { acceptOrder, getCurrentOrder, getMyOrders, placeOrder } from "../controllers/order.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { updateOrderStatus } from "../controllers/order.controllers.js";
import { getDeliveryBoyAssignment } from "../controllers/order.controllers.js";

const orderRouter=express.Router()


orderRouter.post("/place-order",isAuth,placeOrder)
orderRouter.get("/my-orders",isAuth,getMyOrders)
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/accept-order/:assignmentId",isAuth,acceptOrder);
orderRouter.get("/get-current-order",isAuth,getCurrentOrder)


export default orderRouter