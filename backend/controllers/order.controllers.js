import Order from '../models/order.model.js';
import Shop from '../models/shop.model.js';
import User from '../models/user.model.js';
import DeliveryAssignment from '../models/deliveryAssignment.model.js'; 
import mongoose from 'mongoose';

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
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id.toString() === req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress
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
    }

    await order.save();
    const updatedShopOrder = order.shopOrders.find(o => o.shop.toString() === shopId);
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");

  

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


export const acceptOrder=async(req,res)=>{
  try{
    const {assignmentId}=req.params
    const assignment=await DeliveryAssignment.findById(assignmentId)

    if(!assignment){
      return res.status(400).json({message:"assignment not found"})
    }
    if(assignment.status!=="broadcasted"){
      return res.status(400).json({message:"assignment is expired"})
    }

    const alreadyAssigned=await DeliveryAssignment.findOne({
      assignedTo:req.userId,
      status: { $nin: ["broadcasted", "completed"] }
    })

    if(alreadyAssigned){
      return res.status(400).json({message:"You are already assigned to another order"})
    }

    assignment.assignedTo=req.userId
    assignment.status="assigned"
    assignment.acceptedAt=new Date()
    await assignment.save()

    const order=await Order.findById(assignment.order)
    if(!order){
      return res.status(400).json({message:"Order not found"})
    }

    //const shopOrder=order.shopOrders.find(so=>so._id.equals(assignment.shopOrderId))
    const shopOrder=order.shopOrders.id(assignment.shopOrderId)
    shopOrder.assignedDeliveryBoy=req.userId
    await order.save()
    // await order.populate('shopOrders.assignedDeliveryBoy')

    return res.status(200).json({message:"order accepted"})

  }catch(error){
    return res.status(500).json({message: `accept order error: ${error}`});
  }
}


export const getCurrentOrder=async(req,res)=>{
  try{
    const assignment =await DeliveryAssignment.findOne({
      assignedTo:req.userId,
      status:"accepted"
    })
    .populate("shop","name")
    .populate("assignedTo","fullName email mobile location")
    .populate({
      path:"order",
      populate:[{path:"user",select:"fullName email location mobile"}]
      
    })

    if(!assignment){
      return res.status(400).json({message:"assignment not found"})
    }

    if(!assignment.order){
      return res.status(400).json({message:"order not found"})
    }

    const shopOrder=assignment.order.shopOrders.find(so=>String(so._id)==String(assignment.shopOrderId))
    //const shopOrder=assignment.order.shopOrders.find(so=>so._id==equals(assignment.shopOrderId))

    if(!shopOrder){
      return res.status(400).json({message:"shopOrder not found"})
    }

    let deliveryBoyLocation={lat:null,lon:null}
    if(assignment.assignedTo.location.coordinates.length==2){
      deliveryBoyLocation.lat=assignment.assignedTo.location.coordinates[1]
      deliveryBoyLocation.lon=assignment.assignedTo.location.coordinates[0]
    }
    
    let customerLocation={lat:null,lon:null}
    if(assignment.order.deliveryAddress){
      customerLocation.lat=assignment.order.deliveryAddress.latitude
      customerLocation.lon=assignment.order.deliveryAddress.longitude
    }

    
    return res.status(200).json({
      _id:assignment.order._id,
      user:assignment.order.user,
      shopOrder,
      deliveryAddress:assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation
    })

  }
  catch(error){
    return res.status(500).json({message: `current order error: ${error}`});
  }
}