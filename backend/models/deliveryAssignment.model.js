import mongoose from "mongoose";

const deliveryAssignmentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  shopOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  brodcastedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  status: {
    type: String,
    enum: ["broadcasted", "accepted", "picked", "completed"],
    default: "broadcasted"
  }
}, { timestamps: true });

const DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
export default DeliveryAssignment;
