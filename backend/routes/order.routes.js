import express from "express"
import { getMyOrders, placeOrder } from "../controllers/order.controllers.js"
import isAuth from "../middlewares/isAuth.js"

const orderRouter=express.Router()


orderRouter.post("/place-order",isAuth,placeOrder)
orderRouter.get("/my-orders",isAuth,getMyOrders)



export default orderRouter