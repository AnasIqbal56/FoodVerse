import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa6";


function OwnerDashboard() {
  const {myShopData} = useSelector(state=>state.owner)
  return (
    <div className="w-full min-h-screen bd-[#fff9f6] flex flex-col items-center">
      <Nav/>
      {!myShopData &&
      <div className="flex justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100
        hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center text-center">
            <FaUtensils className="text--[#ff4d2d] w-16 h-16 sm:h-20  sm:w-20 mb-4"/>
            <h2 className="">Add Your Restaurant</h2>
          </div>

        </div>
      </div>
}
    

    </div>
  );
}

export default OwnerDashboard;
