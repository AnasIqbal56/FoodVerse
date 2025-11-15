import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignUp() {
  const primaryColor = "#ff4d2d";
  const borderColor = "#ffb3a1";
  const [showpassword, setShowpassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, mobile, password, role },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      setErr("");
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!mobile) return setErr("Mobile number is required");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        fullName: result.user.displayName,
        email: result.user.email,
        role,
        mobile
      }, { withCredentials: true });
      dispatch(setUserData(data));
      setErr("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: "linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(245,245,245,0.6)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80')"
      }}
    >
      <div className="backdrop-blur-2xl bg-white/60 rounded-2xl shadow-2xl w-full max-w-md p-10 border border-white/50">
        <h1 className="text-4xl font-extrabold text-center mb-3" style={{ color: primaryColor }}>FoodVerse</h1>
        <p className="text-gray-800 text-center mb-8 text-sm">Create your account to get started with delicious food deliveries</p>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">Full Name</label>
          <input type="text" placeholder="Enter your full name" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">E-mail</label>
          <input type="email" placeholder="Enter your e-mail" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">Mobile-no</label>
          <input type="text" placeholder="Enter your Mobile-number" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">Password</label>
          <div className="relative">
            <input type={showpassword ? "text" : "password"} placeholder="Enter your password" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="absolute right-4 top-[14px] text-gray-500" onClick={() => setShowpassword(prev => !prev)}>
              {showpassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">Role</label>
          <div className="flex gap-2">
            {['user','owner','deliveryBoy'].map(r => (
              <button key={r} className="flex-1 border rounded-xl px-3 py-2 text-center font-medium transition-colors" onClick={() => setRole(r)} style={role===r ? {backgroundColor: primaryColor, color:'white'} : {border:`1px solid ${primaryColor}`, color: primaryColor}}>{r}</button>
            ))}
          </div>
        </div>

        <button className="w-full font-semibold rounded-xl py-3 bg-[#ff4d2d] text-white hover:bg-[#e64323] transition" onClick={handleSignUp} disabled={loading}>
          {loading ? <ClipLoader size={20} color="white"/> : 'Sign Up'}
        </button>

        {err && <p className="text-red-600 text-center mt-3">*{err}</p>}

        <button className="w-full mt-5 flex items-center justify-center gap-3 border rounded-xl px-4 py-3 hover:bg-gray-100 transition border-gray-400" onClick={handleGoogleAuth}>
          <FcGoogle size={22}/> <span className="font-medium">Sign Up with Google</span>
        </button>

        <p className="text-center mt-6 text-gray-800" onClick={() => navigate('/signin')}>Already have an account? <span className="text-[#ff4d2d] font-semibold cursor-pointer">Sign In</span></p>
      </div>
    </div>
  );
}

export default SignUp;
