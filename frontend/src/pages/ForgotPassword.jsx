import React from "react";
import axios from "axios";
const serverUrl = "http://localhost:8000";

import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { Navigate, useNavigate } from "react-router-dom";
function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();


    const handleSendOtp=async () => {
        
        try {
            const result=await axios.post(`${serverUrl}/api/auth/send-otp`,{email},
            {withCredentials:true})
            console.log(result)
            setStep(2)
        } catch (error) {
            console.log(error)
        }
    }

 const handleVerifyOtp=async () => {
        
        try {
            const result=await axios.post(`${serverUrl}/api/auth/verify-otp`,{email,otp},
            {withCredentials:true})
            console.log(result)
            setStep(3)
        } catch (error) {
            console.log(error)
        }
    }

const handleResetPassword=async () => {
        if(newPassword!=confirmPassword){
            return null
        }
        try {
            console.log("Reset password payload:", { email, newPassword, confirmPassword });

            const result=await axios.post(`${serverUrl}/api/auth/reset-password`,{email,newpassword:newPassword},
            {withCredentials:true})
            console.log(result)
            alert(result.data.message);
            navigate("/signin")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='flex w-full item-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
            <div className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md'>
                <div className="flex item-center gap-4 mb-4">
                    <IoArrowBack size={30} className='text-[#ff4d2d] cursor-pointer' onClick={()=>navigate("/signin")} />
                    <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">Forgot Password</h1>
                </div>

                {step == 1 &&
                    <div>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                                E-mail
                            </label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border-[1px] border-gray-200 rounded-lg focus:outline-none 
                                palceholder-gray-400"
                                placeholder="Enter your e-mail"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>


                        <button
                            className={`w-full font-semibold rounded-lg py-2 transition duration-200 
                            bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`} onClick={handleSendOtp}>
                            Send OTP
                        </button>

                    </div>
                }

                {step == 2 &&
                    <div>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                                OTP
                            </label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border-[1px] border-gray-200 rounded-lg focus:outline-none 
                                palceholder-gray-400"
                                placeholder="Enter your OTP"
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                            />
                        </div>


                        <button
                            className={`w-full font-semibold rounded-lg py-2 transition duration-200 
                            bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`} onClick={handleVerifyOtp}>
                            Verify OTP
                        </button>

                    </div>
                }

                {step == 3 &&
                    <div>
                        {/* enter new password */}
                        <div className="mb-6">
                            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
                                New Password
                            </label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border-[1px] border-gray-200 rounded-lg focus:outline-none 
                                palceholder-gray-400"
                                placeholder="Enter New Password"
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                            />
                        </div>

                        {/* confrim new password */}
                        <div className="mb-6">
                            <label htmlFor="ConfirmPassword" className="block text-gray-700 font-medium mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border-[1px] border-gray-200 rounded-lg focus:outline-none 
                                palceholder-gray-400"
                                placeholder="Confirm your password "
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                            />
                        </div>


                        <button
                            className={`w-full font-semibold rounded-lg py-2 transition duration-200 
                            bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`} onClick={handleResetPassword}>
                            Reset Password
                        </button>

                    </div>
                }


                
            </div>
        </div>
    )
}



export default ForgotPassword;