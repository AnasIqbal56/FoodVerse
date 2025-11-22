import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/userSlice';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get order ID from localStorage
      const orderId = localStorage.getItem('pendingOrderId');
      
      if (!orderId) {
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      console.log('Verifying payment for order:', orderId);

      // Call backend to verify and update payment status
      const response = await axios.post(
        `${serverUrl}/api/order/verify-payfast-payment/${orderId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setPaymentStatus('success');
        setOrderDetails(response.data.order);
        
        // Clear the pending order ID
        localStorage.removeItem('pendingOrderId');
        
        // Clear cart
        dispatch(clearCart());
        
        // Redirect to order placed page after 3 seconds
        setTimeout(() => {
          navigate('/order-placed', { state: { order: response.data.order } });
        }, 3000);
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      
      const errorMessage = error.response?.data?.message || 'Payment verification failed';
      
      // Redirect to home after error
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment
            </p>
          </div>
        ) : paymentStatus === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your order has been placed successfully
            </p>
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-lg font-semibold text-gray-800">
                  #{orderDetails._id.substring(0, 8)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  R {orderDetails.totalAmount?.toFixed(2)}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Redirecting to order confirmation...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">
              Unable to verify your payment. Please contact support.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
