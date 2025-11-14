import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  "🔥 50% OFF on your first food order!",
  "🚀 Fast delivery within 20 minutes!",
  "🍽️ Fresh meals cooked by top chefs!",
  "🎁 Get FREE dessert on orders above Rs 1200!",
];

export default function TopSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-orange-500 text-white font-bold py-3 overflow-hidden shadow-md relative h-12 md:h-14 lg:h-16">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ x: "-100%" }} 
          animate={{ x: ["-100%", "100vw"] }}  // FULL movement across screen
          transition={{ duration: 5, ease: "linear" }}
          className="absolute whitespace-nowrap left-0 top-1/2 -translate-y-1/2 px-4 text-lg md:text-xl lg:text-2xl"
        >
          {slides[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
