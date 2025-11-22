import express from 'express';
import { addRating, getItemRatings, getUserRatingForItem, getOrderItemsRatings } from '../controllers/rating.controllers.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/add', isAuth, addRating);
router.get('/item/:itemId', getItemRatings);
router.get('/user-rating/:itemId/:orderId', isAuth, getUserRatingForItem);
router.get('/order/:orderId', isAuth, getOrderItemsRatings);

export default router;
