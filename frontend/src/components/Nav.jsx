import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { LuReceipt } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { setSearchItems } from "../redux/userSlice";

function Nav() {
  const { userData, currentCity, cartItems } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  



  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

    const handleSearchItems = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
          {withCredentials:true});  
          dispatch(setSearchItems(result.data.items || []));
   
    } catch (error) {
        console.log(error)
        
      }
  
      
    }

    useEffect(() => {
      if(query){
      handleSearchItems()}
      else{
        dispatch(setSearchItems(null))
      }
    },[query])
  return (
    <div
      className="w-full h-[80px] flex items-center justify-between md:justify-center
      gap-[30px] px-[20px] fixed top-0 z-[9999] overflow-visible shadow-sm"
      style={{ background: 'linear-gradient(90deg, #f7d26eff 0%, rgba(255,255,255,0.9) 60%)' }}
    >
      {showSearch && userData.role === "user" && (
        <div
          className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center
          gap-[20px] flex fixed top-[80px] left-[5%] md:hidden"
        >
          <div
            className="flex items-center gap-[10px] w-[30%] overflow-hidden px-[10px]
            border-r-[2px] border-gray-400"
          >
            <FaLocationDot size={25} className="text-[#C1121F]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>

          <div className="w-[80%] flex items-center gap-[10px]">
            <FaSearch size={25} className="text-[#C1121F]" />
            <input
              type="text"
              placeholder="Search delicious food"
              className="px-[10px] text-gray-700 outline-0 w-full" onChange=
              {(e)=>setQuery(e.target.value)} value={query}
      
            />
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2 text-[#2C1810]">Food Verse</h1>

      {userData.role === "user" && (
        <div
          className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center
          gap-[20px] hidden md:flex"
        >
          <div
            className="flex items-center gap-[10px] w-[30%] overflow-hidden px-[10px]
            border-r-[2px] border-gray-400"
          >
            <FaLocationDot size={25} className="text-[#C1121F]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>

          <div className="w-[80%] flex items-center gap-[10px]">
            <FaSearch size={25} className="text-[#C1121F]" />
            <input
              type="text"
              placeholder="Search Delicious Food"
              className="px-[10px] text-gray-700 outline-0 w-full"       />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {userData.role === "user" &&
          (showSearch ? (
            <RxCross1
              className="text-[#C1121F] md:hidden"
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <FaSearch
              size={25}
              className="text-[#C1121F] md:hidden"
              onClick={() => setShowSearch(true)}
            />
          ))}

        {userData.role === "owner" ? (
          <>

            <div
              className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg
              bg-[#C1121F]/10 text-[#C1121F] font-medium"
              onClick={() => navigate("/my-orders")}
            >
              <LuReceipt size={20} />
              <span>My Orders</span>
              <span
                className="absolute -right-2 -top-2 text-xs font-bold text-white 
                bg-[#C1121F] rounded-full px-[6px] py-[1px]"
              >
                0
              </span>
            </div>

            <div
              className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg
              bg-[#C1121F]/10 text-[#C1121F] font-medium"
              onClick={() => navigate("/my-orders")}
            >
              <LuReceipt size={20} />
              <span
                className="absolute -right-2 -top-2 text-xs font-bold text-white 
                bg-[#C1121F] rounded-full px-[6px] py-[1px]"
              >
                0
              </span>
            </div>
          </>
        ) : (
          <>
            {userData.role === "user" && (
              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/cart")}
              >

                <IoCartOutline size={25} className="text-[#C1121F]" />
                <span className="absolute right-[-9px] top-[-12px] text-[#C1121F]">
                  {cartItems.length}
                </span>
              </div>
            )}

            {/* AI WORLD Button - Add this */}
            {userData.role === "user" && (
            <button
                className="px-3 py-1 rounded-lg bg-[#C1121F]/10
                text-[#C1121F] text-sm font-medium"
                    onClick={() => navigate("/ai-world")}
                      >
                      AI WORLD
            </button>
              )}

            <button
              className="hidden md:block px-3 py-1 rounded-lg bg-[#C1121F]/10
              text-[#C1121F] text-sm font-medium"
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </button>
          </>
        )}

        <div
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center
          bg-[#C1121F] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {(userData?.fullName ?? "").slice(0, 1)}
        </div>

        {showInfo && (
          <div
            className={`fixed top-[80px] right-[80px] 
              ${userData?.role === "deliveryBoy" ? "md:right-[20%] lg:right-[40%]" : "md:right-[10%] lg:right-[25%]"}
               w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]`}
          >
            <div className="text-[17px] font-semibold">
              {userData?.fullName ?? "User"}
            </div>
            <div
              className="md:hidden text-[#C1121F] font-semibold cursor-pointer"
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </div>
            <div
              className="text-[#C1121F] font-semibold cursor-pointer"
              onClick={handleLogout}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
