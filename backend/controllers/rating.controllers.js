import Rating from '../models/rating.model.js';
import Item from '../models/item.model.js';
import Order from '../models/order.model.js';

export const addRating = async (req, res) => {
  try {
    const { itemId, orderId, rating, review } = req.body;
    const userId = req.userId;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if item exists in the order
    const itemExistsInOrder = order.shopOrders.some(shopOrder =>
      shopOrder.shopOrderItems.some(orderItem => 
        orderItem.item.toString() === itemId
      )
    );

    if (!itemExistsInOrder) {
      return res.status(400).json({ message: "Item not found in this order" });
    }

    // Check if user already rated this item from this order
    const existingRating = await Rating.findOne({ user: userId, item: itemId, order: orderId });
    
    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      await existingRating.save();

      // Update item average rating
      const item = await Item.findById(itemId);
      const totalRating = (item.rating.average * item.rating.count) - oldRating + rating;
      item.rating.average = totalRating / item.rating.count;
      await item.save();

      return res.status(200).json({ 
        message: "Rating updated successfully",
        rating: existingRating 
      });
    }

    // Create new rating
    const newRating = await Rating.create({
      user: userId,
      item: itemId,
      order: orderId,
      rating,
      review: review || "",
    });

    // Update item rating
    const item = await Item.findById(itemId);
    const newCount = item.rating.count + 1;
    const newAverage = ((item.rating.average * item.rating.count) + rating) / newCount;
    
    item.rating.count = newCount;
    item.rating.average = newAverage;
    await item.save();

    return res.status(201).json({ 
      message: "Rating added successfully",
      rating: newRating 
    });

  } catch (error) {
    console.error("Add rating error:", error);
    return res.status(500).json({ message: `Add rating error: ${error.message}` });
  }
};

export const getItemRatings = async (req, res) => {
  try {
    const { itemId } = req.params;

    const ratings = await Rating.find({ item: itemId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(ratings);
  } catch (error) {
    console.error("Get item ratings error:", error);
    return res.status(500).json({ message: `Get ratings error: ${error.message}` });
  }
};

export const getUserRatingForItem = async (req, res) => {
  try {
    const { itemId, orderId } = req.params;
    const userId = req.userId;

    const rating = await Rating.findOne({ 
      user: userId, 
      item: itemId, 
      order: orderId 
    });

    return res.status(200).json(rating);
  } catch (error) {
    console.error("Get user rating error:", error);
    return res.status(500).json({ message: `Get user rating error: ${error.message}` });
  }
};

export const getOrderItemsRatings = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const ratings = await Rating.find({ 
      user: userId, 
      order: orderId 
    });

    return res.status(200).json(ratings);
  } catch (error) {
    console.error("Get order ratings error:", error);
    return res.status(500).json({ message: `Get order ratings error: ${error.message}` });
  }
};
