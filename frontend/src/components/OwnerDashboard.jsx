import React, { useState, useMemo } from "react";
import Nav from "./Nav"; 
import { useSelector } from "react-redux";
import { FaUtensils, FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
import { motion } from "framer-motion";

// Import images from assets
import bg1 from "../assets/burgurs.png";
import bg2 from "../assets/image5.jpg";
import bgHero from "../assets/generated-image1.png";


function OwnerDashboard() {
  const { myShopData } = useSelector(state => state.owner);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!myShopData || !Array.isArray(myShopData.items)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return myShopData.items;
    return myShopData.items.filter(i => (i.name || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
  }, [myShopData, query]);

  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: '#f7d26eff' }}>
      {/* Subtle background with images and warm overlay to match landing page */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(247,210,110,0.35), rgba(193,18,31,0.03))' }} />
        <img src={bg1} alt="bg1" className="absolute inset-0 w-full h-full object-cover opacity-8 blur-sm" />
        <img src={bg2} alt="bg2" className="absolute right-8 top-20 w-80 h-80 object-cover opacity-6 rounded-xl transform rotate-3" />
      </div>

      <Nav />

      {!myShopData ? (
        <div className="flex justify-center items-center p-6 mt-20">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border" style={{ borderColor: '#C1121F20' }}>
            <FaUtensils className="text-[#C1121F] w-20 h-20 mb-4 mx-auto" />
            <h2 className="text-3xl font-playfair font-extrabold mb-3" style={{ color: '#3E2723' }}>Add Your Restaurant</h2>
            <p className="text-#2C1810 mb-6 text-base" style={{ color: '#2C1810' }}>
              Join our platform and reach thousands of hungry customers every day.
            </p>
            <button
              className="text-white font-semibold px-6 py-3 rounded-full shadow-md transition-colors duration-200"
              style={{ backgroundColor: '#C1121F' }}
              onClick={() => navigate("/create-edit-shop")}
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-12 px-4 sm:px-6 mt-12">

          {/* Main heading */}
          <div className="text-center relative z-10 pt-6 pb-2">
            <h1 className="text-4xl sm:text-5xl font-playfair font-extrabold mb-2" style={{ color: '#3E2723' }}>
              Welcome to <span style={{ color: '#C1121F' }}>{myShopData.name}</span>
            </h1>
            <p className="text-#2C1810 sm:text-lg" style={{ color: '#2C1810' }}>
              Manage your restaurant, showcase your menu, and delight your customers.
            </p>
          </div>

          {/* Restaurant Info Card */}
          <div className="bg-white rounded-2xl overflow-hidden border transition-shadow duration-300 w-full max-w-4xl relative shadow-lg" style={{ borderColor: '#C1121F20' }}>
            <div
              className="absolute top-4 right-4 p-2 text-white rounded-full shadow-md cursor-pointer transition-colors"
              onClick={() => navigate("/create-edit-shop")}
              style={{ backgroundColor: '#C1121F' }}
            >
              <FaPen size={20} />
            </div>
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#3E2723' }}>{myShopData.name}</h2>
              <p className="mb-1" style={{ color: '#2C1810', opacity: 0.9 }}>{myShopData.city}, {myShopData.state}</p>
              <p style={{ color: '#2C1810', opacity: 0.9 }}>{myShopData.address}</p>
            </div>
          </div>

          {/* MENU HERO + INTERACTIVE CONTROLS */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mt-8"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img src={bgHero} alt="menu-hero" className="w-full h-48 object-cover brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute left-6 top-6 text-white">
                <h2 className="text-3xl font-playfair font-extrabold">Your Menu</h2>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Manage items, update availability and preview how customers see your menu.</p>
              </div>
              <div className="absolute right-6 top-6 flex items-center gap-3">
                <input
                  aria-label="Search items"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search items by name or description"
                  className="px-4 py-2 rounded-full outline-none bg-white/90 text-sm w-64"
                />
                <button
                  onClick={() => navigate('/add-item')}
                  className="px-4 py-2 rounded-full font-semibold shadow"
                  style={{ backgroundColor: '#C1121F', color: 'white' }}
                >
                  Add Item
                </button>
              </div>
            </div>
          </motion.section>

          {/* Food Items Section - grid layout */}
          <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 pb-12">
            {filteredItems.length === 0 ? (
              <div className="flex justify-center items-center p-6 w-full">
                <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border" style={{ borderColor: '#C1121F20' }}>
                  <FaUtensils className="text-[#C1121F] w-20 h-20 mb-4 mx-auto" />
                  <h2 className="text-3xl font-bold mb-3" style={{ color: '#3E2723' }}>{query ? 'No results' : 'Add Your Food Item'}</h2>
                  <p className="text-#2C1810 mb-6 text-base" style={{ color: '#2C1810' }}>
                    Share your delicious creations by adding them to your menu.
                  </p>
                  <button
                    className="text-white font-semibold px-6 py-3 rounded-full shadow-md transition-colors duration-200"
                    style={{ backgroundColor: '#C1121F' }}
                    onClick={() => navigate("/add-item")}
                  >
                    Add Food
                  </button>
                </div>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div key={index} whileHover={{ y: -6, scale: 1.01 }} className="transition-shadow">
                  <OwnerItemCard data={item} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
