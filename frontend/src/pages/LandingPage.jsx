import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, ChefHat, DollarSign, Bike, Search, ShoppingCart, Truck, Mail, Phone, Globe, Award, Clock, Heart, ArrowUp, MessageCircle, Send, Facebook, Instagram, Twitter, Youtube, PartyPopper, Pizza, Utensils, UtensilsCrossed, Target, Lock, Star, MapPin, Package, CheckCircle, Users, X, Menu, Building2, Mountain, Waves, TrendingUp } from "lucide-react";
import image1 from "../assets/generated-image1.png";
import image2 from "../assets/generated-image2.png";
import image3 from "../assets/generated-image3.png";
import burger from "../assets/burgurs.png";
import pizza from "../assets/pizzas.png";
import asian from "../assets/Asian-Food.jpg";
import bakery from "../assets/bakery.png";
import cakes from "../assets/cakes.png";
import { FaUtensils } from "react-icons/fa6";
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
    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
    style={{ backgroundColor: '#C1121F' }}
  >
    <Zap size={24} />
  </motion.div>
);

const QualityIcon = () => (
  <motion.div 
    animate={{ rotate: [0, 360] }} 
    transition={{ duration: 4, repeat: Infinity, linear: true }}
    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
    style={{ backgroundColor: '#be9202ff' }}
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
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

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

  const handleContactFormChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch("http://localhost:8000/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ 
          type: "success", 
          message: data.message || "Thank you for contacting us! We'll get back to you soon." 
        });
        // Reset form
        setContactForm({
          name: "",
          email: "",
          phone: "",
          message: ""
        });
      } else {
        setSubmitStatus({ 
          type: "error", 
          message: data.message || "Failed to send message. Please try again." 
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitStatus({ 
        type: "error", 
        message: "Failed to send message. Please check your connection and try again." 
      });
    } finally {
      setIsSubmitting(false);
      // Clear status message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
    }
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
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Pizza size={36} style={{ color: '#C1121F' }} />
            <span className="text-lg md:text-xl font-black font-playfair" style={{ color: '#C1121F' }}>
              FOODVERSE
            </span>
          </motion.div>

          {/* Desktop Navigation - Centered with Icons */}
          <nav className="hidden md:flex items-center gap-2">
            <motion.a
              href="#why"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ color: '#3E2723' }}
            >
              Why Us
            </motion.a>
            <motion.a
              href="#how"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ color: '#3E2723' }}
            >
              How It Works
            </motion.a>
            <motion.a
              href="#cities"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ color: '#3E2723' }}
            >
              Cities
            </motion.a>
            <motion.a
              href="#testimonials"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ color: '#3E2723' }}
            >
              Testimonials
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ color: '#3E2723' }}
            >
              Contact
            </motion.a>
          </nav>

          {/* Login Button */}
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
            className="md:hidden"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
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
                  { name: "Why Us", href: "#why" },
                  { name: "How It Works", href: "#how" },
                  { name: "Cities", href: "#cities" },
                  { name: "Testimonials", href: "#testimonials" },
                  { name: "Contact Us", href: "#contact" }
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
                  Login/Signup
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
            {/* Food Icons */}
            <div className="flex gap-4">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Utensils size={48} style={{ color: '#C1121F' }} />
              </motion.div>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Pizza size={48} style={{ color: '#C1121F' }} />
              </motion.div>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <UtensilsCrossed size={48} style={{ color: '#C1121F' }} />
              </motion.div>
            </div>

            {/* Bold Bites - Improved */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-5xl md:text-7xl font-black font-playfair leading-tight mb-4">
                <span style={{ color: '#C1121F' }}>
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
                className="h-1 w-24 rounded-full"
                style={{ backgroundColor: '#C1121F' }}
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
      <section id="why" className="container mx-auto px-4 md:px-6 py-24 md:py-32" style={{ backgroundColor: '#f7d26eff' }}>
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
                  Icon: Zap,
                  title: "Lightning Fast Delivery",
                  description: "Get your food delivered hot and fresh in under 30 minutes"
                },
                {
                  Icon: Target,
                  title: "Wide Selection",
                  description: "Choose from hundreds of restaurants and thousands of dishes"
                },
                {
                  Icon: Lock,
                  title: "Secure Payments",
                  description: "Multiple payment options with bank-level security"
                },
                {
                  Icon: Star,
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
                  <div className="flex-shrink-0">
                    <feature.Icon size={40} style={{ color: '#C1121F' }} />
                  </div>
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
      <section id="how" className="container mx-auto px-4 md:px-6 py-24 md:py-32 bg-white relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center gap-4 mb-4">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Search size={48} style={{ color: '#C1121F' }} />
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ShoppingCart size={48} style={{ color: '#C1121F' }} />
            </motion.div>
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Bike size={48} style={{ color: '#C1121F' }} />
            </motion.div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-playfair text-gray-900 mb-4">
            How It <span style={{ color: '#C1121F' }}>Works</span>
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Three simple steps to get your favorite food delivered
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 z-0" style={{ background: 'linear-gradient(to right, transparent, rgba(190, 146, 2, 0.3), transparent)' }} />

          {[
            { 
              step: 1, 
              Icon: Search, 
              title: "Browse & Select",
              desc: "Explore hundreds of restaurants and thousands of delicious dishes at your fingertips"
            },
            { 
              step: 2, 
              Icon: ShoppingCart, 
              title: "Easy Checkout",
              desc: "Add items to cart and checkout securely with your preferred payment method"
            },
            { 
              step: 3, 
              Icon: Bike, 
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
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100" style={{ borderColor: '#be9202ff' }}>
                {/* Step Circle */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6"
                  style={{ backgroundColor: '#C1121F' }}
                >
                  {item.step}
                </motion.div>

                {/* Icon */}
                <div className="mb-4">
                  <item.Icon size={50} style={{ color: '#C1121F', margin: '0 auto' }} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700 font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHERE WE DELIVER SECTION */}
      <section id="cities" className="py-24 md:py-32" style={{ backgroundColor: '#fff' }}>
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
              { Icon: Building2, city: 'Karachi', areas: '5+ Areas', status: 'Active', color: '#C1121F' },
              { Icon: Globe, city: 'Islamabad', areas: '3+ Areas', status: 'Coming Soon', color: '#be9202ff' },
              { Icon: Building2, city: 'Lahore', areas: '4+ Areas', status: 'Coming Soon', color: '#C1121F' },
              { Icon: Mountain, city: 'Peshawar', areas: '2+ Areas', status: 'Coming Soon', color: '#be9202ff' },
              { Icon: Building2, city: 'Multan', areas: '2+ Areas', status: 'Coming Soon', color: '#C1121F' },
              { Icon: TrendingUp, city: 'Faisalabad', areas: '2+ Areas', status: 'Coming Soon', color: '#be9202ff' },
              { Icon: MapPin, city: 'Hyderabad', areas: '1+ Area', status: 'Coming Soon', color: '#C1121F' },
              { Icon: Waves, city: 'Gwadar', areas: '1+ Area', status: 'Coming Soon', color: '#be9202ff' },
            ].map((location, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(193, 18, 31, 0.15)' }}
                className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center bg-white"
                style={{ borderTop: `4px solid ${location.color}` }}
              >
                <div className="mb-4 flex justify-center">
                  <location.Icon size={48} style={{ color: location.color }} />
                </div>
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
      <section id="testimonials" className="py-24 md:py-32" style={{ backgroundColor: '#f7d26eff' }}>
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
                initial: "SJ",
                orders: "150+ Orders",
                badge: "Gold Member"
              },
              {
                name: "Ahmed Hassan",
                city: "Lahore",
                rating: 5,
                comment: "Outstanding service! The real-time tracking is fantastic. I always know exactly when my food will arrive. Delivery boys are professional and courteous. Never disappointed with any order.",
                initial: "AH",
                orders: "200+ Orders",
                badge: "Platinum Member"
              },
              {
                name: "Ayesha Siddiqui",
                city: "Islamabad",
                rating: 5,
                comment: "FoodVerse has become my go-to app for meals. Great prices, excellent quality, and fantastic customer service. The loyalty rewards program is excellent. Highly recommended to everyone!",
                initial: "AS",
                orders: "120+ Orders",
                badge: "Gold Member"
              },
              {
                name: "Fatima Ali",
                city: "Peshawar",
                rating: 5,
                comment: "Amazing restaurant selection! From local Pakistani dishes to international cuisine, everything is available. The packaging is eco-friendly and the delivery is always on time. Keep up the great work!",
                initial: "FA",
                orders: "95+ Orders",
                badge: "Silver Member"
              },
              {
                name: "Hassan Khan",
                city: "Multan",
                rating: 5,
                comment: "I've tried many food delivery apps, and FoodVerse is definitely the best. The restaurant selection is diverse, prices are competitive, and the delivery speed is lightning fast. Worth every penny!",
                initial: "HK",
                orders: "180+ Orders",
                badge: "Platinum Member"
              },
              {
                name: "Aans Sheikh",
                city: "Faisalabad",
                rating: 5,
                comment: "Excellent app design! Very intuitive and user-friendly. Finding exactly what I want takes seconds. Multiple payment options and secure checkout. Customer service team is always helpful and responsive!",
                initial: "AS",
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
                      className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-md text-white"
                      style={{ backgroundColor: '#be9202ff' }}
                    >
                      {testimonial.initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg" style={{ color: '#3E2723' }}>
                        {testimonial.name}
                      </h4>
                      <p className="text-sm flex items-center gap-1" style={{ color: '#2C1810', opacity: 0.6 }}>
                        <MapPin size={14} /> {testimonial.city}
                      </p>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} fill="#be9202ff" style={{ color: '#be9202ff' }} />
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
              { Icon: Users, number: '50K+', label: 'Happy Customers', color: '#C1121F' },
              { Icon: Star, number: '4.9★', label: 'Average Rating', color: '#be9202ff' },
              { Icon: CheckCircle, number: '95%', label: 'Satisfaction Rate', color: '#C1121F' },
              { Icon: Package, number: '10M+', label: 'Orders Delivered', color: '#be9202ff' }
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
                <div className="mb-4 flex justify-center">
                  <stat.Icon size={48} style={{ color: stat.color }} />
                </div>
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

      {/* IMPROVED CONTACT SECTION */}
      <section id="contact" className="relative py-20 md:py-24 overflow-hidden" style={{ backgroundColor: '#f7d26eff' }}>
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 z-0">
          {/* Subtle decorative elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.05, 0.03]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(193, 18, 31, 0.1)' }}
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.03, 0.05, 0.03]
            }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(190, 146, 2, 0.1)' }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black font-playfair mb-6" style={{ color: '#3E2723' }}>
              Get in Touch
            </h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light" style={{ color: '#2C1810', opacity: 0.8 }}>
              Feel free to drop us a message
            </p>
          </motion.div>

          {/* Contact Form Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            
            {/* Left Side - Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div 
                className="rounded-3xl p-10 lg:p-12 shadow-2xl h-full flex flex-col justify-center"
                style={{ backgroundColor: '#be9202ff' }}
              >
                <h3 className="text-3xl md:text-4xl font-black mb-8" style={{ color: '#3E2723' }}>
                  Contact Info
                </h3>
                
                <div className="space-y-8">
                  {/* Email */}
                  <motion.div 
                    className="flex items-start gap-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex-shrink-0">
                      <Mail size={28} style={{ color: '#3E2723' }} />
                    </div>
                    <div>
                      <p className="font-bold text-lg" style={{ color: '#3E2723' }}>
                        foodverse124@gmail.com
                      </p>
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div 
                    className="flex items-start gap-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex-shrink-0">
                      <Phone size={28} style={{ color: '#3E2723' }} />
                    </div>
                    <div>
                      <p className="font-bold text-lg" style={{ color: '#3E2723' }}>
                        0301-2673450
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-600/10 rounded-full blur-2xl" />
              </div>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 lg:p-10 shadow-2xl"
            >
              <form onSubmit={handleContactFormSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    placeholder="Full Name"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactFormChange}
                    placeholder="Phone No"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    placeholder="Email Address"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    placeholder="Message"
                    rows="5"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-500 resize-none"
                  ></textarea>
                </div>

                {/* Status Message */}
                {submitStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-center font-semibold ${
                      submitStatus.type === "success" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {submitStatus.message}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full py-4 rounded-full font-bold text-xl shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#be9202ff' }}
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Social Media Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
          
          </motion.div>

          {/* Enhanced CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden mt-20"
            style={{ background: 'linear-gradient(135deg, #C1121F 0%, #3E2723 100%)' }}
          >
            {/* Animated Background */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(190, 146, 2, 0.2), rgba(193, 18, 31, 0.1))' }}
            />
            
            <div className="relative z-10">
              <div className="flex justify-center gap-6 mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PartyPopper size={60} className="text-yellow-300" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChefHat size={60} className="text-yellow-300" />
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart size={60} className="text-yellow-300" />
                </motion.div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black font-playfair mt-4 mb-6 text-white drop-shadow-lg">
                Ready to Order?
              </h2>
              <p className="text-lg md:text-2xl font-light mb-10 max-w-2xl mx-auto text-white/90">
                Download the FoodVerse app or order online. Delicious food is just a click away!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.08, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                  className="text-white px-12 py-5 rounded-full font-bold text-lg shadow-2xl flex items-center justify-center gap-3"
                  style={{ backgroundColor: '#be9202ff' }}
                >
                  <Zap size={24} />
                  Get Started Now
                </motion.button>
              </div>
            </div>
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
