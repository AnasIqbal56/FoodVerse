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

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4 border border-gray-100">
      {/* Order Header */}
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">
            Order #{data?._id?.slice(-6) || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            Date: {data?.createdAt ? formatDate(data.createdAt) : "N/A"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            {data?.paymentMethod?.toUpperCase() || "COD"}
          </p>
          <p className="font-medium text-blue-600 capitalize">
            {data?.shopOrders?.[0]?.status || "pending"}
          </p>
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
              <p className="text-sm font-medium text-blue-600 capitalize">
                {shopOrder?.status || "pending"}
              </p>
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

