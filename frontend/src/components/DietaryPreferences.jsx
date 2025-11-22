import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { serverUrl } from '../App';
import { FaLeaf, FaDrumstickBite, FaAllergies, FaHeart, FaSave, FaTimes } from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';

function DietaryPreferences() {
  const { userData } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [preferences, setPreferences] = useState({
    dietaryPreference: [],
    allergies: [],
    favoriteCategories: [],
    favoriteTags: []
  });

  const dietaryOptions = [
    // General Dietary Preferences
    { value: 'veg', label: 'Veg', icon: FaLeaf, color: 'green' },
    { value: 'non-veg', label: 'Non-veg', icon: FaDrumstickBite, color: 'red' },
    { value: 'vegan', label: 'Vegan', icon: FaLeaf, color: 'emerald' },
    { value: 'vegetarian-strict', label: 'Vegetarian (strict)', icon: FaLeaf, color: 'green' },
    { value: 'kosher', label: 'Kosher', icon: MdRestaurant, color: 'blue' },
    { value: 'jain', label: 'Jain (no root veg)', icon: FaLeaf, color: 'yellow' },
    
    // Health & Nutrition Diets
    { value: 'keto', label: 'Keto', icon: MdRestaurant, color: 'purple' },
    { value: 'low-carb', label: 'Low-carb', icon: MdRestaurant, color: 'indigo' },
    { value: 'low-fat', label: 'Low-fat', icon: MdRestaurant, color: 'teal' },
    { value: 'high-protein', label: 'High-protein', icon: MdRestaurant, color: 'orange' },
    { value: 'low-calorie', label: 'Low-calorie', icon: MdRestaurant, color: 'pink' },
    { value: 'gluten-free', label: 'Gluten-free', icon: MdRestaurant, color: 'amber' },
    { value: 'dairy-free', label: 'Dairy-free', icon: MdRestaurant, color: 'cyan' },
    { value: 'sugar-free', label: 'Sugar-free', icon: MdRestaurant, color: 'rose' },
    { value: 'low-sodium', label: 'Low-sodium', icon: MdRestaurant, color: 'lime' },
    { value: 'diabetic-friendly', label: 'Diabetic-friendly', icon: MdRestaurant, color: 'sky' },
    { value: 'heart-healthy', label: 'Heart-healthy', icon: FaHeart, color: 'red' },
    { value: 'weight-loss', label: 'Weight-loss', icon: MdRestaurant, color: 'fuchsia' },
    { value: 'mediterranean', label: 'Mediterranean diet', icon: MdRestaurant, color: 'blue' },
    { value: 'paleo', label: 'Paleo', icon: MdRestaurant, color: 'stone' }
  ];

  const allergyOptions = [
    // Top Allergens
    { value: 'milk', label: 'Milk / Dairy', icon: FaAllergies },
    { value: 'eggs', label: 'Eggs', icon: FaAllergies },
    { value: 'fish', label: 'Fish', icon: FaAllergies },
    { value: 'shellfish', label: 'Shellfish', icon: FaAllergies },
    { value: 'tree-nuts', label: 'Tree Nuts', icon: FaAllergies },
    { value: 'peanuts', label: 'Peanuts', icon: FaAllergies },
    { value: 'wheat', label: 'Wheat / Gluten', icon: FaAllergies },
    { value: 'soy', label: 'Soy', icon: FaAllergies },
    { value: 'sesame', label: 'Sesame', icon: FaAllergies },
    { value: 'mustard', label: 'Mustard', icon: FaAllergies },
    { value: 'sulfites', label: 'Sulfites', icon: FaAllergies },
    { value: 'corn', label: 'Corn', icon: FaAllergies },
    { value: 'celery', label: 'Celery', icon: FaAllergies },
    { value: 'lupin', label: 'Lupin', icon: FaAllergies },
    { value: 'gelatin', label: 'Gelatin', icon: FaAllergies },
    { value: 'artificial-colors', label: 'Artificial colors', icon: FaAllergies },
    { value: 'preservatives', label: 'Preservatives', icon: FaAllergies }
  ];

  const categoryOptions = [
    'Pizza', 'Burgers', 'Main Course', 'Snacks', 
    'Desserts', 'Sandwiches', 'South Indian', 'North Indian',
    'Chinese', 'Fast Food', 'Beverages', 'Others'
  ];

  const tagOptions = [
    'spicy', 'crispy', 'grilled', 'cheesy', 'creamy', 'tangy',
    'sweet', 'savory', 'healthy', 'comfort-food', 'quick-bite'
  ];

  useEffect(() => {
    if (userData?._id && isOpen) {
      // Load current preferences
      setPreferences({
        dietaryPreference: userData.dietaryPreference || [],
        allergies: userData.allergies || [],
        favoriteCategories: userData.favoriteCategories || [],
        favoriteTags: userData.favoriteTags || []
      });
    }
  }, [userData, isOpen]);

  const togglePreference = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleSave = async () => {
    if (!userData?._id) return;

    try {
      setSaving(true);
      await axios.put(
        `${serverUrl}/api/recommendations/preferences/${userData._id}`,
        preferences,
        { withCredentials: true }
      );
      
      alert('Preferences saved successfully! Your recommendations will be updated.');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!userData?._id) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 flex items-center gap-2 group"
      >
        <FaHeart size={20} className="group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline font-semibold">Set Food Preferences</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] p-6 text-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Food Preferences</h2>
                  <p className="text-sm opacity-90 mt-1">Help us personalize your recommendations</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Dietary Preferences */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdRestaurant className="text-[#ff4d2d]" />
                  Dietary Preferences
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dietaryOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = preferences.dietaryPreference.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => togglePreference('dietaryPreference', option.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `border-${option.color}-500 bg-${option.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon 
                          className={`mx-auto mb-2 ${
                            isSelected ? `text-${option.color}-600` : 'text-gray-400'
                          }`} 
                          size={24} 
                        />
                        <p className={`text-sm font-semibold ${
                          isSelected ? `text-${option.color}-700` : 'text-gray-600'
                        }`}>
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaAllergies className="text-red-500" />
                  Allergies
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Select items you're allergic to. We'll exclude them from recommendations.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allergyOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = preferences.allergies.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => togglePreference('allergies', option.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon 
                          className={isSelected ? 'text-red-600' : 'text-gray-400'} 
                          size={24} 
                        />
                        <p className={`text-sm font-semibold mt-2 ${
                          isSelected ? 'text-red-700' : 'text-gray-600'
                        }`}>
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Categories */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaHeart className="text-[#ff4d2d]" />
                  Favorite Categories
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Categories you love (auto-updated based on your orders)
                </p>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => {
                    const isSelected = preferences.favoriteCategories.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => togglePreference('favoriteCategories', category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#ff4d2d] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Tags */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaHeart className="text-orange-500" />
                  Tags (Select all that apply)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose food characteristics you prefer
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => {
                    const isSelected = preferences.favoriteTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => togglePreference('favoriteTags', tag)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Preferences
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DietaryPreferences;
