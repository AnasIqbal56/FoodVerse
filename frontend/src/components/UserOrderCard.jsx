import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";

function UserOrderCard({ data }) {
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [itemRatings, setItemRatings] = useState({});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'delivered') return '#10b981';
    if (s === 'out of delivery') return '#f59e0b';
    if (s === 'preparing') return '#3b82f6';
    if (s === 'pending') return '#6b7280';
    return '#6b7280';
  };

  // Fetch ratings for items in this order
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/rating/order/${data._id}`, {
          withCredentials: true
        });
        const ratingsMap = {};
        response.data.forEach(r => {
          ratingsMap[r.item] = { rating: r.rating, review: r.review };
        });
        setItemRatings(ratingsMap);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    if (data?._id) {
      fetchRatings();
    }
  }, [data?._id]);

  const handleRateItem = (item, shopOrder) => {
    setSelectedItem({ ...item, shopOrderId: shopOrder._id });
    const existingRating = itemRatings[item.item._id];
    if (existingRating) {
      setRating(existingRating.rating);
      setReview(existingRating.review || "");
    } else {
      setRating(0);
      setReview("");
    }
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!rating || rating < 1) {
      alert("Please select a rating");
      return;
    }

    try {
      await axios.post(`${serverUrl}/api/rating/add`, {
        itemId: selectedItem.item._id,
        orderId: data._id,
        rating,
        review
      }, { withCredentials: true });

      // Update local state
      setItemRatings(prev => ({
        ...prev,
        [selectedItem.item._id]: { rating, review }
      }));

      alert("Rating submitted successfully!");
      setShowRatingModal(false);
      setRating(0);
      setReview("");
      setSelectedItem(null);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(error.response?.data?.message || "Failed to submit rating");
    }
  };

  return (
    <>
      <div className="bg-white/95 rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: '#be920210' }}>
        {/* Order Header */}
        <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #be9202ff 0%, #C1121F 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-bold text-lg">Order #{data?._id?.slice(-6) || "N/A"}</p>
              <p className="text-sm opacity-90 text-white mt-1">Date: {data?.createdAt ? formatDate(data.createdAt) : "N/A"}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-xs text-white font-semibold uppercase tracking-wide">{data?.paymentMethod?.toUpperCase() || "COD"}</p>
            </div>
          </div>
        </div>

        {/* Shop Orders Section */}
        <div className="space-y-4 p-4">
          {data?.shopOrders?.map((shopOrder, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 bg-gray-50 space-y-3"
            >
              <p className="font-semibold text-gray-800">
                {shopOrder?.shop?.name || "Shop Name"}
              </p>

              {/* Product Items */}
              <div className="flex flex-wrap gap-3">
                {shopOrder?.shopOrderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white shadow-sm"
                  >
                    <img
                      src={item?.item?.image}
                      alt={item?.item?.name || ""}
                      className="w-full h-24 object-cover rounded"
                    />

                    <p className="text-sm font-semibold mt-1">
                      {item?.item?.name || "Product"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item?.quantity} x Rs{item?.item?.price}
                    </p>
                    {shopOrder?.status === "delivered" && (
                      <button
                        onClick={() => handleRateItem(item, shopOrder)}
                        className="mt-2 w-full bg-[#ff4d2d] text-white text-xs py-1 px-2 rounded hover:bg-[#e64526] transition flex items-center justify-center gap-1"
                      >
                        <FaStar size={10} />
                        {itemRatings[item.item._id] ? "Update Rating" : "Rate Item"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <p className="text-sm font-medium text-gray-700">
                  Subtotal: RS {shopOrder?.subtotal || shopOrder?.subTotal || 0}
                </p>
                <span className="px-3 py-1 rounded-full text-sm font-semibold text-white capitalize" style={{ backgroundColor: getStatusColor(shopOrder?.status) }}>
                  {shopOrder?.status || 'pending'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total + Track Order Button */}
        <div className="flex justify-between items-center border-t p-4">
          <p className="font-semibold">
            Total: Rs{data?.totalPrice || data?.totalAmount || 0}
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
            onClick={() => {
              navigate(`/track-order/${data._id}`);
            }}
          >
            Track Order
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRatingModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3E2723' }}>
              Rate {selectedItem?.item?.name}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={32}
                    className={`cursor-pointer transition-colors ${
                      star <= (hoverRating || rating) ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Review (Optional)</p>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-[#ff4d2d] focus:outline-none"
                placeholder="Share your experience with this item..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">{review.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setReview("");
                  setSelectedItem(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                className="flex-1 px-4 py-2 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64526] transition"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserOrderCard;

