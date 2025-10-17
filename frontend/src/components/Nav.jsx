import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { FaLocationDot } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RxCross1 } from "react-icons/rx";

function Nav() {
    const { userData ,city } = useSelector(state => state.user);
    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const dispatch=useDispatch();
    const handleLogout = async ()=>{
        try{
            const result=await axios.get(`${serverUrl}/api/auth/signout`,{withCredentials:true})
            dispatch(setUserData(null))
        } catch(error){
            console.log(error)
        }
    }

    return (
        <div className="w-full h-[80px] flex items-center justify-between md:justify-center
        gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible">

            {showSearch && <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center
          gap-[20px] flex fixed top-[80px] left-[5%] md:hidden">
                <div className="flex items-center gap-[10px] w-[30%] overflow-hidden px-[10px]
            border-r-[2px] border-gray-400">
                    <FaLocationDot size={25} className=" text-[#ff4d2d]" />
                    <div className="w-[80%] truncate text-gray-600">{city}</div>
                </div>

                <div className="w-[80%] flex items-center gap-[10px]">
                    <FaSearch size={25} className="text-[#ff4d2d]" />
                    <input type="text" placeholder="Search delicious food" className="px-[10px] 
              text-gray-700 outline-0 w-full"></input>
                </div>
            </div>}



 
            <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">Food Verse </h1>
            <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center
          gap-[20px] hidden md:flex">
                <div className="flex items-center gap-[10px] w-[30%] overflow-hidden px-[10px]
            border-r-[2px] border-gray-400">
                    <FaLocationDot size={25} className=" text-[#ff4d2d]" />
                    <div className="w-[80%] truncate text-gray-600">{city}</div>
                </div>

                <div className="w-[80%] flex items-center gap-[10px]">
                    <FaSearch size={25} className="text-[#ff4d2d]" />
                    <input type="text" placeholder="Search delicious food" className="px-[10px] 
              text-gray-700 outline-0 w-full"></input>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {showSearch?<RxCross1 className="text-[#ff4d2d] md:hidden" onClick={()=>setShowSearch(false)}/>
                :<FaSearch size={25} className="text-[#ff4d2d] md:hidden" 
                onClick={()=>setShowSearch(true)}/>}
                

                <div className="relative cursor-pointer">
                    <IoCartOutline size={25} className="text-[#ff4d2d]" />
                    <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d]">0</span>
                </div>

                <button className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10
          text-[#ff4d2d] text-sm font-medium">
                    My Orders
                </button>

                <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center
          bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
                    onClick={() => setShowInfo(prev => !prev)}>
                    {(userData?.fullName ?? "").slice(0, 1)}
                </div>

                {showInfo && <div className="fixed top-[80px] right-[80px] md:right-[10%] lg:right-[25%]
          w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]">
                    <div className="text-[17px] font-semibold">{userData?.fullName ?? "User"}</div>
                    <div className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer">My Orders</div>
                    <div className="text-[#ff4d2d] font-semibold cursor-pointer" 
                    onClick={handleLogout}>Log Out</div>
                </div>}


            </div>
        </div>
    );
}


export default Nav;