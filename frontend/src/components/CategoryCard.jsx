import React from "react";

function CategoryCard({ name, image ,onClick}) {
  return (
    <div
      className="
        w-[120px] h-[120px] 
        md:w-[180px] md:h-[180px] 
        rounded-2xl 
        border-2 border-[#ff4d2d] 
        shrink-0 
        overflow-hidden 
        bg-white 
        shadow-xl shadow-gray-200 
        hover:shadow-lg 
        transition-shadow relative
      " onClick={onClick}>
      <img
        src={image}
        alt=""
        className="w-full h-full object-cover transform scale-100 hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute bottom-0 left-0 w-full bg-[#ffffff96] bg-opacity-95 text-gray-800 backdrop-blur px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium">
        {name}
      </div>
    </div>
  );
}
export default CategoryCard;