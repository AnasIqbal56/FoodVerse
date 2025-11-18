import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { setMyOrders } from "../redux/userSlice";
import { updateRealTimeOrderStatus } from "../redux/userSlice";
import { Package, Clock, CheckCircle, Truck, Filter } from "lucide-react";


function MyOrders() {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    socket?.on("newOrder", (data) => {
      if (data.shopOrder.owner._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]));
      }
    });

    socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId === userData._id) {
        dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));
      }
    });

    return () => {
      socket?.off("newOrder");
      socket?.off("update-status");
    };
  }, [socket, myOrders, userData, dispatch]);

  // Filter orders based on status and search
  const normalizedFilter = filterStatus?.toLowerCase()?.trim();
  const filteredOrders = (myOrders || []).filter((order) => {
    const shopOrdersArray = Array.isArray(order?.shopOrders) ? order.shopOrders : [order?.shopOrders].filter(Boolean);

    const matchesStatus = !normalizedFilter || normalizedFilter === "all" || shopOrdersArray.some(so => (so?.status || "").toLowerCase().trim() === normalizedFilter);

    // Search by order ID only (remove search input for users handled elsewhere)
    const matchesSearch = !searchQuery || order?._id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate order stats
  const orderStats = {
    total: (myOrders || []).length,
    pending: (myOrders || []).filter(o => {
      const arr = Array.isArray(o?.shopOrders) ? o.shopOrders : [o?.shopOrders].filter(Boolean);
      return arr.some(so => (so?.status || "").toLowerCase().trim() === "pending");
    }).length,
    preparing: (myOrders || []).filter(o => {
      const arr = Array.isArray(o?.shopOrders) ? o.shopOrders : [o?.shopOrders].filter(Boolean);
      return arr.some(so => (so?.status || "").toLowerCase().trim() === "preparing");
    }).length,
    outForDelivery: (myOrders || []).filter(o => {
      const arr = Array.isArray(o?.shopOrders) ? o.shopOrders : [o?.shopOrders].filter(Boolean);
      return arr.some(so => (so?.status || "").toLowerCase().trim() === "out of delivery");
    }).length,
    delivered: (myOrders || []).filter(o => {
      const arr = Array.isArray(o?.shopOrders) ? o.shopOrders : [o?.shopOrders].filter(Boolean);
      return arr.some(so => (so?.status || "").toLowerCase().trim() === "delivered");
    }).length,
  };

  return (
    <div className="w-full min-h-screen flex justify-center px-4" style={{ backgroundColor: '#f7d26eff' }}>
      {/* Enhanced Background with animated gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f7d26eff 0%, #fef3c7 50%, #f5f3ff 100%)' }} />
        <motion.div
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(193, 18, 31, 0.1), rgba(190, 146, 2, 0.08))',
            backgroundSize: "200% 200%"
          }}
        />
        <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(255,69,0,0.1)_35px,rgba(255,69,0,0.1)_70px)]" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(193, 18, 31, 0.15)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(190, 146, 2, 0.15)' }}
        />
      </div>

      <div className="w-full max-w-[1400px] p-4 md:p-6 py-8">
        {/* Enhanced Header with breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer p-2 rounded-full hover:bg-white/30 transition-all" 
              onClick={() => navigate("/home")}
            >
              <IoIosArrowRoundBack size={40} style={{ color: '#C1121F' }} />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>
                <span className="cursor-pointer hover:underline" onClick={() => navigate("/home")}>Home</span>
                <span>/</span>
                <span className="font-semibold">Orders</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-playfair" style={{ color: '#3E2723' }}>
                {userData?.role === "owner" ? "Restaurant Orders" : "My Orders"}
              </h1>
              <p className="text-lg mt-2" style={{ color: '#2C1810', opacity: 0.7 }}>
                {userData?.role === "owner" ? "Manage and track your restaurant orders" : "Track your food orders in real-time"}
              </p>
            </div>
          </div>

          {/* Order Statistics Cards */}
          {(myOrders || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
            >
              {[
                { label: "Total Orders", value: orderStats.total, icon: Package, color: "#3E2723" },
                { label: "Pending", value: orderStats.pending, icon: Clock, color: "#6b7280" },
                { label: "Preparing", value: orderStats.preparing, icon: Filter, color: "#3b82f6" },
                { label: "Out for Delivery", value: orderStats.outForDelivery, icon: Truck, color: "#f59e0b" },
                { label: "Delivered", value: orderStats.delivered, icon: CheckCircle, color: "#10b981" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-lg border-2 cursor-pointer"
                  style={{ borderColor: `${stat.color}20` }}
                  onClick={() => {
                    const map = {
                      "Total Orders": "all",
                      "Pending": "pending",
                      "Preparing": "preparing",
                      "Out for Delivery": "out of delivery",
                      "Delivered": "delivered",
                    };
                    setFilterStatus(map[stat.label] || "all");
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon size={24} style={{ color: stat.color }} />
                    <span className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#2C1810', opacity: 0.7 }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Search and Filter Bar */}
          {(myOrders || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 mb-6"
            >
              {/* Search input removed for users per requirements */}

              {/* Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Preparing", value: "preparing" },
                  { label: "Out for Delivery", value: "out of delivery" },
                  { label: "Delivered", value: "delivered" },
                ].map((filter) => (
                  <motion.button
                    key={filter.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterStatus(filter.value)}
                    className="px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all"
                    style={{
                      backgroundColor: filterStatus === filter.value ? '#C1121F' : 'white',
                      color: filterStatus === filter.value ? 'white' : '#2C1810',
                      border: `2px solid ${filterStatus === filter.value ? '#C1121F' : '#e5e7eb'}`
                    }}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Orders Grid with AnimatePresence */}
        <AnimatePresence mode="wait">
          {filteredOrders.length > 0 ? (
            <motion.div
              key="orders-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6"
            >
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -5 }}
                  className="transform transition-all"
                >
                  {userData?.role === "user" ? (
                    <UserOrderCard data={order} />
                  ) : userData?.role === "owner" ? (
                    <OwnerOrderCard data={order} />
                  ) : null}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-orders"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 md:p-16 shadow-2xl inline-block max-w-md mx-auto">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  {filterStatus === "all" && (myOrders || []).length === 0 ? "📦" : "🔍"}
                </motion.div>
                <h3 className="text-3xl font-black mb-3 font-playfair" style={{ color: '#3E2723' }}>
                  {filterStatus === "all" && (myOrders || []).length === 0 
                    ? "No Orders Yet" 
                    : "No Orders Found"}
                </h3>
                <p className="text-lg mb-6" style={{ color: '#2C1810', opacity: 0.7 }}>
                  {filterStatus === "all" && (myOrders || []).length === 0
                    ? userData?.role === "owner" 
                      ? "Orders will appear here once customers place them" 
                      : "Start ordering delicious food!"
                    : "Try adjusting your filters or search query"}
                </p>
                {filterStatus !== "all" || searchQuery ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFilterStatus("all");
                      setSearchQuery("");
                    }}
                    className="px-8 py-3 rounded-full font-bold text-white shadow-lg"
                    style={{ backgroundColor: '#C1121F' }}
                  >
                    Clear Filters
                  </motion.button>
                ) : userData?.role === "user" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/home")}
                    className="px-8 py-3 rounded-full font-bold text-white shadow-lg"
                    style={{ backgroundColor: '#C1121F' }}
                  >
                    Start Ordering
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MyOrders;