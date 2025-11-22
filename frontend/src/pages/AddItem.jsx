import axios from "axios";
import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { useState } from "react";
import { setMyShopData } from "../redux/ownerSlice";
import { serverUrl } from "../App";
import ClipLoader from "react-spinners/ClipLoader";
import bgImage from '../assets/generated-image.png';

function AddItem() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 
    const { myShopData } = useSelector(state => state.owner);
    const [name,setName]= useState("")
    const [price,setPrice]= useState(0)
    const [frontendImage,setFrontendImage]= useState(null)
    const [backendImage, setBackendImage]=useState(null)
    const[category,setCategory]= useState("")
    const[foodType,setFoodType]= useState("veg")
    const[dietType,setDietType]= useState([])
    const[spiceLevel,setSpiceLevel]= useState("medium")
    const[allergens,setAllergens]= useState([])
    const[tags,setTags]= useState([])
    const categories=["Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Beverages",
            "Others"]
    
    const dietTypes = [
        "veg", "non-veg", "vegan", "vegetarian-strict", "kosher", "jain",
        "keto", "low-carb", "low-fat", "high-protein", "low-calorie",
        "gluten-free", "dairy-free", "sugar-free", "low-sodium",
        "diabetic-friendly", "heart-healthy", "weight-loss", "mediterranean", "paleo"
    ]
    
    const allergensList = [
        "milk", "eggs", "fish", "shellfish", "tree-nuts", "peanuts",
        "wheat", "soy", "sesame", "mustard", "sulfites", "corn",
        "celery", "lupin", "gelatin", "artificial-colors", "preservatives"
    ]
    
    const spiceLevels = ["low", "medium", "high"]
    
    const availableTags = [
        "spicy", "crispy", "grilled", "cheesy", "creamy", "tangy",
        "sweet", "savory", "healthy", "comfort-food", "quick-bite"
    ]
    
    const dispatch=useDispatch()

    const toggleArrayValue = (array, setArray, value) => {
        if (array.includes(value)) {
            setArray(array.filter(item => item !== value))
        } else {
            setArray([...array, value])
        }
    }

    const handleImage = async (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
        
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name",name)
            formData.append("category",category)
            formData.append("foodType",foodType)
            formData.append("price",price)
            formData.append("dietType", JSON.stringify(dietType))
            formData.append("spiceLevel", spiceLevel)
            formData.append("allergens", JSON.stringify(allergens))
            formData.append("tags", JSON.stringify(tags))
            if (backendImage) {
                formData.append("image",backendImage)   
            }
            const result = await axios.post(`${serverUrl}/api/item/add-item`,formData,
                {withCredentials:true})
                dispatch(setMyShopData(result.data))
                setLoading(false)
                navigate("/home")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
        
    }
    return (
        <div className="flex justify-center flex-col items-center p-6 relative min-h-screen bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(245,245,245,0.6)), url(${bgImage})` }}>

            <div className="absolute top-[20px] left-[20px] z-[10] mb-[10px]">
                <IoIosArrowRoundBack size={60} className="text-[#ff4d2d] cursor-pointer" onClick={() => navigate("/home")} />
            </div>

            <div className="max-w-5xl w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">

                <div className="flex flex-col items-center mb-6" >
                
                <div className = "bg-orange-100 p-4 rounded-full mb-4">
                    <FaUtensils className="text-[#ff4d2d] w-16 h-16"/>
                </div>

                <div className="text 3xl font-extrabold text-gray-900">
                    Add Food   
                </div> 
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Basic Info - 2 Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input type="text" placeholder="Enter Food Name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"       
                            onChange={(e)=>setName(e.target.value)}
                            value={name} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                            <input type="number" placeholder="0" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"       
                            onChange={(e)=>setPrice(e.target.value)}
                            value={price} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"       
                            onChange={(e)=>setCategory(e.target.value)}
                            value={category}>
                            <option value="">Select Category</option>
                            {categories.map((cate,index)=>(
                                <option key={index} value={cate}>{cate}</option>
                            ))}
                            </select> 
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Food Type</label>
                            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"       
                            onChange={(e)=>setFoodType(e.target.value)}
                            value={foodType}>
                                <option value="veg">veg</option>
                                <option value="non veg">non veg</option>
                            </select> 
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Spice Level</label>
                            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"       
                            onChange={(e)=>setSpiceLevel(e.target.value)}
                            value={spiceLevel}>
                                {spiceLevels.map((level) => (
                                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                                ))}
                            </select> 
                        </div>
                    </div>

                    {/* Food Image - Full Width */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Food Image</label>
                        <input type="file" accept="image/*" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" onChange= {handleImage} />
                        {frontendImage && <div className="mt-4">
                            <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-lg border" />
                        </div>}
                    </div>

                    {/* Diet Types - Checkboxes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Diet Types (Select all that apply)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                            {dietTypes.map((diet) => (
                                <label key={diet} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition">
                                    <input
                                        type="checkbox"
                                        checked={dietType.includes(diet)}
                                        onChange={() => toggleArrayValue(dietType, setDietType, diet)}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">{diet}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Allergens - Checkboxes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Allergens (Select all that apply)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-red-50 max-h-48 overflow-y-auto">
                            {allergensList.map((allergen) => (
                                <label key={allergen} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition">
                                    <input
                                        type="checkbox"
                                        checked={allergens.includes(allergen)}
                                        onChange={() => toggleArrayValue(allergens, setAllergens, allergen)}
                                        className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-700">{allergen}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Tags - Checkboxes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Tags (Select all that apply)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-orange-50">
                            {availableTags.map((tag) => (
                                <label key={tag} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition">
                                    <input
                                        type="checkbox"
                                        checked={tags.includes(tag)}
                                        onChange={() => toggleArrayValue(tags, setTags, tag)}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">{tag}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    disabled={loading}>
                        {loading ? <ClipLoader size={20} color="white" /> : "Save" }
                    </button>
                </form>



            </div>
        </div>
    );
}

export default AddItem;