import React from 'react';
import Nav from '../components/Nav';
import RecommendedForYou from '../components/RecommendedForYou';
import TrendingItems from '../components/TrendingItems';
import DietaryPreferences from '../components/DietaryPreferences';
import bgImage from '../assets/generated-image.png';

function RecommendationsPage() {
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center gap-8 pb-10 pt-[100px]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Nav />

      {/* Page Header */}
      <div className="w-full max-w-6xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Your Personalized Recommendations
        </h1>
        <p className="text-gray-200 text-lg">
          Discover food tailored just for you based on your preferences and order history
        </p>
      </div>
      <div className="w-full max-w-6xl px-4">
        <RecommendedForYou />
      </div>

      <div className="w-full max-w-6xl px-4">
        <TrendingItems />
      </div>
      <DietaryPreferences />
    </div>
  );
}

export default RecommendationsPage;
