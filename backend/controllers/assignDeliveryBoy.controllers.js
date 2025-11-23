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

    // Emit socket event to delivery boy in real time
    const io = req.app.get('io');
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (io && deliveryBoy?.socketId) {
      io.to(deliveryBoy.socketId).emit('assignedOrder', {
        orderId: order._id,
        shopId: shopOrder.shop,
        assignmentId: assignment._id,
      });
    }

    return res.status(200).json({ message: 'Delivery boy assigned', deliveryBoyId });
  } catch (error) {
    return res.status(500).json({ message: `Assign delivery boy error: ${error.message}` });
  }
};
