import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { IoLocationSharp, IoSearch } from 'react-icons/io5';
import { TbCurrentLocation } from 'react-icons/tb';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLocation, setAddress } from '../redux/mapSlice';
import axios from 'axios';
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { serverUrl } from '../App';
import { addMyOrder } from '../redux/userSlice';


function ReCenterMap({ location }) {
  const map = useMap();
  if (location?.lat && location?.lon) {
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

function CheckOut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const [addressInput, setAddressInput] = useState('');
  const { location, address } = useSelector((state) => state.map);
  const { cartItems,totalAmount, userData } = useSelector((state) => state.user);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const deliveryFee= totalAmount>500?0:40;
  const AmountWithDeliveryFee=totalAmount+deliveryFee;
  ///
  console.log(cartItems);
  ///

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      );
      dispatch(setAddress(res.data.results[0].address_line2));
    } catch (error) {
      console.error(error);
    }
  };

  const onDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
   const latitude=userData.location.coordinates[1];
   const longitude=userData.location.coordinates[0];
      dispatch(setLocation({ lat: latitude, lon: longitude }));
      getAddressByLatLng(latitude, longitude);
  };

  const getLatLngByAddress = async () => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
      );
      const { lat, lon } = res.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlaceOrder = async () => {
    console.log('=== PLACE ORDER CLICKED ===');
    console.log('Payment Method:', paymentMethod);
    console.log('Total Amount:', totalAmount);
    console.log('Amount with Delivery:', AmountWithDeliveryFee);
    console.log('Cart Items:', cartItems);
    
    // Validate before processing
    if (!addressInput || addressInput.trim() === '') {
      alert('Please enter a delivery address');
      return;
    }
    
    if (!location?.lat || !location?.lon) {
      alert('Please select a valid delivery location on the map');
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'cod') {
        console.log('Processing COD payment...');
        // Cash on Delivery - existing flow
        const result = await axios.post(`${serverUrl}/api/order/place-order`, {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount: AmountWithDeliveryFee,
          cartItems
        }, { withCredentials: true });
        
        console.log('COD Order placed:', result.data);
        dispatch(addMyOrder(result.data));
        navigate("/order-placed");
      } else if (paymentMethod === 'online') {
        console.log('Processing ONLINE payment...');
        console.log('Calling create-payment-session API...');
        
        // Online Payment - Safepay flow
        const result = await axios.post(`${serverUrl}/api/order/create-payment-session`, {
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount,
          cartItems
        }, { withCredentials: true });

        console.log('Payment session created:', result.data);
        console.log('Checkout URL:', result.data.checkoutUrl);

        // Store order ID in localStorage for verification after payment
        localStorage.setItem('pendingOrderId', result.data.orderId);
        localStorage.setItem('paymentToken', result.data.token);

        console.log('Stored in localStorage:', {
          orderId: result.data.orderId,
          token: result.data.token
        });

        // Extract tracker and amount from checkoutUrl
        const url = new URL(result.data.checkoutUrl);
        const tracker = url.searchParams.get('tracker');
        const amount = url.searchParams.get('amount');

        // Navigate to Safepay checkout using React Router
        console.log('Navigating to safepay-checkout with:', { tracker, amount });
        navigate(`/safepay-checkout?tracker=${tracker}&amount=${amount}`);
      }
    } catch (error) {
      console.error('=== PLACE ORDER ERROR ===');
      console.error('Error details:', error.response?.data || error.message);
      console.error('Full error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  const defaultPosition = { lat: 24.8607, lon: 67.0011 };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div className="absolute top-[20px] left-[20px] z-[10]" onClick={() => navigate('/')}>
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="w-full max-w-[900px] bg-white p-6 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">CheckOut</h1>

        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp className="text-[#ff4d2d]" /> Delivery Location
          </h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter your delivery address.."
              className="flex-1 border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center"
              onClick={getLatLngByAddress}
            >
              <IoSearch size={17} />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              onClick={getCurrentLocation}
            >
              <TbCurrentLocation size={17} />
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer
                center={[location?.lat || defaultPosition.lat, location?.lon || defaultPosition.lon]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <ReCenterMap location={location} />
                {location?.lat && location?.lon && (
                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  >
                    <Popup>Drag to change location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Payment Method</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`border p-4 rounded-xl flex items-center gap-3 text-left transition ${paymentMethod === 'cod'
                  ? 'border-orange-500 bg-orange-50 shadow'
                  : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('cod')}
            >
              <span className="inline-flex items-center h-10 w-10 justify-center rounded-full bg-green-100">
                <MdDeliveryDining className='text-xl text-green-600' />
              </span>
              <div>
                <p className="font-medium text-gray-800">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when your food arrives.</p>
              </div>
            </div>


            <div
              className={`border p-4 rounded-xl flex items-center gap-3 text-left transition ${paymentMethod === 'online'
                  ? 'border-orange-500 bg-orange-50 shadow'
                  : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('online')}
            >
              <span className="inline-flex items-center h-10 w-10 justify-center rounded-full bg-purple-100">
                <FaMobileButton className="text-lg text-purple-600" />

              </span>

              <span className="inline-flex items-center h-10 w-10 justify-center rounded-full bg-blue-100">
                <FaCreditCard className="text-lg text-blue-600" />

              </span>
              <div>
                <p className="font-medium text-gray-800">UPI / Credit / Debit </p>
                <p className="text-xs text-gray-500">Pay securely online.</p>
              </div>
            </div>

          </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>Order Summary</h2>
          <div className='rounded-xl border bg-gray-50 p-4 space-y-2'>

                {cartItems.map((item,index)=>(
                  <div key={index} className='flex justify-between text-sm text-gray-700'>

                    <span>{item.name} x {item.quantity}</span>
                    <span>RS{item.price*item.quantity}</span>
                  
                  </div>

                ))}
                <hr className='border-gray-200 my-2'></hr>

                <div className='flex justify-between font-medium text-gray-800'>
                  <span>Subtotal</span>
                  <span>{totalAmount}</span>
                </div>
                <div className='flex justify-between text-gray-700'>
                  <span>Delivery Fee</span>
                  <span>{deliveryFee==0?"Free":deliveryFee}</span>
                </div>
                <div className='flex justify-between text-lg font-bold text-[#ff4d2d] pt-2'>
                  <span>Total</span>
                  <span>{AmountWithDeliveryFee}</span>
                </div>

          </div>
        </section>

        <button 
          className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed' 
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"
          )}
        </button>


      </div>
    </div>
  );
}

export default CheckOut;
