import express from "express"
import isAuth from "../middlewares/isAuth.js"
import multer from "multer"
import {createEditShop} from "../controllers/shop.controllers.js"
import {getMyShop} from "../controllers/shop.controllers.js"
import * as uploadModule from "../middlewares/multer.js"
const upload = uploadModule.default ?? uploadModule.upload ?? uploadModule.multer ?? uploadModule


const shopRouter=express.Router()


shopRouter.post("/create-edit",isAuth,upload.single("image"),createEditShop)
shopRouter.get("/get-my",isAuth,getMyShop)


export default shopRouter