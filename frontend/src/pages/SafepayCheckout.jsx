import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCreditCard } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import axios from 'axios';
import { serverUrl } from '../App';

function SafepayCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'jazzcash', 'easypaisa'
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [mobileWallet, setMobileWallet] = useState({
    phoneNumber: '',
    accountName: '',
    pin: ''
  });
  const [cardPin, setCardPin] = useState('');

  const token = searchParams.get('tracker');
  const orderId = localStorage.getItem('pendingOrderId');
  const amount = searchParams.get('amount') || '80';

  useEffect(() => {
    if (!token || !orderId) {
      navigate('/checkout');
    }
  }, [token, orderId, navigate]);

  const handleInputChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    // Format Pakistani card number: 16 digits with spaces after every 4 digits
    // Format: 1234 5678 9012 3456
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, ''); // Remove non-digits
      if (value.length > 16) return; // Limit to 16 digits
      value = value.replace(/(\d{4})/g, '$1 ').trim(); // Add space after every 4 digits
    }

    // Format expiry date (MM/YY)
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
    }

    // Format CVV (3 digits for most Pakistani cards)
    if (name === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) return;
    }

    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleMobileWalletChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    // Format Pakistani mobile number: 03XX-XXXXXXX
    if (name === 'phoneNumber') {
      value = value.replace(/\D/g, ''); // Remove non-digits
      if (value.length > 11) return; // Limit to 11 digits
      
      // Auto-format as 03XX-XXXXXXX
      if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4);
      }
    }

    // Format PIN - 4 digits for JazzCash, 5 digits for Easypaisa
    if (name === 'pin') {
      value = value.replace(/\D/g, ''); // Remove non-digits
      const maxLength = paymentMethod === 'jazzcash' ? 4 : 5;
      if (value.length > maxLength) return;
    }

    setMobileWallet({ ...mobileWallet, [name]: value });
  };

  const handleCardPinChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 4) return; // Limit to 4 digits
    setCardPin(value);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    console.log('=== PAYMENT SUBMITTED ===');
    console.log('Payment Method:', paymentMethod);
    console.log('Token:', token);
    console.log('Order ID:', orderId);
    
    // Validate based on payment method
    if (paymentMethod === 'card') {
      console.log('Card Details:', cardDetails);
      
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return;
      }
      
      if (!cardDetails.cardName || cardDetails.cardName.trim() === '') {
        alert('Please enter the cardholder name');
        return;
      }
      
      if (!cardDetails.expiryDate || cardDetails.expiryDate.length !== 5) {
        alert('Please enter a valid expiry date (MM/YY)');
        return;
      }
      
      if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
        alert('Please enter a valid 3-digit CVV');
        return;
      }

      if (!cardPin || cardPin.length !== 4) {
        alert('Please enter your 4-digit card PIN');
        return;
      }
    } else if (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') {
      console.log('Mobile Wallet Details:', mobileWallet);
      
      const phoneDigits = mobileWallet.phoneNumber.replace(/\D/g, '');
      if (!mobileWallet.phoneNumber || phoneDigits.length !== 11 || !phoneDigits.startsWith('03')) {
        alert('Please enter a valid mobile number (03XX-XXXXXXX)');
        return;
      }
      
      if (!mobileWallet.accountName || mobileWallet.accountName.trim() === '') {
        alert('Please enter the account holder name');
        return;
      }

      const requiredPinLength = paymentMethod === 'jazzcash' ? 4 : 5;
      const pinLabel = paymentMethod === 'jazzcash' ? 'MPIN' : 'PIN';
      if (!mobileWallet.pin || mobileWallet.pin.length !== requiredPinLength) {
        alert(`Please enter your ${requiredPinLength}-digit ${pinLabel}`);
        return;
      }
    }
    
    setLoading(true);

    try {
      console.log('Simulating payment processing...');
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Calling verify-payment API...');
      // For sandbox/demo, we'll mark the payment as successful
      // In production, Safepay would handle this
      const result = await axios.post(
        `${serverUrl}/api/order/verify-payment`,
        {
          token: token,
          orderId: orderId
        },
        { withCredentials: true }
      );

      console.log('Verification response:', result.data);

      if (result.data.success) {
        console.log('Payment successful! Navigating to order-placed...');
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('paymentToken');
        navigate('/order-placed');
      } else {
        console.log('Payment verification failed');
        alert('Payment verification failed. Please try again.');
        navigate('/checkout');
      }
    } catch (error) {
      console.error('=== PAYMENT ERROR ===');
      console.error('Error details:', error);
      console.error('Response:', error.response?.data);
      
      // Provide specific error messages
      let errorMessage = 'Payment processing failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Order not found. Please start a new order.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid payment details. Please try again.';
      }
      
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    console.log('=== PAYMENT CANCELLED ===');
    
    if (!window.confirm('Are you sure you want to cancel this payment?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Call API to cancel payment and delete pending order
      await axios.post(
        `${serverUrl}/api/order/cancel-payment`,
        { orderId: orderId },
        { withCredentials: true }
      );
      
      console.log('Payment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling payment:', error);
      // Continue with navigation even if API call fails
    } finally {
      // Clean up and go back to checkout
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('paymentToken');
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Safepay Checkout</h1>
            <MdSecurity size={32} />
          </div>
          <p className="text-blue-100 text-sm">Sandbox Environment - Test Mode</p>
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <p className="text-xs text-blue-100">Amount to Pay</p>
            <p className="text-3xl font-bold">PKR {amount}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePayment} className="p-6 space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>Test Mode:</strong> Select payment method and enter details for testing
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              All payment methods work in sandbox mode
            </p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaCreditCard className="mx-auto mb-1 text-blue-600" size={24} />
                <p className="text-xs font-semibold text-gray-700">Credit/Debit Card</p>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('jazzcash')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'jazzcash'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img src="/jazz.png" alt="JazzCash" className="h-8 w-auto mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">JazzCash</p>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'easypaisa'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img src="/easypaisa.png" alt="Easypaisa" className="h-8 w-auto mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">Easypaisa</p>
              </button>
            </div>
          </div>

          {/* Card Payment Fields */}
          {paymentMethod === 'card' && (
            <>
              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number (16 digits)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg tracking-wider"
                  />
                  <FaCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Card Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cardholder Name (as on card)
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={cardDetails.cardName}
                  onChange={handleInputChange}
                  placeholder="AHMAD HASSAN"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none uppercase"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Card PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card PIN (4 digits)
                </label>
                <input
                  type="password"
                  name="cardPin"
                  value={cardPin}
                  onChange={handleCardPinChange}
                  placeholder="••••"
                  required
                  maxLength="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 4-digit card PIN to authorize payment
                </p>
              </div>
            </>
          )}

          {/* JazzCash/Easypaisa Payment Fields */}
          {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
            <>
              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {paymentMethod === 'jazzcash' ? '🎵 JazzCash' : '💚 Easypaisa'} Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="phoneNumber"
                    value={mobileWallet.phoneNumber}
                    onChange={handleMobileWalletChange}
                    placeholder="03XX-XXXXXXX"
                    required
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg tracking-wider"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">📱</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your {paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} registered mobile number
                </p>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={mobileWallet.accountName}
                  onChange={handleMobileWalletChange}
                  placeholder="AHMAD HASSAN"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none uppercase"
                />
              </div>

              {/* MPIN / PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {paymentMethod === 'jazzcash' ? 'MPIN (4 digits)' : 'PIN (5 digits)'}
                </label>
                <input
                  type="password"
                  name="pin"
                  value={mobileWallet.pin}
                  onChange={handleMobileWalletChange}
                  placeholder={paymentMethod === 'jazzcash' ? '••••' : '•••••'}
                  required
                  maxLength={paymentMethod === 'jazzcash' ? '4' : '5'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your {paymentMethod === 'jazzcash' ? '4-digit MPIN' : '5-digit PIN'} to authorize payment
                </p>
              </div>
            </>
          )}

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-xs text-gray-600 mb-1">Order ID</p>
            <p className="text-sm font-mono text-gray-800">{orderId?.substring(0, 20)}...</p>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                `Pay PKR ${amount}`
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              Cancel Payment
            </button>
          </div>

          {/* Security Info */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4">
            <MdSecurity />
            <span>Secured by Safepay Sandbox</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SafepayCheckout;
