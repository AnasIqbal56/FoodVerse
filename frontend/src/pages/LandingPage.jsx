import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center text-gray-800 px-6"
      >
        <motion.h1
          className="text-6xl font-extrabold mb-4 drop-shadow-sm text-orange-600"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          🍔 FoodVerse 🍕
        </motion.h1>

        <motion.p
          className="text-2xl italic mb-3 font-semibold text-orange-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          "Arrey bhook lagi hai? Toh khana order kro na!"
        </motion.p>

        <p className="text-lg text-gray-700 mb-10 max-w-md mx-auto">
          From biryani to burgers — we deliver your cravings hot & fresh, right at your doorstep.
        </p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/signin")}
          className="px-10 py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full shadow-md font-semibold text-lg hover:shadow-lg transition duration-300"
        >
          Get Started 🍽️
        </motion.button>

        <motion.p
          className="text-sm text-gray-600 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Made with ❤️ in Pakistan 🇵🇰
        </motion.p>
      </motion.div>
    </div>
  );
}

export default LandingPage;
