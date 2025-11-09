import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { addItem, editItem, getItemById, deleteItem, getItemByCity, getItemsByShop, searchItems } from "../controllers/item.controllers.js"
import * as uploadModule from '../middlewares/multer.js';
const upload = uploadModule.default ?? uploadModule.upload ?? uploadModule.multer ?? uploadModule;

const itemRouter=express.Router()


itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", isAuth,getItemByCity);
itemRouter.get("/get-by-shop/:shopId", isAuth,getItemsByShop);
itemRouter.get("/search-items", isAuth,searchItems);




export default itemRouter