import Order from '../models/order.model.js';
import Shop from '../models/shop.model.js';
import User from '../models/user.model.js';
import DeliveryAssignment from '../models/deliveryAssignment.model.js';
import mongoose from 'mongoose';
import { sendDeliveryOtpMail } from '../utils/mail.js';
import { createSafepayPayment, verifyWebhookSignature } from '../utils/safepay.js';

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

    shopOrder.status = status;

    let deliveryBoysPayload = [];

    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
            $maxDistance: 5000
          }
        }
      });

      const nearByIds = nearByDeliveryBoys.map(b => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map(id => String(id)));
      const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));
      const candidates = availableBoys.map(b => b._id);

      if (candidates.length === 0) {
        await order.save();
        return res.json({
          message: "Order status updated but there are no available delivery boys"
        });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "broadcasted"
      });

      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo || null;
      shopOrder.assignment = deliveryAssignment._id;

      deliveryBoysPayload = availableBoys.map(b => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile
      }));

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
              items: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.shopOrderItems || [],
              subtotal: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.subtotal || 0
            });
          }
        });
      }
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
    const assignment = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "broadcasted"
    })
      .populate("order")
      .populate("shop");

    const formatted = assignment.map(a => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).shopOrderItems ||
        [],
      subtotal:
        a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).subtotal || 0
    }));

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
    const order = await Order.findById(orderId).populate("user")
    const shopOrder = order.shopOrders.id(shopOrderId)
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderId" })
    }

    if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid/Expired Otp" })
    }

    shopOrder.status = "delivered"
    shopOrder.deliveredAt = Date.now()
    await order.save()
    await DeliveryAssignment.deleteOne(
      {
        order: order._id,
        shopOrder: shopOrder._id,
        assignedTo: shopOrder.assignedDeliveryBoy

      }
    )
    return res.status(200).json({ message: "Order Delivered Successfully" })

  } catch (error) {
    return res.status(500).json({ message: `verify delivery otp error ${error}` });

  }
}

// Initialize Safepay payment
export const initiateSafepayPayment = async (req, res) => {
  try {
    const { cartItems, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
      return res.status(400).json({ message: "Send Complete Delivery Address" });
    }

    // Get user info
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Group items by shop (same as placeOrder)
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

    // Create order with pending payment status
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod: 'online',
      deliveryAddress,
      totalAmount,
      shopOrders,
      payment: {
        status: 'pending',
      }
    });

    // Create Safepay payment session
    const paymentResult = await createSafepayPayment({
      orderId: newOrder._id.toString(),
      amount: totalAmount,
      customerEmail: user.email,
      customerPhone: user.mobile || ''
    });

    if (!paymentResult.success) {
      // Delete the order if payment session creation fails
      await Order.findByIdAndDelete(newOrder._id);
      return res.status(400).json({ 
        message: "Failed to create payment session", 
        error: paymentResult.error 
      });
    }

    // Update order with Safepay token
    newOrder.payment.safepayToken = paymentResult.token;
    newOrder.payment.safepayTracker = paymentResult.token;
    await newOrder.save();

    return res.status(201).json({
      orderId: newOrder._id,
      checkoutUrl: paymentResult.checkoutUrl,
      token: paymentResult.token
    });

  } catch (error) {
    console.error('Initiate Safepay payment error:', error);
    return res.status(500).json({ 
      message: `Payment initiation error: ${error.message}` 
    });
  }
};

// Safepay webhook handler
export const handleSafepayWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers['x-sfpy-signature'] || req.headers['x-safepay-signature'];
    
    console.log('Safepay webhook received:', {
      headers: {
        'content-type': req.headers['content-type'],
        'x-sfpy-signature': signature ? 'present' : 'missing',
      },
      body: webhookData
    });

    // Verify webhook signature for security
    if (signature) {
      const isValid = verifyWebhookSignature(webhookData, signature);
      if (!isValid) {
        console.warn('Webhook signature verification failed');
        // Still process in sandbox, but log the warning
        if (!process.env.SAFEPAY_BASE_URL?.includes('sandbox')) {
          return res.status(401).json({ message: "Invalid webhook signature" });
        }
      }
    }

    // Extract order ID from the webhook (handle different payload structures)
    const orderId = webhookData.tracker?.order_id || 
                    webhookData.order_id || 
                    webhookData.data?.order_id ||
                    webhookData.order?.id ||
                    webhookData.metadata?.order_id;
    
    if (!orderId) {
      console.error('No order ID in webhook. Full payload:', JSON.stringify(webhookData, null, 2));
      return res.status(400).json({ message: "Order ID not found in webhook" });
    }

    // Find order by ID or by safepay token/tracker
    let order = await Order.findById(orderId)
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.owner", "name email mobile socketId")
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .populate("user", "name email mobile socketId");

    // If order not found by ID, try finding by safepay token/tracker
    if (!order) {
      const tracker = webhookData.tracker?.token || 
                     webhookData.tracker || 
                     webhookData.token ||
                     webhookData.data?.token;
      
      if (tracker) {
        order = await Order.findOne({
          $or: [
            { 'payment.safepayToken': tracker },
            { 'payment.safepayTracker': tracker }
          ]
        })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile socketId")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("user", "name email mobile socketId");
      }
    }

    if (!order) {
      console.error('Order not found for webhook. OrderId:', orderId, 'Payload:', JSON.stringify(webhookData, null, 2));
      return res.status(404).json({ message: "Order not found" });
    }

    // Extract payment status from webhook (handle different payload structures)
    const paymentState = webhookData.data?.state || 
                        webhookData.state || 
                        webhookData.status ||
                        webhookData.payment?.state ||
                        webhookData.transaction?.state;
    
    // Extract transaction reference
    const transactionId = webhookData.data?.reference || 
                        webhookData.reference || 
                        webhookData.transaction_id ||
                        webhookData.transaction?.id ||
                        webhookData.id ||
                        webhookData.token;

    console.log('Processing webhook for order:', orderId, 'State:', paymentState);

    // Handle completed/successful payment
    if (paymentState === 'COMPLETED' || 
        paymentState === 'completed' || 
        paymentState === 'SUCCESS' || 
        paymentState === 'success' ||
        paymentState === 'succeeded' ||
        webhookData.event === 'payment.succeeded') {
      
      // Only update if not already paid
      if (order.payment.status !== 'paid') {
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        if (transactionId) {
          order.payment.transactionId = transactionId;
        }
        await order.save();

        console.log('Payment completed for order:', orderId, 'Transaction ID:', transactionId);

        // Send real-time notification to shop owners
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
      }

      return res.status(200).json({ message: "Payment processed successfully" });
    } 
    // Handle failed payment
    else if (paymentState === 'FAILED' || 
             paymentState === 'failed' || 
             paymentState === 'DECLINED' ||
             paymentState === 'declined' ||
             webhookData.event === 'payment.failed') {
      
      if (order.payment.status !== 'failed') {
        order.payment.status = 'failed';
        if (transactionId) {
          order.payment.transactionId = transactionId;
        }
        await order.save();
        console.log('Payment failed for order:', orderId);
      }

      return res.status(200).json({ message: "Payment failed" });
    }

    // For other states or unknown events, just acknowledge
    console.log('Webhook received for order:', orderId, 'with state:', paymentState);
    return res.status(200).json({ message: "Webhook received" });

  } catch (error) {
    console.error('Safepay webhook error:', error);
    return res.status(500).json({ 
      message: `Webhook processing error: ${error.message}` 
    });
  }
};

// Verify payment status (for frontend to check)
export const verifyPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({
      orderId: order._id,
      paymentStatus: order.payment.status,
      paidAt: order.payment.paidAt,
      totalAmount: order.totalAmount,
      order: order
    });

  } catch (error) {
    console.error('Verify payment status error:', error);
    return res.status(500).json({ 
      message: `Payment verification error: ${error.message}` 
    });
  }
};