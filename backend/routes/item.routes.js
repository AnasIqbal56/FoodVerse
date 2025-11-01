import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { addItem, editItem, getItemById, deleteItem, getItemByCity } from "../controllers/item.controllers.js"
import * as uploadModule from '../middlewares/multer.js';
const upload = uploadModule.default ?? uploadModule.upload ?? uploadModule.multer ?? uploadModule;

const itemRouter=express.Router()


itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", getItemByCity);




export default itemRouter