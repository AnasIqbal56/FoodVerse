import React from "react";
import { useNavigate } from "react-router-dom";

function UserOrderCard({ data }) {
  const navigate = useNavigate();
    const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'delivered') return '#10b981';
    if (s === 'out of delivery') return '#f59e0b';
    if (s === 'preparing') return '#3b82f6';
    if (s === 'pending') return '#6b7280';
    return '#6b7280';
  };

  return (
    <div className="bg-white/95 rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: '#be920210' }}>
      {/* Order Header */}
      <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #be9202ff 0%, #C1121F 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-lg">Order #{data?._id?.slice(-6) || "N/A"}</p>
            <p className="text-sm opacity-90 text-white mt-1">Date: {data?.createdAt ? formatDate(data.createdAt) : "N/A"}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-xs text-white font-semibold uppercase tracking-wide">{data?.paymentMethod?.toUpperCase() || "COD"}</p>
          </div>
        </div>
      </div>

      {/* Shop Orders Section */}
      <div className="space-y-4">
        {data?.shopOrders?.map((shopOrder, index) => (
          <div
            key={index}
            className="border rounded-lg p-3 bg-gray-50 space-y-3"
          >
            <p className="font-semibold text-gray-800">
              {shopOrder?.shop?.name || "Shop Name"}
            </p>

            {/* Product Items */}
            <div className="flex flex-wrap gap-3">
              {shopOrder?.shopOrderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white shadow-sm"
                >
                  <img
                    src={item?.item?.image}
                    alt={item?.item?.name || ""}
                    className="w-full h-24 object-cover rounded"
                  />

                  <p className="text-sm font-semibold mt-1">
                    {item?.item?.name || "Product"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item?.quantity} × ₹{item?.item?.price}
                  </p>
                </div>
              ))}
            </div>

                <div className="flex justify-between items-center border-t pt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Subtotal: RS {shopOrder?.subtotal || shopOrder?.subTotal || 0}
                  </p>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold text-white capitalize" style={{ backgroundColor: getStatusColor(shopOrder?.status) }}>
                    {shopOrder?.status || 'pending'}
                  </span>
                </div>
          </div>
        ))}
      </div>

      {/* Order Total + Track Order Button */}
      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">
          Total: ₹{data?.totalPrice || data?.totalAmount || 0}
        </p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
          onClick={() => {
            navigate(`/track-order/${data._id}`);
          }}
        >
          Track Order
        </button>
      </div>
    </div>
  );
}

export default UserOrderCard;

