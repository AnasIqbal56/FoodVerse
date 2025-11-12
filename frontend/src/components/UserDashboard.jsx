import React, { useRef, useState, useEffect,use } from "react";
import Nav from "../components/Nav.jsx";
import CategoryCard from "./CategoryCard.jsx";
import { categories } from "../category.js";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSearchItems } from "../redux/userSlice.js";
import { divIcon } from "leaflet";


function UserDashboard() {
  const {currentCity, shopInMyCity,itemsInMyCity,searchItems} = useSelector(state => state.user)
  console.log("Search Items in Dashboard:", searchItems);
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const navigate = useNavigate();
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsList, setUpdatedItemsList] = useState([]);
  

const handleFilterByCategory = (category) => {
  if (category === "All") {
    setUpdatedItemsList(itemsInMyCity);
  } else {
    const filteredList = itemsInMyCity?.filter(i=> i.category === category);
    setUpdatedItemsList(filteredList);
  }

}

useEffect(() => {
  setUpdatedItemsList(itemsInMyCity)
}, [itemsInMyCity]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollWidth > element.clientWidth + element.scrollLeft
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const el = cateScrollRef.current;
    const e2 = shopScrollRef.current;
    if (!el || !e2) return;

    const handleScroll = () => {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
    };

    el.addEventListener("scroll", handleScroll);
    e2.addEventListener("scroll", handleScroll);

    // Initial button update
    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      e2.removeEventListener("scroll", handleScroll);
    };
  }, [categories]);


  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />
{searchItems && searchItems.length>0 && (
  <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white rounded-2xl shadow-md mt-4">
      <h1 className="text-gray-800 text-2xl sm:text-3xl font-semibold border-b-2 pb-2 border-gray">
          Search Results
        </h1>
        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {searchItems.map((item) => (
            <FoodCard data={item} key={item._id} />

          ))}
        </div>
    
    </div>
    )}

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Inspiration for your first order
        </h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaChevronCircleLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 py-2 scroll-smooth"
            ref={cateScrollRef}
          >
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} onClick={()=>handleFilterByCategory(cate.category)} />
            ))}
          </div>

          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaChevronCircleRight />
            </button>
          )}
        </div>
      </div>
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl"> Best Shop in {currentCity}</h1>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaChevronCircleLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 py-2 scroll-smooth"
            ref={shopScrollRef}
          >
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index}  onClick={() => navigate(`/shop/${shop._id}`)}/>
            ))}
          </div>

          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaChevronCircleRight />
            </button>
          )}
        </div>

      </div>
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Suggested Food Items
        </h1>
        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {updatedItemsList?.map((item, index) => (
            <FoodCard key={index} data={item} />
          ))}
        </div>
      </div>

    </div>
  );
}



export default UserDashboard;
