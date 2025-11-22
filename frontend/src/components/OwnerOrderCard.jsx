import React, { useState } from "react";
import { MdPhone } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";
import { updateOrderStatus } from "../redux/userSlice";
import { useDispatch } from "react-redux";

function OwnerOrderCard({ data }) {
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();

  const shopOrder = data?.shopOrders;
  const [status, setStatus] = useState(shopOrder?.status || "");
  const statusNormalized = (status || "").toLowerCase().trim();

  // Handle status change
  const handleUpdateStatus = async (orderId, shopId, newStatus) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      setStatus(newStatus);
      dispatch(updateOrderStatus({ orderId, shopId, status: newStatus }));

      if (response.data?.availableBoys) {
        setAvailableBoys(response.data.availableBoys);
      }

      console.log("Order status updated:", response.data);
    } catch (error) {
      console.log("Error updating order:", error);
    }
  };

  return (
    <div className="bg-white/95 rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: '#be920210' }}>
      {/* Header Banner */}
      <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #be9202ff 0%, #C1121F 100%)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ backgroundColor: '#3E2723' }}>
              {data?.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold drop-shadow-lg">
                {data?.user?.fullName}
              </h2>
              <p className="text-sm opacity-90">{data?.user?.email}</p>
              <p className="flex items-center gap-2 text-sm mt-1 opacity-90">
                <MdPhone size={16} />
                <span>{data?.user?.mobile}</span>
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-xs text-white font-semibold uppercase tracking-wide">Order #{data?._id?.slice(-6)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">

        {/* ADDRESS INFO */}
        <div className="bg-orange-50 rounded-2xl p-4 border-l-4" style={{ borderColor: '#C1121F' }}>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#3E2723' }}>
            <span className="text-lg">📍</span> Delivery Address
          </h3>
          <p className="font-medium" style={{ color: '#2C1810' }}>{data?.deliveryAddress?.text}</p>
          <p className="text-xs mt-2" style={{ color: '#2C1810', opacity: 0.6 }}>
            Coordinates: {data?.deliveryAddress?.latitude}, {data?.deliveryAddress?.longitude}
          </p>
        </div>

        {/* ITEMS */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#3E2723' }}>
            <span className="text-xl">🍽️</span> Order Items
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shopOrder?.shopOrderItems?.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-orange-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-2" style={{ borderColor: '#be920220' }}
              >
                <div className="relative">
                  <img
                    src={item?.item?.image}
                    alt={item?.item?.name || ""}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-xs font-bold" style={{ color: '#C1121F' }}>×{item?.quantity}</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold truncate" style={{ color: '#3E2723' }}>
                    {item?.item?.name || "Product"}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: '#2C1810', opacity: 0.7 }}>
                    Rs. {item?.item?.price} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATUS + TOTAL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t-2" style={{ borderColor: '#be920220' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: '#2C1810', opacity: 0.7 }}>Status:</span>
            <span className="px-4 py-2 rounded-full text-sm font-bold capitalize text-white shadow-lg" style={{ 
              backgroundColor: statusNormalized === 'delivered' ? '#10b981' : statusNormalized === 'out of delivery' ? '#f59e0b' : statusNormalized === 'preparing' ? '#3b82f6' : '#6b7280'
            }}>
              {status}
            </span>
          </div>

          {statusNormalized !== 'delivered' && statusNormalized !== 'out of delivery' && (
            <select
              className="px-6 py-3 rounded-xl font-bold text-sm focus:outline-none focus:ring-4 shadow-lg transition-all text-white cursor-pointer"
              style={{ backgroundColor: '#C1121F', borderColor: '#C1121F' }}
              onChange={(e) =>
                handleUpdateStatus(data._id, shopOrder?.shop?._id, e.target.value)
              }
            >
              <option value="">Update Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="out of delivery">Out of Delivery</option>
            </select>
          )}
          
          {statusNormalized === 'delivered' && (
            <div className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg" style={{ backgroundColor: '#10b981' }}>
              ✓ Order Delivered
            </div>
          )}
          
          {statusNormalized === 'out of delivery' && (
            <div className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg" style={{ backgroundColor: '#f59e0b' }}>
              ⏳ Awaiting delivery confirmation
            </div>
          )}
        </div>

        {/* AVAILABLE BOYS */}
        {statusNormalized === "out of delivery" && (
          <div className="rounded-2xl p-5 border-l-4" style={{ backgroundColor: '#fef3c7', borderColor: '#be9202ff' }}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#3E2723' }}>
              <span className="text-lg">🚴</span> 
              {data.shopOrders?.assignedDeliveryBoy ? 'Assigned Delivery Boy' : 'Available Delivery Boys'}
            </h3>
            {availableBoys.length > 0 ? (
              <div className="space-y-2">
                {availableBoys.map((b, index) => (
                  <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm" key={index}>
                    <span className="font-semibold" style={{ color: '#2C1810' }}>{b.fullName}</span>
                    <span className="text-sm" style={{ color: '#2C1810', opacity: 0.7 }}>{b.mobile}</span>
                  </div>
                ))}
              </div>
            ) : (
              data.shopOrders.assignedDeliveryBoy ? (
                <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                  <span className="font-semibold" style={{ color: '#2C1810' }}>{data.shopOrders.assignedDeliveryBoy.fullName}</span>
                  <span className="text-sm" style={{ color: '#2C1810', opacity: 0.7 }}>{data.shopOrders.assignedDeliveryBoy.mobile}</span>
                </div>
              ) : (
                <div className="text-center py-2" style={{ color: '#2C1810', opacity: 0.7 }}>
                  ⏳ Waiting for delivery boys to accept...
                </div>
              )
            )}
          </div>
        )}

        {/* TOTAL */}
        <div className="flex justify-between items-center p-5 rounded-2xl" style={{ backgroundColor: '#be9202ff' }}>
          <span className="text-lg font-bold text-white">Order Total:</span>
          <span className="text-3xl font-black text-white">Rs. {shopOrder?.subtotal}</span>
        </div>
      </div>
    </div>
  );
}

export default OwnerOrderCard;
