import Order from '../models/order.model.js';
import Shop from '../models/shop.model.js';
import User from '../models/user.model.js';
import DeliveryAssignment from '../models/deliveryAssignment.model.js';
import mongoose from 'mongoose';
import { sendDeliveryOtpMail, sendPaymentConfirmationMail } from '../utils/mail.js';
import { 
  createPayFastPayment, 
  verifyPayFastSignature,
  validatePayFastIP,
  validatePaymentAmount,
  validatePayFastPayment
} from '../utils/payfast.js';

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

// PayFast Payment Integration - Initiate Payment
export const initiatePayFastPayment = async (req, res) => {
  try {
    const { cartItems, deliveryAddress, totalAmount } = req.body;

    console.log('Initiating PayFast payment:', { totalAmount, cartItemsCount: cartItems?.length });

    // Validation
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
      return res.status(400).json({ message: "Send Complete Delivery Address" });
    }
    if (!totalAmount || totalAmount < 5) {
      return res.status(400).json({ message: "Minimum payment amount is R5.00" });
    }

    // Get user info
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Group items by shop
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

    // Build shop orders
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

    // Create order with pending payment
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

    console.log('Order created:', newOrder._id);

    // Create PayFast payment
    const paymentResult = await createPayFastPayment({
      orderId: newOrder._id.toString(),
      amount: totalAmount,
      customerEmail: user.email,
      customerName: user.name || 'Customer',
      customerPhone: user.mobile || ''
    });

    if (!paymentResult.success) {
      // Delete order if payment creation fails
      await Order.findByIdAndDelete(newOrder._id);
      console.error('PayFast payment creation failed:', paymentResult.error);
      return res.status(400).json({ 
        message: "Failed to create payment", 
        error: paymentResult.error
      });
    }

    // Update order with PayFast reference
    newOrder.payment.payFastOrderId = newOrder._id.toString();
    await newOrder.save();

    console.log('PayFast payment initiated successfully:', {
      orderId: newOrder._id,
      amount: totalAmount
    });

    return res.status(201).json({
      success: true,
      orderId: newOrder._id,
      paymentUrl: paymentResult.paymentUrl,
      formData: paymentResult.formData
    });

  } catch (error) {
    console.error('Initiate PayFast payment error:', error);
    return res.status(500).json({ 
      message: `Payment initiation error: ${error.message}` 
    });
  }
};

// Verify PayFast Payment Status (called from frontend after return)
export const verifyPayFastPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('Verifying payment for order:', orderId);

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Find order
    const order = await Order.findById(orderId)
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.owner", "name email mobile socketId")
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .populate("user", "name email mobile socketId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized access to order" });
    }

    // Check if payment is already processed
    if (order.payment.status === 'paid') {
      console.log('Payment already verified for order:', orderId);
      
      // Send real-time notifications if not sent yet
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

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order: order,
        paymentStatus: 'paid'
      });
    }

    // Update payment status to paid
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    await order.save();

    console.log('Payment marked as paid for order:', orderId);

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

    // Send email confirmation to customer
    try {
      const allItems = order.shopOrders.flatMap(shopOrder =>
        shopOrder.shopOrderItems.map(item => ({
          name: item.name || 'Item',
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

      console.log('Payment confirmation email sent to:', order.user.email);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the payment process if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: order,
      paymentStatus: 'paid'
    });

  } catch (error) {
    console.error('Verify PayFast payment error:', error);
    return res.status(500).json({ 
      message: `Payment verification error: ${error.message}` 
    });
  }
};

// PayFast Webhook Handler (ITN - Instant Transaction Notification)
export const handlePayFastWebhook = async (req, res) => {
  try {
    console.log('=== PayFast ITN Received ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Send 200 OK immediately to prevent retries
    res.status(200).send('OK');
    
    const pfData = req.body;
    
    // Extract order ID from m_payment_id
    const orderId = pfData.m_payment_id;
    if (!orderId) {
      console.error('No order ID in ITN');
      return;
    }

    console.log('Processing ITN for order:', orderId);

    // Security Check 1: Verify Signature
    const signatureValid = verifyPayFastSignature(pfData);
    if (!signatureValid) {
      console.error('❌ Security Check 1 Failed: Invalid signature');
      return;
    }
    console.log('✓ Security Check 1 Passed: Signature valid');

    // Security Check 2: Verify PayFast IP (skip in development)
    if (process.env.NODE_ENV === 'production') {
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const ipValid = await validatePayFastIP(clientIp);
      if (!ipValid) {
        console.error('❌ Security Check 2 Failed: Invalid IP address');
        return;
      }
      console.log('✓ Security Check 2 Passed: IP address valid');
    } else {
      console.log('⚠ Security Check 2 Skipped: Development mode');
    }

    // Find the order
    const order = await Order.findById(orderId)
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.owner", "fullName email mobile socketId")
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .populate("user", "fullName email mobile socketId");

    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    // Security Check 3: Validate payment amount
    const amountValid = validatePaymentAmount(order.totalAmount, pfData.amount_gross);
    if (!amountValid) {
      console.error('❌ Security Check 3 Failed: Amount mismatch');
      console.error('Expected:', order.totalAmount, 'Received:', pfData.amount_gross);
      return;
    }
    console.log('✓ Security Check 3 Passed: Amount matches');

    // Security Check 4: Server-side validation with PayFast
    const serverValid = await validatePayFastPayment(pfData);
    if (!serverValid) {
      console.error('❌ Security Check 4 Failed: Server validation failed');
      return;
    }
    console.log('✓ Security Check 4 Passed: Server validation successful');

    // All checks passed - Process the payment
    console.log('✓ All security checks passed');
    
    // Check payment status
    if (pfData.payment_status !== 'COMPLETE') {
      console.log('Payment not complete, status:', pfData.payment_status);
      
      if (pfData.payment_status === 'CANCELLED') {
        order.payment.status = 'cancelled';
        await order.save();
      }
      return;
    }

    // Update order with payment details
    order.payment.status = 'paid';
    order.payment.pfPaymentId = pfData.pf_payment_id;
    order.payment.payFastOrderId = orderId;
    order.payment.paidAt = new Date();

    // Update shop orders status
    order.shopOrders.forEach(shopOrder => {
      shopOrder.status = 'pending';
    });

    await order.save();

    console.log('✓ Order updated successfully:', orderId);

    // Send real-time notifications to shop owners
    const io = req.app.get('io');
    if (io) {
      order.shopOrders.forEach(shopOrder => {
        const ownerSocketId = shopOrder.owner?.socketId;
        if (ownerSocketId) {
          console.log('Sending notification to shop owner:', shopOrder.shop.name);
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

    // Send email confirmation to customer
    try {
      const allItems = order.shopOrders.flatMap(shopOrder =>
        shopOrder.shopOrderItems.map(item => ({
          name: item.name || 'Item',
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

    console.log('=== PayFast ITN Processing Complete ===');

  } catch (error) {
    console.error('PayFast webhook error:', error);
    // Don't send error response as we already sent 200 OK
  }
};