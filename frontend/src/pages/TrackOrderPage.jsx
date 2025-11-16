import axios from "axios";
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";

function TrackOrderPage() {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = React.useState();
  const navigate = useNavigate();

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      console.log("Fetched order data:", result.data);
      console.log("Shop orders:", result.data.shopOrders);

      setCurrentOrder(result.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div className="relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]">
        <IoIosArrowRoundBack
          size={35}
          className="text-[#ff4d2d] cursor-pointer"
          onClick={() => navigate("/home")}
        />
        <h1 className="text-2xl font-semibold md:text-center">Track Order</h1>
      </div>

      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div
          key={index}
          className="bg-white border rounded-2xl p-4 shadow-md border-orange space-y-4"
        >
          <div>
            <p className="text-lg font-bold mb-2 text-[#ff4d2d]">
              {shopOrder.shop?.name}
            </p>
            <p className="font-semibold">
              <span>Items: </span>
              {shopOrder.shopOrderItems
                ?.map((i) => `${i.name} (Rs. ${i.price})`)
                .join(", ")}
            </p>
            <p>
              <span className="font-semibold">SubTotal: </span>Rs.{" "}
              {currentOrder?.totalAmount}
            </p>
            <p className="mt-6">
              <span className="font-semibold">Delivery Address: </span>
              {currentOrder?.deliveryAddress?.text}
            </p>
          </div>

          {/* Status Section */}
          {shopOrder.status !== "delivered" ? (
            <>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">
                    <span>Delivery Boy Name: </span>
                    {shopOrder.assignedDeliveryBoy.fullName}
                  </p>
                  <p className="font-semibold">
                    <span>Delivery Boy Contact No.: </span>
                    {shopOrder.assignedDeliveryBoy.mobile}
                  </p>
                </div>
              ) : (
                <p className="font-semibold">
                  Delivery Boy is not assigned yet.
                </p>
              )}

              {(shopOrder.assignedDeliveryBoy && shopOrder.status!=="delivered")&&(
                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
                  <DeliveryBoyTracking
                    deliveryBoyLocation={{
                      lat:
                        shopOrder.assignedDeliveryBoy.location.coordinates[1],
                      lon:
                        shopOrder.assignedDeliveryBoy.location.coordinates[0],
                    }}
                    customerLocation={{
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude,
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-green-600 font-semibold text-lg">Delivered</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default TrackOrderPage;
