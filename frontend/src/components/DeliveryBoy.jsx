import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";

import axios from "axios";

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user);
  const [currentOrder,setCurrentOrder]=useState()
  const serverUrl = "http://localhost:8000";
  const [availableAssignments, setAvailableAssignments] = useState([]);

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true
      });
      console.log(result.data)
      setAvailableAssignments(result.data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };


  const getCurrentOrder=async()=>{
    try{
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, 
      {withCredentials: true});
      console.log(result.data)
      setCurrentOrder(result.data)
      
    }
    catch(error){
      console.log(error)
    }
//     try {
//   const res = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true });
//   console.log("Current order data:", res.data);
// } catch (err) {
//   console.log("Error details:", err.response?.data);
// }

  }

  const acceptOrder=async(assignmentId)=>{
    try{
      const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, 
      {withCredentials: true});
      console.log(result.data)
      await getCurrentOrder()
    }
    catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    if (userData?._id) {
      getAssignments();
      getCurrentOrder()
    }
  }, [userData]);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="w-full bg-white shadow-md rounded-2xl p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData.fullName}
          </h1>
          <p className="text-[#ff4d2d]">
            <span className="font-bold">Latitude: </span>
            {userData.location.coordinates[1]},
            <span className="font-bold"> Longitude: </span>
            {userData.location.coordinates[0]}
          </p>
        </div>

        {!currentOrder &&  <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
          <h1 className="text-lg font-bold flex items-center mb-4">
            Available Orders
          </h1>
          <div className="space-y-4">
            {availableAssignments && availableAssignments.length > 0 ? (
              availableAssignments.map((a, index) => (
                <div className="border rounded-lg p-4 flex justify-between items-center " key={index}>
                  <div>
                    <p className="text-sm font-semibold">
                      {a?.shopName}
                    </p>
                    <p className="text-sm text-gray-500"><span className="font-bold">Delivery Address:</span> 
                      {a?.deliveryAddress?.text}
                    </p>
                  <p className="text-xs text-gray-600 ">
                    {a?.items.length} items | {a.subtotal} 
                  </p>
                  </div>
                  <button className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm
                   hover:bg-orange-600" onClick={()=>acceptOrder(a.assignmentId)}>
                    Accept
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No available orders</p>
            )}
          </div>
        </div>}


        {currentOrder && <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
          <h2 className="text-lg font-bold mb-3">📦Current Order</h2>
          <div className="border rounded-lg p-4 mb-3">
            <p className="font-semibold text-sm">{currentOrder?.shopOrder.shop.name}</p>
            <p className="text-xs text-gray-500 ">{currentOrder.deliveryAddress.text}</p>
            <p className="text-xs text-gray-400 ">{currentOrder.shopOrder.shopOrderItems.length} items 
               | {currentOrder.shopOrder.subtotal} </p>
          </div>

          {/* <DeliveryBoyTracking data={currentOrder}/> */}

        </div>}

        
      </div>
    </div>
  );
}

export default DeliveryBoy;
