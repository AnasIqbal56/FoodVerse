import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart, addMyOrder } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";

function OrderPlaced() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [paymentStatus, setPaymentStatus] = useState('loading'); // loading, success, failed
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const orderPlaced = localStorage.getItem('orderPlaced');
            
            if (orderPlaced === 'cod' || orderPlaced === 'online') {
                // Order successfully placed (either COD or online payment already confirmed)
                setPaymentStatus('success');
                dispatch(clearCart());
                localStorage.removeItem('orderPlaced');
                localStorage.removeItem('pendingOrderId');
            } else {
                // No order info found - redirect to home
                navigate('/home');
            }
        };

        verifyPayment();
    }, [dispatch, navigate]);

    if (paymentStatus === 'loading') {
        return (
            <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff4d2d] mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment...</h1>
                <p className="text-gray-600 max-w-md">Please wait while we confirm your payment.</p>
            </div>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center">
                <MdError className="text-red-500 text-6xl mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
                <p className="text-gray-600 max-w-md mb-6">
                    Unfortunately, your payment could not be processed. 
                    Please try again or contact support.
                </p>
                <div className="flex gap-4">
                    <button 
                        className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg font-medium transition" 
                        onClick={() => navigate("/checkout")}
                    >
                        Try Again
                    </button>
                    <button 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition" 
                        onClick={() => navigate("/home")}
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
            {orderDetails && orderDetails.payment?.status === 'paid' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md">
                    <p className="text-green-700 font-medium">✓ Payment Successful</p>
                    <p className="text-sm text-green-600 mt-1">
                        Transaction ID: {orderDetails.payment.transactionId}
                    </p>
                </div>
            )}
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