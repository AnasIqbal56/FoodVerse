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

function SignIn() {
  const primaryColor = "#ff4d2d";
  const borderColor = "#ffb3a1";
  const [showpassword, setShowpassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Normal email/password sign-in
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
      navigate("/"); 
    } catch (error) {
      setErr(error?.response?.data?.message || "Sign in failed");
      setLoading(false);
    }
  };

  //  Google authentication
  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        { email: result.user.email },
        { withCredentials: true }
      );

      dispatch(setUserData(data));
      navigate("/"); // ✅ Redirect immediately to homepage
    } catch (error) {
      console.error("Google login error:", error);
      setErr("Google authentication failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4" style={{ backgroundColor: "#fff9f6" }}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border" style={{ borderColor }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>FoodVerse</h1>
        <p className="text-grey-600 mb-8">
          Sign in to your account to get started with delicious food deliveries
        </p>

        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">E-mail</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            placeholder="Enter your e-mail"
            style={{ borderColor }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showpassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              placeholder="Enter your password"
              style={{ borderColor }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[14px] text-gray-500"
              onClick={() => setShowpassword((prev) => !prev)}
            >
              {showpassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div
          className="text-right mb-4 text-[#ff4d2d] font-medium cursor-pointer"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </div>

        {/* Sign In Button */}
        <button
          className="w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323]"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>

        {/* Error */}
        {err && <p className="text-red-500 text-center mt-2">*{err}</p>}

        {/* Google Sign In */}
        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign in with Google</span>
        </button>

        {/* Sign Up Link */}
        <p className="text-center mt-6 cursor-pointer" onClick={() => navigate("/signup")}>
          Want to create a new account?{" "}
          <span className="text-[#ff4d2d]">Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
