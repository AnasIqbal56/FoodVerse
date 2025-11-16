import React, { useEffect } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/userSlice";

function OrderPlaced() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // Clear cart when order is placed
        dispatch(clearCart());
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
            <FaCircleCheck className="text-green-500 text-6xl mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
            <p className="text-gray-600 max-w-md mb-6">
                Thank you for your purchase. Your order is being prepared. 
                You can track your order status in the "My Orders" section.
            </p>
            <button 
                className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition" 
                onClick={() => navigate("/my-orders")}
            >
                Back to my orders
            </button>
        </div>
    );
}

export default OrderPlaced;