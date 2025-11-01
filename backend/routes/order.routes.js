import express from "express"
import { getMyOrders, placeOrder } from "../controllers/order.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { updateOrderStatus } from "../controllers/order.controllers.js";

const orderRouter=express.Router()


orderRouter.post("/place-order",isAuth,placeOrder)
orderRouter.get("/my-orders",isAuth,getMyOrders)
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);


export default orderRouter