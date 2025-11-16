import React, { useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { setMyOrders } from "../redux/userSlice";
import { updateRealTimeOrderStatus } from "../redux/userSlice";


function MyOrders() {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#fff9f6] px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-[20px] mb-6">
          <div className="z-[10]" onClick={() => navigate("/home")}>
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">My Orders</h1>
        </div>

        <div className="space-y-6">
          {(myOrders || []).map((order, index) => (
            <div key={index}>
              {userData?.role === "user" ? (
                <UserOrderCard data={order} />
              ) : userData?.role === "owner" ? (
                <OwnerOrderCard data={order} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;