import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import FoodCard from './FoodCard';
import { FaFire, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

function TrendingItems() {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${serverUrl}/api/recommendations/trending/items?limit=8`
        );
        setTrendingItems(response.data.trending || []);
      } catch (error) {
        console.error('Error fetching trending items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <FaFire className="text-orange-500" size={24} />
            <h2 className="text-3xl font-bold text-gray-800">Trending Now</h2>
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

  if (trendingItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-12 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full animate-pulse">
              <FaFire className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Trending Now</h2>
              <p className="text-gray-600">Most popular items right now</p>
            </div>
          </div>
        </div>

        {/* Trending Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingItems.map((item, index) => (
            <motion.div
              key={item.itemId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Trending Badge */}
              <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-bounce">
                <FaChartLine size={12} />
                {item.salesCount}+ orders
              </div>

              <FoodCard
                data={{
                  _id: item.itemId,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  category: item.category,
                  foodType: item.foodType || 'veg',
                  rating: { average: item.rating, count: item.ratingCount },
                  tags: item.tags,
                  shop: item.shop?._id || item.shop,
                  shopId: item.shop?._id || item.shop
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrendingItems;
