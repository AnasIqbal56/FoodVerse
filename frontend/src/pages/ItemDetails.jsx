import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import bgImage from '../assets/generated-image.png';

function ItemDetails() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.user);
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    useEffect(() => {
        fetchItemDetails();
        fetchReviews();
    }, [itemId]);

    const fetchItemDetails = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, {
                withCredentials: true
            });
            setItem(response.data);
        } catch (error) {
            console.error('Error fetching item details:', error);
            console.error('Error response:', error.response?.data);
            console.error('Item ID:', itemId);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const response = await axios.get(`${serverUrl}/api/rating/item/${itemId}`, {
                withCredentials: true
            });
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                i <= rating ? (
                    <FaStar key={i} className='text-yellow-500 text-xl' />
                ) : (
                    <FaRegStar key={i} className='text-yellow-500 text-xl' />
                )
            );
        }
        return stars;
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };

    const handleDecrease = () => {
        if (quantity > 0) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = () => {
        if (quantity <= 0) return;

        const shopId = item.shop?._id || item.shopId || (typeof item.shop === 'string' ? item.shop : undefined);

        if (!shopId) {
            console.error("Cannot add to cart — missing shopId on item:", item);
            return;
        }

        dispatch(addToCart({
            id: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity,
            foodType: item.foodType,
            shopId,
        }));
    };

    const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    if (loading) {
        return (
            <div className='min-h-screen' style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
                <Nav />
                <div className='flex items-center justify-center h-[calc(100vh-80px)]'>
                    <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#ff4d2d] border-t-transparent'></div>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className='min-h-screen' style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
                <Nav />
                <div className='flex flex-col items-center justify-center h-[calc(100vh-80px)]'>
                    <p className='text-2xl text-white'>Item not found</p>
                    <button 
                        onClick={() => navigate('/home')}
                        className='mt-4 px-6 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#ff3d1d] transition'
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen' style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <Nav />
            
            <div className='max-w-7xl mx-auto px-4 pt-24 pb-8'>
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/home')}
                    className='flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-[#ff4d2d] hover:text-white px-4 py-2 rounded-full shadow-lg mb-6 transition-all font-semibold z-10'
                >
                    <FaArrowLeft />
                    <span>Back to Dashboard</span>
                </button>

                <div className='bg-white rounded-3xl shadow-xl overflow-hidden'>
                    <div className='grid md:grid-cols-2 gap-8'>
                        {/* Image Section */}
                        <div className='relative bg-gradient-to-br from-orange-100 to-red-100 p-8 flex items-center justify-center min-h-[500px]'>
                            <div className='absolute top-6 right-6 bg-white rounded-full p-3 shadow-lg z-10'>
                                {item.foodType === "veg" ? 
                                    <FaLeaf className='text-green-600 text-2xl' /> : 
                                    <FaDrumstickBite className='text-red-600 text-2xl' />
                                }
                            </div>
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                className='w-full h-full object-cover rounded-2xl shadow-2xl'
                            />
                        </div>

                        {/* Details Section */}
                        <div className='p-8 flex flex-col'>
                            <h1 className='text-4xl font-bold text-gray-900 mb-3'>{item.name}</h1>
                            
                            {/* Rating */}
                            <div className='flex items-center gap-3 mb-4'>
                                <div className='flex items-center gap-1'>
                                    {renderStars(item.rating?.average || 0)}
                                </div>
                                <span className='text-xl font-semibold text-gray-700'>
                                    {(item.rating?.average || 0).toFixed(1)}
                                </span>
                                <span className='text-gray-500'>
                                    ({item.rating?.count || 0} {item.rating?.count === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>

                            {/* Price */}
                            <div className='mb-6'>
                                <span className='text-4xl font-bold text-[#ff4d2d]'>Rs {item.price}</span>
                            </div>

                            {/* Category */}
                            <div className='mb-4'>
                                <span className='inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold'>
                                    {item.category}
                                </span>
                            </div>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                                <div className='mb-6'>
                                    <h3 className='text-sm font-semibold text-gray-600 mb-2'>Tags</h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {item.tags.map((tag, index) => (
                                            <span 
                                                key={index}
                                                className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize'
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Diet Type */}
                            {item.dietType && item.dietType.length > 0 && (
                                <div className='mb-6'>
                                    <h3 className='text-sm font-semibold text-gray-600 mb-2'>Diet Type</h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {item.dietType.map((diet, index) => (
                                            <span 
                                                key={index}
                                                className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm capitalize'
                                            >
                                                {diet}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Spice Level */}
                            {item.spiceLevel && (
                                <div className='mb-6'>
                                    <h3 className='text-sm font-semibold text-gray-600 mb-2'>Spice Level</h3>
                                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                        item.spiceLevel === 'low' ? 'bg-green-100 text-green-800' :
                                        item.spiceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {item.spiceLevel.charAt(0).toUpperCase() + item.spiceLevel.slice(1)}
                                    </span>
                                </div>
                            )}

                            {/* Allergens */}
                            {item.allergens && item.allergens.length > 0 && (
                                <div className='mb-6'>
                                    <h3 className='text-sm font-semibold text-gray-600 mb-2'>⚠️ Allergens</h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {item.allergens.map((allergen, index) => (
                                            <span 
                                                key={index}
                                                className='bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm capitalize'
                                            >
                                                {allergen}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add to Cart Section */}
                            <div className='mt-auto pt-6 border-t'>
                                <div className='flex items-center gap-4'>
                                    <div className='flex items-center border-2 border-gray-300 rounded-full overflow-hidden'>
                                        <button 
                                            className='px-4 py-3 hover:bg-gray-100 transition' 
                                            onClick={handleDecrease}
                                        >
                                            <FaMinus size={16} />
                                        </button>
                                        <span className='px-6 py-3 font-semibold text-lg'>
                                            {quantity}
                                        </span>
                                        <button 
                                            className='px-4 py-3 hover:bg-gray-100 transition' 
                                            onClick={handleIncrease}
                                        >
                                            <FaPlus size={16} />
                                        </button>
                                    </div>
                                    
                                    <button 
                                        className={`flex-1 ${cartItems.some(i => i.id === item._id) ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                        onClick={handleAddToCart}
                                        disabled={quantity <= 0}
                                    >
                                        <FaShoppingCart size={20} />
                                        {cartItems.some(i => i.id === item._id) ? "Already in Cart" : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className='border-t px-8 py-8 bg-gray-50'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-6'>Customer Reviews</h2>
                        
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
                            <>
                                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
                                    {displayReviews.map((review, index) => (
                                        <div 
                                            key={index}
                                            className='bg-white p-6 rounded-xl shadow-md'
                                        >
                                            <div className='flex items-start justify-between mb-3'>
                                                <div>
                                                    <p className='font-semibold text-gray-900'>
                                                        {review.user?.fullName || 'Anonymous User'}
                                                    </p>
                                                    <div className='flex items-center gap-1 mt-1'>
                                                        {[1, 2, 3, 4, 5].map(star => (
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
                                                <p className='text-gray-700 text-sm'>
                                                    {review.review}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {reviews.length > 3 && (
                                    <div className='text-center'>
                                        <button 
                                            onClick={() => setShowAllReviews(!showAllReviews)}
                                            className='px-6 py-2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#ff3d1d] transition'
                                        >
                                            {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ItemDetails;
