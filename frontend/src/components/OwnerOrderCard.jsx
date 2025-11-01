import React, { useState } from "react";
import { MdPhone } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";
import { updateOrderStatus } from "../redux/userSlice";
import { useDispatch } from "react-redux";

function OwnerOrderCard({ data }) {
  const [availableBoys, setAvailableBoys]=useState([])
  const dispatch = useDispatch();

  const shopOrder = data?.shopOrders;
  const [status, setStatus] = useState(shopOrder?.status);

  // Handle status change
  const handleUpdateStatus = async (orderId, shopId, newStatus) => {
    try {
      await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setStatus(newStatus);
      dispatch(updateOrderStatus({ orderId, shopId, status: newStatus }));
      setAvailableBoys(result.data.availableBoys)
      console.log(result.data)
    } catch (error) {
      console.log("Error updating order:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* USER INFO */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data?.user?.fullName}
        </h2>
        <p className="text-sm text-gray-500">{data?.user?.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdPhone className="text-gray-500" />
          <span>{data?.user?.mobile}</span>
        </p>
      </div>

      {/* ADDRESS INFO */}
      <div className="flex items-start flex-col gap-2 text-sm text-gray-600">
        <p>{data?.deliveryAddress?.text}</p>
        <p>
          <span className="font-medium text-xs">Lat:</span>{" "}
          {data?.deliveryAddress?.latitude},{" "}
          <span className="font-medium text-xs">Lon:</span>{" "}
          {data?.deliveryAddress?.longitude}
        </p>
      </div>

      {/* ITEMS */}
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

      {/* STATUS + TOTAL */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">
          Status:{" "}
          <span className="font-semibold capitalize text-[#ff4d2d]">
            {status}
          </span>
        </span>

        <select
          className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]"
          onChange={(e) =>
            handleUpdateStatus(data._id, shopOrder.shop._id, e.target.value)
          }
        >
          <option value="">Change</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out of Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* TOTAL */}
      <div className="text-right font-bold text-gray-800 text-sm">
        Total: ₹{shopOrder?.subtotal}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
