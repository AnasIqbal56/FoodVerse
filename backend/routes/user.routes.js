import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {getCurrentUser, updateUserLocation} from "../controllers/user.controller.js"
import User from "../models/user.model.js"

const userRouter=express.Router()


userRouter.get("/current", isAuth ,getCurrentUser)

userRouter.post("/update-location", isAuth ,updateUserLocation)

// DEBUG ENDPOINT - Remove in production
userRouter.get("/debug/delivery-boys", isAuth, async (req, res) => {
  try {
    const boys = await User.find({ role: "deliveryBoy" }).select('_id fullName email mobile socketId location');
    res.json({
      totalDeliveryBoys: boys.length,
      boys: boys.map(b => ({
        id: b._id,
        name: b.fullName,
        email: b.email,
        mobile: b.mobile,
        socketId: b.socketId || 'NOT SET',
        location: b.location.coordinates,
        hasValidLocation: b.location && b.location.coordinates && (b.location.coordinates[0] !== 0 || b.location.coordinates[1] !== 0)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default userRouter 