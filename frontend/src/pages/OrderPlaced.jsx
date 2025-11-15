import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { addMyOrder, clearCart } from "../redux/userSlice";

function OrderPlaced() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [verifying, setVerifying] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const verifyPayment = async () => {
            // Check if there's a pending order (from online payment)
            const pendingOrderId = localStorage.getItem('pendingOrderId');
            const paymentToken = localStorage.getItem('paymentToken');

            if (pendingOrderId && paymentToken) {
                try {
                    // Verify payment with backend
                    const result = await axios.post(
                        `${serverUrl}/api/order/verify-payment`,
                        {
                            token: paymentToken,
                            orderId: pendingOrderId
                        },
                        { withCredentials: true }
                    );

                    if (result.data.success) {
                        setPaymentSuccess(true);
                        dispatch(addMyOrder(result.data.order));
                        // Clear cart after successful order
                        dispatch(clearCart());
                        // Clear localStorage
                        localStorage.removeItem('pendingOrderId');
                        localStorage.removeItem('paymentToken');
                    } else {
                        setPaymentSuccess(false);
                        setErrorMessage(result.data.message || "Payment verification failed");
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    setPaymentSuccess(false);
                    setErrorMessage(
                        error.response?.data?.message || 
                        "Failed to verify payment. Please contact support."
                    );
                }
            } else {
                // COD order or direct navigation
                setPaymentSuccess(true);
                // Clear cart for COD orders too
                dispatch(clearCart());
            }
            setVerifying(false);
        };

        verifyPayment();
    }, [dispatch]);

    if (verifying) {
        return (
            <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff4d2d] mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-800">Verifying Payment...</h2>
                <p className="text-gray-600 mt-2">Please wait while we confirm your payment.</p>
            </div>
        );
    }

    if (!paymentSuccess) {
        return (
            <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
                <MdError className="text-red-500 text-6xl mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
                <p className="text-gray-600 max-w-md mb-6">
                    {errorMessage || "Your payment could not be processed. Please try again."}
                </p>
                <div className="flex gap-4">
                    <button 
                        className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition" 
                        onClick={() => navigate("/checkout")}
                    >
                        Try Again
                    </button>
                    <button 
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition" 
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

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