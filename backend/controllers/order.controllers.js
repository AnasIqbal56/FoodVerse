import Order from '../models/order.model.js';
import Shop from '../models/shop.model.js';
import User from '../models/user.model.js';
import DeliveryAssignment from '../models/deliveryAssignment.model.js';
import mongoose from 'mongoose';
import { sendDeliveryOtpMail, sendPaymentConfirmationMail } from '../utils/mail.js';
import { createPaymentIntent, verifyPaymentStatus } from '../utils/stripe.js';

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    console.log('placeOrder cartItems sample:', Array.isArray(cartItems) ? cartItems.slice(0, 5) : cartItems);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
      return res.status(400).json({ message: "Send Complete Delivery Address" });
    }

    const groupItemsByShop = {};
    cartItems.forEach(item => {
      const shopId = item.shopId || (item.shop && (item.shop._id || item.shop));

      if (!shopId) {
        console.error('Cart item missing shop id:', item);
        throw new Error('Cart item missing shop id');
      }

      const shopIdStr = shopId.toString();
      if (!groupItemsByShop[shopIdStr]) groupItemsByShop[shopIdStr] = [];
      groupItemsByShop[shopIdStr].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate('owner');
        if (!shop) throw new Error(`Shop with id ${shopId} not found`);

        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

        return {
          shop: shop._id,
          owner: shop.owner?._id,
          subtotal,
          shopOrderItems: items.map(i => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name
          }))
        };
      })
    );

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders
    });

    await newOrder.populate("shopOrders.shopOrderItems.item", "name image price");
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile socketId");

    // ========== TRACK ORDER FOR RECOMMENDATIONS ==========
    // Update user's order history and item sales count
    const orderedItemIds = [];
    newOrder.shopOrders.forEach(shopOrder => {
      shopOrder.shopOrderItems.forEach(orderItem => {
        orderedItemIds.push(orderItem.item);
      });
    });

    // Update user's order history
    if (orderedItemIds.length > 0) {
      const user = await User.findById(req.userId);
      if (user) {
        for (const itemId of orderedItemIds) {
          const existingIndex = user.orderHistory.findIndex(
            oh => oh.itemId.toString() === itemId.toString()
          );

          if (existingIndex >= 0) {
            user.orderHistory[existingIndex].timesOrdered += 1;
            user.orderHistory[existingIndex].lastOrderedAt = new Date();
          } else {
            user.orderHistory.push({
              itemId,
              timesOrdered: 1,
              lastOrderedAt: new Date()
            });
          }
        }

        // Auto-update favorite categories
        const Item = (await import('../models/item.model.js')).default;
        const items = await Item.find({ _id: { $in: orderedItemIds } }).select('category');
        items.forEach(item => {
          if (!user.favoriteCategories.includes(item.category)) {
            user.favoriteCategories.push(item.category);
          }
        });

        await user.save();

        // Increment sales count for items
        await Item.updateMany(
          { _id: { $in: orderedItemIds } },
          { $inc: { salesCount: 1 } }
        );
      }
    }

    const io = req.app.get('io')

    if (io) {
      newOrder.shopOrders.forEach(shopOrder => {
        const ownerSocketId = shopOrder.owner?.socketId
        if (ownerSocketId) {
          io.to(ownerSocketId).emit('newOrder', {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment
          })
        }
      })
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error('placeOrder error', error);
    return res.status(500).json({ message: `Place order error ${error.message}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role === "user") {
      // Users can see all their orders including pending payments
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile socketId")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      const orders = await Order.find({ 
        "shopOrders.owner": req.userId,
        // Only show COD orders or paid online orders
        $or: [
          { paymentMethod: "cod" },
          { paymentMethod: "online", "payment.status": "paid" }
        ]
      })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user", "name email mobile socketId")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id.toString() === req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        payment: order.payment // Include payment info for owners
      }));

      return res.status(200).json(filteredOrders);
    } else if (user.role === "deliveryBoy") {
      // Get all completed assignments for this delivery boy
      const completedAssignments = await DeliveryAssignment.find({
        assignedTo: req.userId,
        status: "completed"
      }).distinct("order");

      // Get all orders where delivery boy delivered
      const orders = await Order.find({
        _id: { $in: completedAssignments }
      })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user", "fullName email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .lean();

      // Filter to show only the shop orders that this delivery boy delivered
      const filteredOrders = [];
      for (const order of orders) {
        const deliveredShopOrder = order.shopOrders.find(
          (so) => so.assignedDeliveryBoy && so.assignedDeliveryBoy.toString() === req.userId && so.status === "delivered"
        );
        if (deliveredShopOrder) {
          filteredOrders.push({
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: deliveredShopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress
          });
        }
      }

      return res.status(200).json(filteredOrders);
    }

  } catch (error) {
    return res.status(500).json({ message: `get user order error ${error.message}` });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shopOrder = order.shopOrders.find(
      (shopOrder) => shopOrder.shop.toString() === shopId
    );
    if (!shopOrder)
      return res.status(404).json({ message: "Shop order not found" });

    // Prevent owner from changing status back if already out for delivery
    const currentStatus = shopOrder.status.toLowerCase().trim();
    if (currentStatus === "out of delivery") {
      if (status === "pending" || status === "preparing") {
        return res.status(400).json({ 
          message: "Cannot change status back to pending or preparing once out for delivery" 
        });
      }
    }

    shopOrder.status = status;

    let deliveryBoysPayload = [];

    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      console.log(`[updateOrderStatus] Finding delivery boys near ${latitude}, ${longitude}`);
      
      // First, let's see how many delivery boys exist in total
      const totalDeliveryBoys = await User.countDocuments({ role: "deliveryBoy" });
      console.log(`[updateOrderStatus] Total delivery boys in database: ${totalDeliveryBoys}`);
      
      let nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
            $maxDistance: 5000
          }
        }
      });
      
      console.log(`[updateOrderStatus] Found ${nearByDeliveryBoys.length} delivery boys within 5km`);

      // Fallback: if no boys within 5km, get all online delivery boys
      if (nearByDeliveryBoys.length === 0) {
        console.log(`[updateOrderStatus] No delivery boys within 5km, fetching all online delivery boys`);
        const totalOnline = await User.countDocuments({
          role: "deliveryBoy",
          socketId: { $exists: true, $ne: null }
        });
        console.log(`[updateOrderStatus] Total online delivery boys: ${totalOnline}`);
        
        nearByDeliveryBoys = await User.find({
          role: "deliveryBoy",
          socketId: { $exists: true, $ne: null }
        }).select('_id fullName mobile socketId location');
        
        console.log(`[updateOrderStatus] Fetched ${nearByDeliveryBoys.length} online delivery boys`);
        if (nearByDeliveryBoys.length > 0) {
          console.log(`[updateOrderStatus] Online boys details:`, nearByDeliveryBoys.map(b => ({
            id: b._id,
            name: b.fullName,
            socketId: b.socketId,
            location: b.location.coordinates
          })));
        }
      }

      const nearByIds = nearByDeliveryBoys.map(b => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map(id => String(id)));
      const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));
      const candidates = availableBoys.map(b => b._id);
      
      console.log(`[updateOrderStatus] Available boys after filtering busy ones: ${candidates.length}`);

      deliveryBoysPayload = availableBoys.map(b => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile
      }));

      if (candidates.length > 0) {
        const deliveryAssignment = await DeliveryAssignment.create({
          order: order._id,
          shop: shopOrder.shop,
          shopOrderId: shopOrder._id,
          brodcastedTo: candidates,
          status: "broadcasted"
        });

        shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo || null;
        shopOrder.assignment = deliveryAssignment._id;

        await deliveryAssignment.populate("shop", "name");

        const io = req.app.get('io');
        if (io) {
          candidates.forEach(boyId => {
            const boy = nearByDeliveryBoys.find(b => String(b._id) === String(boyId));
            const boySocketId = boy?.socketId;
            if (boySocketId) {
              io.to(boySocketId).emit('newAssignment', {
                sentTo: boyId.toString(),
                assignmentId: deliveryAssignment._id,
                orderId: deliveryAssignment.order._id,
                shopName: deliveryAssignment.shop.name,
                deliveryAddress: deliveryAssignment.order.deliveryAddress,
                items: Array.isArray(deliveryAssignment.order.shopOrders)
                  ? (deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.shopOrderItems || [])
                  : [],
                subtotal: Array.isArray(deliveryAssignment.order.shopOrders)
                  ? (deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.subtotal || 0)
                  : 0
              });
            }
          });
        }
      }
      // If no candidates, just proceed and return empty availableBoys
    }

    await order.save();
    const updatedShopOrder = order.shopOrders.find(o => o.shop.toString() === shopId);
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");
    await order.populate("user", "socketId");

    const io = req.app.get('io');
    if (io) {
      const userSocketId = order.user?.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit('update-status', {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id
        });
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment || null
    });

  } catch (error) {
    console.error("updateOrderStatus error", error);
    return res.status(500).json({ message: `Order status update error: ${error.message}` });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    console.log(`[getDeliveryBoyAssignment] Fetching assignments for delivery boy: ${deliveryBoyId}`);
    
    const assignment = await DeliveryAssignment.find({
      brodcastedTo: { $in: [deliveryBoyId] },
      status: "broadcasted"
    })
      .populate({
        path: "order",
        select: "shopOrders deliveryAddress"
      })
      .populate({
        path: "shop",
        select: "name"
      });

    console.log(`[getDeliveryBoyAssignment] Found ${assignment.length} total assignments`);

    // Filter out assignments where order was deleted
    const validAssignments = assignment.filter(a => a.order !== null && a.shop !== null);

    console.log(`[getDeliveryBoyAssignment] Found ${validAssignments.length} valid assignments after filtering nulls`);

    const formatted = validAssignments.map(a => {
      let items = [];
      let subtotal = 0;
      let shopOrderName = '';
      
      console.log(`[getDeliveryBoyAssignment] Processing assignment ${a._id}`);
      console.log(`[getDeliveryBoyAssignment] shopOrderId to match: ${a.shopOrderId}`);
      
      if (a.order && Array.isArray(a.order.shopOrders) && a.order.shopOrders.length > 0) {
        console.log(`[getDeliveryBoyAssignment] Order has ${a.order.shopOrders.length} shopOrders`);
        
        // Try both equals and string comparison
        const shopOrder = a.order.shopOrders.find(so => {
          const idMatch = String(so._id) === String(a.shopOrderId);
          console.log(`[getDeliveryBoyAssignment] Comparing ${so._id} with ${a.shopOrderId}: ${idMatch}`);
          return idMatch;
        });
        
        if (shopOrder) {
          console.log(`[getDeliveryBoyAssignment] ✓ Found matching shopOrder!`);
          items = shopOrder.shopOrderItems || [];
          subtotal = shopOrder.subtotal || 0;
          console.log(`[getDeliveryBoyAssignment] shopOrderItems count: ${items.length}, subtotal: ${subtotal}`);
        } else {
          console.log(`[getDeliveryBoyAssignment] ✗ No matching shopOrder found`);
          console.log(`[getDeliveryBoyAssignment] Available shopOrderIds in order:`, a.order.shopOrders.map(so => String(so._id)));
        }
      } else {
        console.log(`[getDeliveryBoyAssignment] Order shopOrders is empty or not array`);
      }
      
      return {
        assignmentId: a._id,
        orderId: a.order._id,
        shopName: a.shop.name,
        deliveryAddress: a.order.deliveryAddress,
        items,
        subtotal
      };
    });

    console.log(`[getDeliveryBoyAssignment] Returning ${formatted.length} formatted assignments`);
    formatted.forEach((f, idx) => {
      console.log(`[getDeliveryBoyAssignment] Assignment ${idx}: items=${f.items.length}, subtotal=${f.subtotal}`);
    });
    
    return res.status(200).json(formatted);
  } catch (error) {
    console.error("getDeliveryBoyAssignment error", error);
    return res
      .status(500)
      .json({
        message: `Get delivery boy assignment error: ${error.message}`
      });
  }
};


export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const assignment = await DeliveryAssignment.findById(assignmentId)

    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" })
    }
    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "assignment is expired" })
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] }
    })

    if (alreadyAssigned) {
      return res.status(400).json({ message: "You are already assigned to another order" })
    }

    assignment.assignedTo = req.userId
    assignment.status = "assigned"
    assignment.acceptedAt = new Date()
    await assignment.save()

    const order = await Order.findById(assignment.order)
    if (!order) {
      return res.status(400).json({ message: "Order not found" })
    }

    //const shopOrder=order.shopOrders.find(so=>so._id.equals(assignment.shopOrderId))
    const shopOrder = order.shopOrders.id(assignment.shopOrderId)
    shopOrder.assignedDeliveryBoy = req.userId
    await order.save()
    // await order.populate('shopOrders.assignedDeliveryBoy')

    return res.status(200).json({ message: "order accepted" })

  } catch (error) {
    return res.status(500).json({ message: `accept order error: ${error}` });
  }
}


export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned"
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }]

      })

    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" })
    }

    if (!assignment.order) {
      return res.status(400).json({ message: "order not found" })
    }

    const shopOrder = assignment.order.shopOrders.find(so => String(so._id) == String(assignment.shopOrderId))
    //const shopOrder=assignment.order.shopOrders.find(so=>so._id==equals(assignment.shopOrderId))

    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" })
    }

    let deliveryBoyLocation = { lat: null, lon: null }
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
    }

    let customerLocation = { lat: null, lon: null }
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude
      customerLocation.lon = assignment.order.deliveryAddress.longitude
    }


    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation
    })

  }
  catch (error) {
    return res.status(500).json({ message: `current order error: ${error}` });
  }
}

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop"
      })

      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User"
      })

      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item"
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);

  } catch (error) {
    console.error("getOrderById error", error);
    return res.status(500).json({ message: `Get order by ID error: ${error.message}` });

  }
}
export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body
    const order = await Order.findById(orderId).populate("user")
    const shopOrder = order.shopOrders.id(shopOrderId)
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderId" })
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    shopOrder.deliveryOtp = otp
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
    await order.save()
    await sendDeliveryOtpMail({ user: order.user, otp })

    return res.status(200).json({ message: `OTP sent successfully to ${order?.user.fullName}` })

  } catch (error) {

    return res.status(500).json({ message: `send delivery otp error: ${error}` });
  }
}
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body
    const order = await Order.findById(orderId)
      .populate("user", "fullName email socketId")
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.owner", "socketId")
    const shopOrder = order.shopOrders.id(shopOrderId)
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderId" })
    }

    // Trim whitespace from both OTP values for comparison
    const trimmedOtp = String(otp || '').trim();
    const storedOtp = String(shopOrder.deliveryOtp || '').trim();
    
    console.log(`[OTP Verification] Comparing OTPs:`, { stored: storedOtp, received: trimmedOtp, expires: shopOrder.otpExpires, now: Date.now() });

    if (storedOtp !== trimmedOtp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid/Expired Otp" })
    }

    shopOrder.status = "delivered"
    shopOrder.deliveredAt = Date.now()
    await order.save()
    
    // Update assignment status to completed instead of deleting
    await DeliveryAssignment.updateOne(
      {
        order: order._id,
        shopOrderId: shopOrder._id,
        assignedTo: shopOrder.assignedDeliveryBoy
      },
      {
        status: "completed"
      }
    )

    // Emit socket event to owner about delivery completion
    const io = req.app.get('io');
    if (io) {
      const ownerSocketId = shopOrder.owner?.socketId;
      if (ownerSocketId) {
        io.to(ownerSocketId).emit('update-status', {
          orderId: order._id,
          shopId: shopOrder.shop._id,
          status: "delivered",
          userId: shopOrder.owner._id
        });
      }

      // Emit to user as well
      const userSocketId = order.user?.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit('update-status', {
          orderId: order._id,
          shopId: shopOrder.shop._id,
          status: "delivered",
          userId: order.user._id
        });
      }
    }

    return res.status(200).json({ message: "Order Delivered Successfully" })

  } catch (error) {
    return res.status(500).json({ message: `verify delivery otp error ${error}` });

  }
}

// Stripe Payment Functions
export const initiateStripePayment = async (req, res) => {
  try {
    const { cartItems, deliveryAddress, totalAmount } = req.body;

    // Validation
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
      return res.status(400).json({ message: 'Send Complete Delivery Address' });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get user
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Group items by shop
    const groupItemsByShop = {};
    cartItems.forEach(item => {
      const shopId = item.shopId || (item.shop && (item.shop._id || item.shop));
      if (!shopId) throw new Error('Cart item missing shop id');
      const shopIdStr = shopId.toString();
      if (!groupItemsByShop[shopIdStr]) groupItemsByShop[shopIdStr] = [];
      groupItemsByShop[shopIdStr].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate('owner');
        if (!shop) throw new Error(`Shop with id ${shopId} not found`);

        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

        return {
          shop: shop._id,
          owner: shop.owner?._id,
          subtotal,
          shopOrderItems: items.map(i => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name
          }))
        };
      })
    );

    // Create order in DB with pending payment
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod: 'online',
      deliveryAddress,
      totalAmount,
      shopOrders,
      payment: { status: 'pending' }
    });

    // Create Stripe Payment Intent
    // Convert to smallest currency unit (paisa for PKR, cents for USD)
    const amountInSmallestUnit = Math.round(totalAmount * 100);

    const paymentResult = await createPaymentIntent({
      amount: amountInSmallestUnit,
      currency: 'pkr', 
      customerEmail: user.email,
      customerName: user.fullName || user.name || user.email,
      orderId: newOrder._id.toString()
    });

    if (!paymentResult.success) {
      // Remove order if payment creation failed
      await Order.findByIdAndDelete(newOrder._id);
      console.error('Stripe payment intent creation failed:', paymentResult.error);
      return res.status(400).json({ 
        message: 'Failed to create payment', 
        error: paymentResult.error 
      });
    }

    // Update order with Stripe payment intent ID
    newOrder.payment.transactionId = paymentResult.paymentIntentId;
    await newOrder.save();

    return res.status(200).json({
      success: true,
      clientSecret: paymentResult.clientSecret,
      orderId: newOrder._id.toString(),
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });

  } catch (error) {
    console.error('Initiate Stripe payment error:', error);
    return res.status(500).json({ 
      message: `Payment initiation error: ${error.message}` 
    });
  }
};

export const confirmStripePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentIntentId } = req.body;

    console.log('Confirming Stripe payment for order:', orderId);

    const order = await Order.findById(orderId)
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.owner", "fullName email mobile socketId")
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .populate("user", "fullName email mobile socketId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized access to order" });
    }

    // Check if payment is already processed
    if (order.payment.status === 'paid') {
      console.log('Payment already confirmed for order:', orderId);
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed",
        order: order
      });
    }

    // Verify payment with Stripe
    const isPaymentSuccessful = await verifyPaymentStatus(paymentIntentId);

    if (!isPaymentSuccessful) {
      return res.status(400).json({ 
        success: false,
        message: "Payment verification failed" 
      });
    }

    // Update payment status to paid
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.transactionId = paymentIntentId;

    // Update shop orders status
    order.shopOrders.forEach(shopOrder => {
      shopOrder.status = 'pending';
    });

    await order.save();

    console.log('Payment confirmed and order updated:', orderId);

    // Send real-time notifications to shop owners
    const io = req.app.get('io');
    if (io) {
      order.shopOrders.forEach(shopOrder => {
        const ownerSocketId = shopOrder.owner?.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit('newOrder', {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment
          });
        }
      });
    }

    // Send payment confirmation email to customer
    try {
      // Collect all items from all shop orders
      const allItems = order.shopOrders.flatMap(shopOrder =>
        shopOrder.shopOrderItems.map(item => ({
          name: item.item?.name || item.name || 'Item',
          quantity: item.quantity,
          price: (item.price * item.quantity).toFixed(2)
        }))
      );

      await sendPaymentConfirmationMail({
        to: order.user.email,
        orderId: order._id.toString(),
        amount: order.totalAmount.toFixed(2),
        customerName: order.user.fullName || 'Customer',
        items: allItems
      });

      console.log('✓ Payment confirmation email sent to:', order.user.email);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the payment process if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      order: order
    });

  } catch (error) {
    console.error('Confirm Stripe payment error:', error);
    return res.status(500).json({ 
      message: `Payment confirmation error: ${error.message}` 
    });
  }
};