import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import axios from "axios";
import { motion } from "framer-motion";
import { FaTruck, FaMapMarkerAlt, FaBox, FaClock } from "react-icons/fa";
import bgImage from "../assets/generated-image.png";
import { serverUrl } from "../App";

function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const [showOTPBox, setShowOTPBox] = useState(false);

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      console.log(result.data);
      setAvailableAssignments(result.data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, {
        withCredentials: true,
      });
      console.log("Fetched current order:", result.data);
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };
  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      console.log(result.data);
      await getCurrentOrder();
    } catch (error) {
      console.log(error);
    }
  };

    const sendOtp = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
        { withCredentials: true }
      );
      setShowOTPBox(true)
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    try {
      const trimmedOtp = (otp || '').trim();
      if (!trimmedOtp || trimmedOtp.length < 4) {
        alert('Please enter a valid 4-digit OTP');
        return;
      }
      
      console.log('[Frontend OTP Verification]', { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp: trimmedOtp });
      
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp: trimmedOtp },
        { withCredentials: true }
      );
      console.log('[OTP Verification Success]', result.data);
      alert('Delivery verified! Order marked as delivered.');
      
      // Clear current order state immediately
      setCurrentOrder(null);
      setOtp('');
      setShowOTPBox(false);
      
      // Refresh assignments to show new available orders
      await getAssignments();
    } catch (error) {
      console.error('[OTP Verification Error]', error.response?.data || error.message);
      alert(`OTP Verification failed: ${error.response?.data?.message || error.message}`);
    }
  }; 

  useEffect (() => {
    socket?.on('newAssignment', (data) => {
      if (String(data.sentTo) === String(userData._id)) {
        setAvailableAssignments(prev => [...prev, data]);
      }
    });
    socket?.on('assignedOrder', (data) => {
      // Direct assignment by owner, fetch current order
      getCurrentOrder();
      // Optionally show notification
      alert('You have been assigned a new order!');
    });
    return () => {
      socket?.off('newAssignment');
      socket?.off('assignedOrder');
    };
  }, [socket]);

  useEffect(() => {
    if (userData?._id) {
      getAssignments();
      getCurrentOrder();
    }
  }, [userData]);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <Nav />
      <div className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 py-8">
        
        {/* Header with Welcome Message */}
        <div className="w-full max-w-6xl mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 border-2" 
            style={{ borderColor: '#C1121F20' }}
          >
            <div className="flex items-center gap-4 mb-2">
              <FaTruck className="text-[#C1121F] text-3xl" />
              <h1 className="text-4xl font-bold" style={{ color: '#3E2723' }}>
                Welcome, {userData?.fullName || "Delivery Partner"}
              </h1>
            </div>
            <p className="text-base" style={{ color: '#2C1810', opacity: 0.85 }}>
              Your status: <span className="font-semibold ">Active & Ready for Deliveries</span>
            </p>
          </motion.div>
        </div>

        {/* Available Orders Section */}
        {!currentOrder && (
          <div className="w-full max-w-6xl mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold mb-6 flex items-center gap-3" 
              style={{ color: '#3E2723' }}
            >
              <FaBox className="text-[#C1121F]" />
             <p style={{color:"#f6d26f"}}>Available Orders</p>
            </motion.h2>
            
            <div className="space-y-4">
              {availableAssignments && availableAssignments.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 cursor-pointer"
                    style={{ borderLeftColor: '#C1121F' }}
                  >
                    <div className="p-6 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold" style={{ color: '#3E2723' }}>
                          {a?.shopName}
                        </h3>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-[#C1121F] mt-1 flex-shrink-0" size={14} />
                            <p className="text-sm" style={{ color: '#2C1810', opacity: 0.85 }}>
                              <span className="font-semibold">Delivery to:</span> {a?.deliveryAddress?.text}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaBox className="text-[#be9202ff]" size={14} />
                            <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                              {a?.items?.length || 0} items • Rs{a?.subtotal || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all text-sm flex-shrink-0"
                        style={{ backgroundColor: '#C1121F' }}
                        onClick={() => acceptOrder(a.assignmentId)}
                      >
                        Accept Order
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-200"
                >
                  <FaBox className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No available orders at the moment</p>
                  <p className="text-gray-400 text-sm mt-2">Stay tuned! Orders will appear here soon.</p>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Current Order Section */}
        {currentOrder && (
          <div className="w-full max-w-6xl">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold mb-6 flex items-center gap-3" 
              style={{ color: '#f6d26f' }}
            >
              <FaClock className="text-[#C1121F]" />
              Active Delivery
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2"
              style={{ borderColor: '#C1121F30' }}
            >
              {/* Card Header with gradient */}
              <div 
                className="p-6 text-white"
                style={{ background: 'linear-gradient(135deg, #C1121F 0%, #be9202ff 100%)' }}
              >
                <h3 className="text-2xl font-bold mb-2">
                  {currentOrder?.shopOrder?.shop?.name}
                </h3>
                <div className="flex items-center gap-2 text-white/90">
                  <FaMapMarkerAlt size={16} />
                  <p className="text-sm">{currentOrder?.deliveryAddress?.text}</p>
                </div>
              </div>

              {/* Order Details Card */}
              <div className="p-6">
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">Order Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-semibold" style={{ color: '#3E2723' }}>
                        {currentOrder?.user?.fullName || "Customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="font-semibold" style={{ color: '#3E2723' }}>
                        {currentOrder?.shopOrder?.shopOrderItems?.length || 0} items
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-semibold" style={{ color: '#3E2723' }}>
                        Rs{currentOrder?.shopOrder?.subtotal || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Section */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">Live Tracking</h4>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <DeliveryBoyTracking
                      deliveryBoyLocation={currentOrder.deliveryBoyLocation}
                      customerLocation={currentOrder.customerLocation}
                    />
                  </div>
                </div>

                {/* OTP Section */}
                {!showOTPBox ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md transition-all text-base"
                    style={{ backgroundColor: '#10b981' }}
                    onClick={sendOtp}
                  >
                    Mark as Delivered
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200"
                  >
                    <p className="text-sm font-semibold mb-3" style={{ color: '#3E2723' }}>
                      Enter OTP sent to{" "}
                      <span className="font-bold" style={{ color: '#C1121F' }}>
                        {currentOrder?.user?.fullName || "Customer"}
                      </span>
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full border-2 rounded-lg px-4 py-3 mb-3 focus:outline-none font-semibold text-center text-lg tracking-widest"
                      style={{ borderColor: '#C1121F40', color: '#3E2723' }}
                      placeholder="0000"
                      onChange={(e) => setOtp(e.target.value)}
                      value={otp}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all"
                      style={{ backgroundColor: '#C1121F' }}
                      onClick={verifyOtp}
                    >
                      Verify OTP
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;