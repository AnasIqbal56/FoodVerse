import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import { useDispatch, useSelector } from "react-redux";
import { loadCartFromStorage } from "./redux/userSlice";
import Home from "./pages/Home";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetitemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrderPage from "./pages/TrackOrderPage.jsx";
import Shop from "./pages/Shop.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";

import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentCancelled from "./pages/PaymentCancelled.jsx";

// export const serverUrl =  "https://foodverse-59g3.onrender.com";
// export const serverUrl = "https://tamera-axenic-matteo.ngrok-free.dev"

export const serverUrl =  "http://localhost:8000";

function App() {
  const dispatch = useDispatch();
  
  useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  const { userData } = useSelector((state) => state.user);

  // Load cart from localStorage on app mount
  useEffect(() => {
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  return (
    <Routes>
      {/* Landing Page as the new default route */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Pages */}
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/home" replace />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/home" replace />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to="/home" replace />}
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={userData ? <Home /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/payment-success"
        element={userData ? <PaymentSuccess /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/payment-cancelled"
        element={userData ? <PaymentCancelled /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/order-placed"
        element={userData ? <OrderPlaced /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/shop/:shopId"
        element={userData ? <Shop /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/recommendations"
        element={userData ? <RecommendationsPage /> : <Navigate to="/signin" replace />}
      />
       
    </Routes>
  );
}

export default App;
