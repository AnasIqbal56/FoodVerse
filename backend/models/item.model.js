import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,  
    },
    category: {
        type: String,
        enum: [
            "Snacks",
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
            "Others"
        ],
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    foodType: {
        type: String,
        enum: ["veg", "non veg"],
        required: true,
    },
    
    // Spice level for recommendations
    spiceLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    
    // Diet types - can have multiple (e.g., veg + keto)
    dietType: [{
        type: String,
        enum: [
            "veg", "non-veg", "vegan", "vegetarian-strict", "kosher", "jain",
            "keto", "low-carb", "low-fat", "high-protein", "low-calorie",
            "gluten-free", "dairy-free", "sugar-free", "low-sodium",
            "diabetic-friendly", "heart-healthy", "weight-loss", "mediterranean", "paleo"
        ],
    }],
    
    // Allergens present in this item
    allergens: [{
        type: String,
        enum: [
            "milk", "eggs", "fish", "shellfish", "tree-nuts", "peanuts", 
            "wheat", "soy", "sesame", "mustard", "sulfites", "corn", 
            "celery", "lupin", "gelatin", "artificial-colors", "preservatives"
        ],
    }],
    
    // Sales tracking for trending items
    salesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Tags for better matching (spicy, crispy, grilled, etc.)
    tags: [{
        type: String,
        enum: ["spicy", "crispy", "grilled", "cheesy", "creamy", "tangy", "sweet", "savory", "healthy", "comfort-food", "quick-bite"],
        lowercase: true,
        trim: true
    }],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0, min: 0 },
    }

}, { timestamps: true });

const Item=mongoose.model("Item",itemSchema);
export default Item;