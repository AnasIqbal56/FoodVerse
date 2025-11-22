import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { serverUrl } from '../App';
import FoodCard from './FoodCard';
import { FaStar, FaFire, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';

function RecommendedForYou() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userData?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${serverUrl}/api/recommendations/${userData._id}?limit=10`
        );
        
        console.log('Recommendations received:', response.data);
        setRecommendations(response.data.recommendations || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError(error.response?.data?.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userData?._id]);

  if (!userData?._id) {
    return null; // Don't show if user not logged in
  }

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <FaHeart className="text-[#ff4d2d]" size={24} />
            <h2 className="text-3xl font-bold text-gray-800">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <FaHeart className="text-[#ff4d2d]" size={24} />
            <h2 className="text-3xl font-bold text-gray-800">Recommended for You</h2>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center">
            <FaStar className="text-orange-400 mx-auto mb-3" size={48} />
            <p className="text-gray-700 text-lg mb-2">Start exploring!</p>
            <p className="text-gray-600">Order some items and we'll personalize recommendations just for you.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] p-3 rounded-full">
              <FaHeart className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Recommended for You</h2>
              <p className="text-gray-600">Personalized picks based on your taste</p>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((item, index) => (
            <motion.div
              key={item.itemId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Score Badge */}
              {item.score > 50 && (
                <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <FaFire size={12} />
                  {item.score > 70 ? 'Perfect Match' : 'Great Pick'}
                </div>
              )}
              
              <FoodCard
                data={{
                  _id: item.itemId,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  category: item.category,
                  foodType: item.foodType,
                  rating: { average: item.rating, count: item.ratingCount },
                  tags: item.tags,
                  shop: item.shop?._id || item.shop,
                  shopId: item.shop?._id || item.shop
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            These recommendations are based on your order history and preferences
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecommendedForYou;
