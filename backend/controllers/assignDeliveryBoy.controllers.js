// Assign delivery boy to an order for a specific shop
import Order from '../models/order.model.js';
import DeliveryAssignment from '../models/deliveryAssignment.model.js';
import User from '../models/user.model.js';

export const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { deliveryBoyId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const shopOrder = order.shopOrders.find(so => so.shop.toString() === shopId);
    if (!shopOrder) return res.status(404).json({ message: 'Shop order not found' });

    // Find the delivery assignment for this shopOrder
    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      shopOrderId: shopOrder._id,
      status: 'broadcasted',
      brodcastedTo: deliveryBoyId
    });
    if (!assignment) return res.status(404).json({ message: 'No broadcasted assignment found for this delivery boy' });

    assignment.assignedTo = deliveryBoyId;
    assignment.status = 'assigned';
    assignment.acceptedAt = new Date();
    await assignment.save();

    shopOrder.assignedDeliveryBoy = deliveryBoyId;
    shopOrder.assignment = assignment._id;
    await order.save();

    // Populate delivery boy details
    await order.populate('shopOrders.assignedDeliveryBoy', 'fullName email mobile');

    const io = req.app.get('io');
    
    // Get the delivery boy to find their socketId
    const deliveryBoy = await User.findById(deliveryBoyId);
    
    // Emit to delivery boy that they've been assigned
    if (io && deliveryBoy?.socketId) {
      io.to(deliveryBoy.socketId).emit('assignedOrder', {
        orderId: order._id,
        shopId: shopOrder.shop,
        assignmentId: assignment._id,
      });
    }
    
    // Emit to the owner that delivery boy has accepted
    const owner = await User.findById(shopOrder.owner);
    if (io && owner?.socketId) {
      const updatedShopOrder = order.shopOrders.find(so => so._id.equals(shopOrder._id));
      io.to(owner.socketId).emit('deliveryBoyAccepted', {
        orderId: order._id,
        shopId: shopOrder.shop,
        assignmentId: assignment._id,
        deliveryBoy: {
          id: deliveryBoy._id,
          fullName: deliveryBoy.fullName,
          mobile: deliveryBoy.mobile,
          email: deliveryBoy.email
        }
      });
    }

    return res.status(200).json({ 
      message: 'Delivery boy assigned',
      deliveryBoyId,
      deliveryBoy: {
        id: deliveryBoy._id,
        fullName: deliveryBoy.fullName,
        mobile: deliveryBoy.mobile
      }
    });
  } catch (error) {
    return res.status(500).json({ message: `Assign delivery boy error: ${error.message}` });
  }
};
