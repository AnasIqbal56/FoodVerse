import React from 'react'
import { useState, useEffect } from 'react';
import { FaLeaf , FaDrumstickBite,FaStar,FaRegStar,FaMinus,FaPlus,FaShoppingCart, FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';

function FoodCard({data}) {


    const [quantity,setQuantity]=useState(0)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviews, setReviews] = useState([])
    const [loadingReviews, setLoadingReviews] = useState(false)
    const dispatch = useDispatch()
    const {cartItems}=useSelector(state=>state.user)
    const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            (i <=rating)?(
                <FaStar className='text-yellow-500 text-lg'/>
            ):(
                <FaRegStar className='text-yellow-500 text-lg'/>)
        )
    }
    return stars;
    }

const handleIncrease= ()=>{
    const newQty = quantity+1
    setQuantity(newQty)
}
const handleDecrease= ()=>{
    if(quantity>0){
    const newQty = quantity-1
    setQuantity(newQty)}
}

const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
        const response = await axios.get(`${serverUrl}/api/rating/item/${data._id}`)
        setReviews(response.data)
    } catch (error) {
        console.error('Error fetching reviews:', error)
    } finally {
        setLoadingReviews(false)
    }
}

const handleOpenReviews = () => {
    setShowReviewModal(true)
    fetchReviews()
}


  return (
    <div className='w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col'>

      <div className='relative w-full h-[170px] flex justify-center items-center bg-white'>
      <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>  
        {data.foodType=="veg"?<FaLeaf className='text-green-600 text-lg'/>:<FaDrumstickBite className='text-red-600 text-lg'/>}</div>
        <img src={data.image} alt=""  className='w-full h-full object-cover transition-transform duration-300 hover-scale-105'/>
      </div>
      <div className='flex-1 flex flex-col p-4'>
        <h1 className='font-semibold text-gray-900 text-base truncate'>{data.name}</h1>
<div className='flex items-center justify-between mt-1'>
<div className='flex items-center gap-1'>
{renderStars(data.rating?.average || 0)}
<span className='text-xs text-gray-500'>
    {data.rating?.count || 0}
</span>
</div>
<button 
    onClick={handleOpenReviews}
    className='text-xs text-[#ff4d2d] font-semibold hover:underline'
>
    Reviews
</button>
</div>

      </div>

<div className='flex items-center justify-between mt-auto p-4'>
    <span className='font-bold text-gray-900 text-lg'>
       Rs {data.price}
    </span>

    <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
    <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleDecrease}>
        <FaMinus size={12}/>

    </button>
    <span>
        {quantity}
    </span>
        <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleIncrease}>
        <FaPlus size={12}/>

    </button>
    <button className={`${cartItems.some(i=>i.id==data._id)?"bg-gray-800":"bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors `}
    //  onClick={()=>{
    //     quantity>0?dispatch(addToCart({
    //         id:data._id,
    //         name:data.name,
    //         price:data.price,
    //         image:data.image,
    //         quantity,
    //         //
    //         shopId: data.shop?._id || data.shopId || data.shop,
    //         foodType:data.foodType
    //     })):null}}

    onClick={() => {
    if (quantity <= 0) return;

    // Normalize shopId: supports cases where data.shop is an object, a string, or data.shopId exists
    const shopId = data.shop?._id || data.shopId || (typeof data.shop === 'string' ? data.shop : undefined);

    if (!shopId) {
        // Developer-friendly log — item is missing shop info
        console.error("Cannot add to cart — missing shopId on item:", data);
        // Optionally show user message (toast) here
        return;
    }

    dispatch(addToCart({
        id: data._id,
        name: data.name,
        price: data.price,
        image: data.image,
        quantity,
        foodType: data.foodType,
        shopId, // <<-- guaranteed
    }));
    }}

    >
    <FaShoppingCart size={16}/>
    </button>
    </div>

</div>

    {/* Review Modal */}
    {showReviewModal && (
        <div 
            className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
            onClick={() => setShowReviewModal(false)}
        >
            <div 
                className='bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className='bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] p-6 text-white relative'>
                    <button 
                        onClick={() => setShowReviewModal(false)}
                        className='absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition'
                    >
                        <FaTimes size={20} />
                    </button>
                    <h2 className='text-2xl font-bold mb-2'>{data.name}</h2>
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1'>
                            {renderStars(data.rating?.average || 0)}
                        </div>
                        <span className='text-lg font-semibold'>
                            {(data.rating?.average || 0).toFixed(1)} / 5.0
                        </span>
                        <span className='text-sm opacity-90'>
                            ({data.rating?.count || 0} {data.rating?.count === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                </div>

                {/* Reviews List */}
                <div className='p-6 overflow-y-auto max-h-[calc(80vh-180px)]'>
                    {loadingReviews ? (
                        <div className='text-center py-8'>
                            <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#ff4d2d] border-t-transparent'></div>
                            <p className='mt-2 text-gray-600'>Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className='text-center py-8'>
                            <FaStar className='text-gray-300 mx-auto mb-3' size={48} />
                            <p className='text-gray-600 text-lg'>No reviews yet</p>
                            <p className='text-gray-500 text-sm mt-1'>Be the first to order and review this item!</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {reviews.map((review, index) => (
                                <div 
                                    key={index}
                                    className='border-b pb-4 last:border-b-0'
                                >
                                    <div className='flex items-start justify-between mb-2'>
                                        <div>
                                            <p className='font-semibold text-gray-900'>
                                                {review.user?.fullName || 'Anonymous User'}
                                            </p>
                                            <div className='flex items-center gap-1 mt-1'>
                                                {[1,2,3,4,5].map(star => (
                                                    <FaStar 
                                                        key={star}
                                                        className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}
                                                        size={14}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className='text-xs text-gray-500'>
                                            {new Date(review.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    {review.review && (
                                        <p className='text-gray-700 text-sm mt-2'>
                                            {review.review}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )}
    </div>
  )
}

export default FoodCard