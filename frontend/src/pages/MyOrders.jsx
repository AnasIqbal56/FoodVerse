import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/userOrderCard";
import OwnerOrderCard from "../components/ownerOrderCard";

function MyOrders() {
  const { userData, MyOrders } = useSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#fff9f6] px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-[20px] mb-6">
          <div className="z-[10]" onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">My Orders</h1>
        </div>

        <div className="space-y-6">
          {(MyOrders || []).map((order, index) => (
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
