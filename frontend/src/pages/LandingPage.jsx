import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TopSlider from "../components/TopSlider.jsx";

// Import images
import image5 from "../assets/image5.jpg";
import image6 from "../assets/image6.jpg";
import image7 from "../assets/image7.jpg";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 overflow-hidden">

      {/* 🔥 TOP SLIDER HERE */}
      <TopSlider />

      {/* Add margin-top because slider is fixed */}
      <div className="pt-12"></div>

      {/* HERO SECTION */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <span className="text-4xl">🍃</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                FoodVerse
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl lg:text-6xl font-bold leading-tight"
            >
              <span className="text-red-600">Bold Bites,</span>
              <br />
              <span className="text-orange-500">Bright Vibes</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-700 leading-relaxed max-w-lg"
            >
              Sun-kissed flavors in every dish, layered with bold spices,
              crafted to ignite your cravings, and served with a vibe that makes
              every moment feel golden.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="bg-black text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg"
            >
              Get started
            </motion.button>
          </motion.div>

          {/* RIGHT CONTENT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center items-center h-[600px]"
          >
            {/* Outer dashed circle */}
            <svg className="absolute w-[500px] h-[500px]" viewBox="0 0 500 500">
              <circle
                cx="250"
                cy="250"
                r="220"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2"
                strokeDasharray="10,10"
              />
            </svg>

            {/* CENTER IMAGE */}
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-64 h-64 rounded-full bg-white shadow-2xl flex items-center justify-center z-10 overflow-hidden"
            >
              <img
                src={image6}
                alt="center food"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* ORBITING IMAGES */}
            {[image5, image6, image7, image5, image6].map((img, index) => {
              const angles = [0, 72, 144, 216, 288];
              const delays = [0, 0.2, 0.4, 0.6, 0.8];
              const radius = 220;

              const x = Math.cos((angles[index] * Math.PI) / 180) * radius;
              const y = Math.sin((angles[index] * Math.PI) / 180) * radius;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delays[index], duration: 0.5 }}
                  className="absolute w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                >
                  <motion.img
                    src={img}
                    alt="orbit food"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: delays[index],
                    }}
                    className="w-full h-full object-cover rounded-full"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-white py-20"
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — Floating images */}
            <div className="relative flex justify-center">
              <div className="relative">

                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <circle
                    cx="200"
                    cy="200"
                    r="180"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="2"
                    strokeDasharray="10,10"
                  />
                </svg>

                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center shadow-2xl overflow-hidden">
                  <img
                    src={image7}
                    alt="Main Dish"
                    className="w-full h-full object-cover"
                  />
                </div>

                {[  
                  { src: image5, angle: 30, radius: 160 },
                  { src: image6, angle: 330, radius: 170 },
                  { src: image7, angle: 210, radius: 165 }
                ].map((item, index) => {
                  const x = Math.cos((item.angle * Math.PI) / 180) * item.radius;
                  const y = Math.sin((item.angle * Math.PI) / 180) * item.radius;

                  return (
                    <motion.div
                      key={index}
                      animate={{ y: [0, -15, 0], rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
                      className="absolute"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                      }}
                    >
                      <img
                        src={item.src}
                        alt=""
                        className="w-20 h-20 rounded-full shadow-lg object-cover"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT ABOUT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-5xl font-bold text-red-600">About Us</h2>

              <h3 className="text-3xl leading-relaxed">
                <span className="text-yellow-500 font-semibold">Our Story,</span>{" "}
                <span className="text-orange-600 font-bold">Spiced to</span>{" "}
                <span className="text-red-600 font-bold">Perfection</span>
              </h3>

              <p className="text-gray-700 leading-relaxed text-lg">
                We believe food should be more than just a meal — it should be an
                experience. From hand-picked ingredients to sun-kissed spices and bold
                flavors, every dish we create is a celebration of warmth, joy, and
                culture.
              </p>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* FOOTER */}
      <div className="bg-gray-900 text-white py-8 text-center">
        <p className="text-sm">Made with ❤️ for food lovers everywhere</p>
        <p className="text-xs text-gray-400 mt-2">FoodVerse © 2025</p>
      </div>

    </div>
  );
}

export default LandingPage;
