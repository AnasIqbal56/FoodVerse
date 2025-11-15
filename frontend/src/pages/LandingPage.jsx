import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, ChefHat, DollarSign, Bike, Search, ShoppingCart, Truck, Mail, Phone, Globe, Award, Clock, Heart, ArrowUp } from "lucide-react";
import image1 from "../assets/generated-image1.png";
import image2 from "../assets/generated-image2.png";
import image3 from "../assets/generated-image3.png";
import burger from "../assets/burgurs.png";
import pizza from "../assets/pizzas.png";
import asian from "../assets/Asian-Food.jpg";
import bakery from "../assets/bakery.png";
import cakes from "../assets/cakes.png";

// Food Slider Data
const foodItems = [
  { id: 1, name: "Gourmet Burger", image: image1, description: "Juicy, Fresh & Delicious" },
  { id: 2, name: "Classic Pizza", image: image2, description: "Crispy Crust, Premium Toppings" },
  { id: 3, name: "Asian Delights", image: image3, description: "Authentic & Flavorful" },
];

// Static Emojis Component (NO ANIMATION)
const StaticEmoji = ({ emoji }) => (
  <span className="inline-block text-5xl">{emoji}</span>
);

// Minimalist Icon Components with animations (ICON ONLY, NO EMOJI)
const SpeedIcon = () => (
  <motion.div 
    animate={{ y: [0, -8, 0] }} 
    transition={{ duration: 2, repeat: Infinity }}
    className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white"
  >
    <Zap size={24} />
  </motion.div>
);

const QualityIcon = () => (
  <motion.div 
    animate={{ rotate: [0, 360] }} 
    transition={{ duration: 4, repeat: Infinity, linear: true }}
    className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white"
  >
    <ChefHat size={24} />
  </motion.div>
);

const PriceIcon = () => (
  <motion.div 
    animate={{ scale: [1, 1.1, 1] }} 
    transition={{ duration: 2, repeat: Infinity }}
    className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white"
  >
    <DollarSign size={24} />
  </motion.div>
);

const DeliveryIcon = () => (
  <motion.div 
    animate={{ x: [0, 10, -10, 0] }} 
    transition={{ duration: 2, repeat: Infinity }}
    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"
  >
    <Bike size={24} />
  </motion.div>
);

function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentFood, setCurrentFood] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!autoSlide) return;
    const timer = setInterval(() => {
      setCurrentFood((prev) => (prev + 1) % foodItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoSlide]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGetStarted = () => navigate("/signin");
  const handleLogin = () => navigate("/signin");

  const nextFood = () => {
    setCurrentFood((prev) => (prev + 1) % foodItems.length);
    setAutoSlide(false);
  };

  const prevFood = () => {
    setCurrentFood((prev) => (prev - 1 + foodItems.length) % foodItems.length);
    setAutoSlide(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: '#f7d26eff' }}>
      
      {/* FULL PAGE GRADIENT BACKGROUND WITH IMAGE EFFECT */}
      <div className="fixed inset-0 -z-20">
        {/* Base Gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f7d26eff 0%, #fef3c7 50%, #f5f3ff 100%)' }} />
        
        {/* Animated Gradient Overlay */}
        <motion.div
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(193, 18, 31, 0.1), rgba(190, 146, 2, 0.08))',
            backgroundSize: "200% 200%"
          }}
        />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(255,69,0,0.1)_35px,rgba(255,69,0,0.1)_70px)]" />
        
        {/* Radial Light Effects */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(193, 18, 31, 0.15)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(190, 146, 2, 0.15)' }}
        />
      </div>

      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 backdrop-blur-md shadow-sm z-50"
        style={{ backgroundColor: 'rgba(247, 210, 110, 0.95)' }}
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <StaticEmoji emoji="🍕" />
            <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-playfair">
              FOODVERSE
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { name: "Menu", href: "#menu" },
              { name: "Why Us", href: "#why" },
              { name: "Contact", href: "#contact" }
            ].map((link, idx) => (
              <motion.a
                key={idx}
                href={link.href}
                whileHover={{ color: "#FF6B35" }}
                className="text-gray-700 font-medium transition-colors"
              >
                {link.name}
              </motion.a>
            ))}
          </nav>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="hidden md:block text-white px-6 py-2 rounded-full font-semibold text-sm hover:shadow-lg transition-shadow"
            style={{ backgroundColor: '#C1121F' }}
          >
            Login
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl"
          >
            {isMenuOpen ? "✕" : "☰"}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-3">
                {[
                  { name: "Menu", href: "#menu" },
                  { name: "Why Us", href: "#why" },
                  { name: "Contact", href: "#contact" }
                ].map((link, idx) => (
                  <motion.a
                    key={idx}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-gray-700 font-medium"
                  >
                    {link.name}
                  </motion.a>
                ))}
                <motion.button
                  onClick={handleLogin}
                  className="w-full text-white px-6 py-2 rounded-full font-semibold"
                  style={{ backgroundColor: '#C1121F' }}
                >
                  Login
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="pt-24"></div>

      {/* HERO SECTION */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Static Emojis */}
            <div className="flex gap-3">
              <StaticEmoji emoji="🍔" />
              <StaticEmoji emoji="🍕" />
              <StaticEmoji emoji="🍜" />
            </div>

            {/* Bold Bites - Improved */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-5xl md:text-7xl font-black font-playfair leading-tight mb-4">
                <span className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  Bold Bites
                </span>
                <br />
                <span className="text-gray-900 font-playfair">Unforgettable</span>
                <br />
                <span className="text-gray-900 font-playfair">Moments</span>
              </h1>
              <motion.div
                animate={{ scaleX: [0, 1] }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-1 w-24 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-gray-700 font-light leading-relaxed max-w-lg"
            >
              Experience flavors that dance on your taste buds. Every bite crafted with passion, delivered with speed, savored with joy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-shadow"
                style={{ backgroundColor: '#C1121F' }}
              >
                Order Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 px-8 py-4 rounded-full font-bold text-lg hover:transition-colors"
                style={{ borderColor: '#3E2723', color: '#3E2723' }}
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex gap-8 pt-4"
            >
              {[
                { number: "500+", label: "Restaurants" },
                { number: "50K+", label: "Happy Users" },
                { number: "4.9★", label: "Rating" }
              ].map((stat, idx) => (
                <div key={idx}>
                  <p className="text-2xl font-black text-red-600">{stat.number}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Food Slider */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Slider */}
            <div className="relative h-96 md:h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #be9202ff 0%, #C1121F 100%)' }}>
              <AnimatePresence mode="wait">
                {foodItems.map((item, idx) => (
                  idx === currentFood && (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8"
                    >
                      <motion.img
                        src={item.image}
                        alt={item.name}
                        className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-xl"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mt-8"
                      >
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">{item.name}</h2>
                        <p className="text-gray-600 font-light">{item.description}</p>
                      </motion.div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>

              {/* Slider Controls */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevFood}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur hover:bg-white text-gray-800 p-3 rounded-full shadow-lg z-10"
              >
                ←
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextFood}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur hover:bg-white text-gray-800 p-3 rounded-full shadow-lg z-10"
              >
                →
              </motion.button>

              {/* Dot Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {foodItems.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      setCurrentFood(idx);
                      setAutoSlide(false);
                    }}
                    animate={{
                      scale: idx === currentFood ? 1.3 : 1,
                      backgroundColor: idx === currentFood ? "#FF6B35" : "rgba(255, 255, 255, 0.5)"
                    }}
                    className="w-3 h-3 rounded-full backdrop-blur"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE FOODVERSE */}
      <section id="why" className="container mx-auto px-4 md:px-6 py-20" style={{ backgroundColor: '#f7d26eff' }}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT - Features List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold" style={{ color: '#3E2723' }}>
              Why Choose FoodVerse?
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  icon: "⚡",
                  title: "Lightning Fast Delivery",
                  description: "Get your food delivered hot and fresh in under 30 minutes"
                },
                {
                  icon: "🎯",
                  title: "Wide Selection",
                  description: "Choose from hundreds of restaurants and thousands of dishes"
                },
                {
                  icon: "🔒",
                  title: "Secure Payments",
                  description: "Multiple payment options with bank-level security"
                },
                {
                  icon: "⭐",
                  title: "Quality Assured",
                  description: "Only verified restaurants with top ratings"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-start p-4 rounded-2xl hover:shadow-md transition-shadow"
                  style={{ backgroundColor: '#fff' }}
                >
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#3E2723' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#2C1810', opacity: 0.7 }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT - Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            {[burger, pizza, asian, bakery].map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="rounded-3xl overflow-hidden shadow-lg"
                style={{
                  height: index === 1 || index === 2 ? '280px' : '200px',
                  background: index % 2 === 0 ? '#C1121F' : '#be9202ff',
                  padding: '4px'
                }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
                  <img
                    src={img}
                    alt={`food ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 md:px-6 py-20 bg-white relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center gap-2 mb-4">
            <StaticEmoji emoji="🔍" />
            <StaticEmoji emoji="📱" />
            <StaticEmoji emoji="🚴" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-playfair text-gray-900 mb-4">
            How It <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Three simple steps to get your favorite food delivered
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent z-0" />

          {[
            { 
              step: 1, 
              emoji: "🔍", 
              title: "Browse & Select",
              desc: "Explore hundreds of restaurants and thousands of delicious dishes at your fingertips"
            },
            { 
              step: 2, 
              emoji: "🛒", 
              title: "Easy Checkout",
              desc: "Add items to cart and checkout securely with your preferred payment method"
            },
            { 
              step: 3, 
              emoji: "🚴", 
              title: "Fast Delivery",
              desc: "Track your order in real-time and enjoy hot, fresh food at your doorstep"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative z-10"
            >
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-orange-300">
                {/* Step Circle */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6"
                >
                  {item.step}
                </motion.div>

                {/* Emoji */}
                <div className="text-5xl mb-4">{item.emoji}</div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700 font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHAT OUR CUSTOMERS SAY - DETAILED */}
      <section className="container mx-auto px-4 md:px-6 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
              
        </motion.div>

        </section>

      {/* IMPROVED CONTACT SECTION */}
      <section id="contact" className="container mx-auto px-4 md:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <StaticEmoji emoji="📧" />
            <StaticEmoji emoji="📱" />
            <StaticEmoji emoji="🌍" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-playfair text-gray-900 mb-4">
            Get In <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto font-light">
            We're here to help. Reach out to us anytime!
          </p>
        </motion.div>

        {/* Contact Methods Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {[
            {
              icon: "📧",
              title: "Email",
              value: "support@foodverse.com",
              desc: "We'll respond within 2 hours",
              link: "mailto:support@foodverse.com"
            },
            {
              icon: "📱",
              title: "Phone",
              value: "+1 (555) 123-4567",
              desc: "Available 24/7 for support",
              link: "tel:+15551234567"
            },
            {
              icon: "🌍",
              title: "Live Chat",
              value: "Chat with us now",
              desc: "Instant support from our team",
              link: "#chat"
            }
          ].map((contact, idx) => (
            <motion.a
              key={idx}
              href={contact.link}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center border-2 border-gray-100 hover:border-orange-400 cursor-pointer"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                {contact.icon}
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{contact.title}</h3>
              <p className="text-lg font-semibold text-red-600 mb-2">{contact.value}</p>
              <p className="text-gray-700 font-light">{contact.desc}</p>
            </motion.a>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-12 md:p-16 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #C1121F 0%, #3E2723 100%)' }}
        >
          <div className="flex justify-center gap-2 mb-6">
            <StaticEmoji emoji="🎉" />
            <StaticEmoji emoji="🍕" />
            <StaticEmoji emoji="🎊" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-playfair mt-4 mb-6">
            Ready to Order?
          </h2>
          <p className="text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto">
            Download the FoodVerse app or order online. Delicious food is just a click away!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            className="text-red-600 px-12 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: '#be9202ff' }}
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </section>



      {/* WHERE WE DELIVER SECTION */}
      <section className="py-24" style={{ backgroundColor: '#fff' }}>
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black font-playfair mb-6" style={{ color: '#3E2723' }}>
              Where We Deliver
            </h2>
            <p className="text-lg md:text-xl font-light max-w-3xl mx-auto" style={{ color: '#2C1810', opacity: 0.8 }}>
              Expanding across Pakistan to bring delicious food to your doorstep
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { emoji: '🏙️', city: 'Karachi', areas: '5+ Areas', status: 'Active', color: '#C1121F' },
              { emoji: '🏛️', city: 'Islamabad', areas: '3+ Areas', status: 'Coming Soon', color: '#be9202ff' },
              { emoji: '🌆', city: 'Lahore', areas: '4+ Areas', status: 'Coming Soon', color: '#C1121F' },
              { emoji: '⛰️', city: 'Peshawar', areas: '2+ Areas', status: 'Coming Soon', color: '#be9202ff' },
              { emoji: '🕌', city: 'Multan', areas: '2+ Areas', status: 'Coming Soon', color: '#C1121F' },
              { emoji: '🌾', city: 'Faisalabad', areas: '2+ Areas', status: 'Coming Soon', color: '#be9202ff' },
              { emoji: '🏞️', city: 'Hyderabad', areas: '1+ Area', status: 'Coming Soon', color: '#C1121F' },
              { emoji: '🌊', city: 'Gwadar', areas: '1+ Area', status: 'Coming Soon', color: '#be9202ff' },
            ].map((location, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(193, 18, 31, 0.15)' }}
                className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center bg-white"
                style={{ borderTop: `4px solid ${location.color}` }}
              >
                <div className="text-5xl mb-4">{location.emoji}</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#3E2723' }}>
                  {location.city}
                </h3>
                <p className="text-sm mb-4" style={{ color: '#2C1810', opacity: 0.6 }}>
                  {location.areas}
                </p>
                <span 
                  className="inline-block px-4 py-2 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: location.status === 'Active' ? '#C1121F' : '#999' }}
                >
                  {location.status}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DETAILED CUSTOMER TESTIMONIALS SECTION */}
      <section className="py-24" style={{ backgroundColor: '#f7d26eff' }}>
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black font-playfair mb-6" style={{ color: '#3E2723' }}>
              What Our Customers Say
            </h2>
            <p className="text-lg md:text-xl font-light max-w-3xl mx-auto" style={{ color: '#2C1810', opacity: 0.8 }}>
              Join thousands of satisfied food lovers experiencing FoodVerse
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Javed",
                city: "Karachi",
                rating: 5,
                comment: "Best food delivery service ever! Fast, reliable, and the food always arrives hot. The app is incredibly easy to use and customer support is amazing. I order at least 3 times a week!",
                avatar: "👩",
                orders: "150+ Orders",
                badge: "Gold Member"
              },
              {
                name: "Ahmed Hassan",
                city: "Lahore",
                rating: 5,
                comment: "Outstanding service! The real-time tracking is fantastic. I always know exactly when my food will arrive. Delivery boys are professional and courteous. Never disappointed with any order.",
                avatar: "👨",
                orders: "200+ Orders",
                badge: "Platinum Member"
              },
              {
                name: "Ayesha Siddiqui",
                city: "Islamabad",
                rating: 5,
                comment: "FoodVerse has become my go-to app for meals. Great prices, excellent quality, and fantastic customer service. The loyalty rewards program is excellent. Highly recommended to everyone!",
                avatar: "👩‍🦱",
                orders: "120+ Orders",
                badge: "Gold Member"
              },
              {
                name: "Fatima Ali",
                city: "Peshawar",
                rating: 5,
                comment: "Amazing restaurant selection! From local Pakistani dishes to international cuisine, everything is available. The packaging is eco-friendly and the delivery is always on time. Keep up the great work!",
                avatar: "👱‍♀️",
                orders: "95+ Orders",
                badge: "Silver Member"
              },
              {
                name: "Hassan Khan",
                city: "Multan",
                rating: 5,
                comment: "I've tried many food delivery apps, and FoodVerse is definitely the best. The restaurant selection is diverse, prices are competitive, and the delivery speed is lightning fast. Worth every penny!",
                avatar: "🧔",
                orders: "180+ Orders",
                badge: "Platinum Member"
              },
              {
                name: "Aans Sheikh",
                city: "Faisalabad",
                rating: 5,
                comment: "Excellent app design! Very intuitive and user-friendly. Finding exactly what I want takes seconds. Multiple payment options and secure checkout. Customer service team is always helpful and responsive!",
                avatar: "👩‍🦰",
                orders: "110+ Orders",
                badge: "Gold Member"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all"
              >
                {/* Header with Avatar and Rating */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-md"
                      style={{ backgroundColor: '#be9202ff' }}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg" style={{ color: '#3E2723' }}>
                        {testimonial.name}
                      </h4>
                      <p className="text-sm" style={{ color: '#2C1810', opacity: 0.6 }}>
                        📍 {testimonial.city}
                      </p>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-xl">⭐</span>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="leading-relaxed mb-6 text-base" style={{ color: '#2C1810', opacity: 0.9 }}>
                  "{testimonial.comment}"
                </p>

                {/* Stats and Badge */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#C1121F30' }}>
                  <div>
                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.6 }}>Orders Placed</p>
                    <p className="font-bold" style={{ color: '#C1121F' }}>
                      {testimonial.orders}
                    </p>
                  </div>
                  <span 
                    className="px-4 py-2 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#C1121F' }}
                  >
                    {testimonial.badge}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-20 grid md:grid-cols-4 gap-8"
          >
            {[
              { icon: '👥', number: '50K+', label: 'Happy Customers', color: '#C1121F' },
              { icon: '⭐', number: '4.9★', label: 'Average Rating', color: '#be9202ff' },
              { icon: '✅', number: '95%', label: 'Satisfaction Rate', color: '#C1121F' },
              { icon: '📦', number: '10M+', label: 'Orders Delivered', color: '#be9202ff' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl bg-white shadow-lg"
                style={{ borderTop: `4px solid ${stat.color}` }}
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-black mb-2" style={{ color: '#3E2723' }}>
                  {stat.number}
                </h3>
                <p className="text-sm font-semibold" style={{ color: '#2C1810', opacity: 0.7 }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SCROLL TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg z-40 flex items-center justify-center"
            style={{ backgroundColor: '#C1121F' }}
          >
            <ArrowUp size={24} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🍕</span>
                <span className="font-bold text-lg">FOODVERSE</span>
              </div>
              <p className="text-gray-400 font-light">Your favorite food, delivered with love.</p>
            </div>
            {[
              { title: "Company", items: ["About", "Careers", "Blog"] },
              { title: "Support", items: ["Help", "FAQ", "Contact"] },
              { title: "Legal", items: ["Privacy", "Terms", "Cookies"] }
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-bold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map((item, i) => (
                    <motion.li key={i} whileHover={{ x: 5 }} className="text-gray-400 cursor-pointer">
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 font-light">
            <p>© 2025 FoodVerse. Made with ❤️ for food lovers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
