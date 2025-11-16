import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";

export default function SignIn() {
  const primaryColor = "#ff4d2d";
  const borderColor = "#ffb3a1";
  const [showpassword, setShowpassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      setErr("");
      setLoading(false);
      
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 0);
    } catch (error) {
      setErr(error?.response?.data?.message || "Sign in failed");
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErr("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        { email: result.user.email },
        { withCredentials: true }
      );

      // Set user data and wait for next tick before navigating
      // Backend returns { message, user } so extract the user
      dispatch(setUserData(data.user || data));
      setLoading(false);
      
      // Use setTimeout to ensure state update completes
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 0);
    } catch (error) {
      setErr("Google authentication failed");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center p-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(245,245,245,0.6)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      <div className="backdrop-blur-2xl bg-white/60 rounded-2xl shadow-2xl w-full max-w-md p-10 border border-white/50">
        <h1 className="text-4xl font-extrabold text-center mb-3" style={{ color: primaryColor }}>
          FoodVerse
        </h1>
        <p className="text-gray-800 text-center mb-8 text-sm">
          Sign in to enjoy fresh, fast, and delicious food deliveries
        </p>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">E-mail</label>
          <input
            type="email"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
            style={{ borderColor }}
            placeholder="Enter your e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">Password</label>
          <div className="relative">
            <input
              type={showpassword ? "text" : "password"}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
              style={{ borderColor }}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-4 top-[14px] text-gray-500"
              onClick={() => setShowpassword((prev) => !prev)}
            >
              {showpassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </div>

        <div
          className="text-right mb-4 text-[#ff4d2d] font-medium cursor-pointer hover:underline"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </div>

        <button
          className="w-full font-semibold rounded-xl py-3 bg-[#ff4d2d] text-white hover:bg-[#e64323] transition"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>

        {err && <p className="text-red-600 text-center mt-3">*{err}</p>}

        <button
          className="w-full mt-5 flex items-center justify-center gap-3 border rounded-xl px-4 py-3 hover:bg-gray-100 transition border-gray-400"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={22} />
          <span className="font-medium">Sign in with Google</span>
        </button>

        <p className="text-center mt-6 text-gray-800">
          Don't have an account?{' '}
          <span
            className="text-[#ff4d2d] font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}