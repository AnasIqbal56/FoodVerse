import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    mobile: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy"],
        required: true 
    },
    resetOtp:{
        type: String
    },
    isOtpVerified:{
        type: Boolean,
        default:false

    },

    otpExpires:{
        type:Date
    },
    socketId:{
        type:String
    },
    isOnline:{
        type: Boolean,
        default:false
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], 
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    
    // ========== NEW RECOMMENDATION FIELDS ==========
    
    // User's dietary preferences (can select multiple)
    dietaryPreference: [{
        type: String,
        enum: [
            "veg", "non-veg", "vegan", "vegetarian-strict", "kosher", "jain",
            "keto", "low-carb", "low-fat", "high-protein", "low-calorie",
            "gluten-free", "dairy-free", "sugar-free", "low-sodium",
            "diabetic-friendly", "heart-healthy", "weight-loss", "mediterranean", "paleo"
        ],
    }],
    
    // User's allergies to avoid
    allergies: [{
        type: String,
        enum: [
            "milk", "eggs", "fish", "shellfish", "tree-nuts", "peanuts",
            "wheat", "soy", "sesame", "mustard", "sulfites", "corn",
            "celery", "lupin", "gelatin", "artificial-colors", "preservatives"
        ],
    }],
    
    // User's favorite tags
    favoriteTags: [{
        type: String,
        enum: ["spicy", "crispy", "grilled", "cheesy", "creamy", "tangy", "sweet", "savory", "healthy", "comfort-food", "quick-bite"],
    }],
    
    // Categories user frequently orders from
    favoriteCategories: [{
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
        ]
    }],
    
    // Order history for personalized recommendations
    orderHistory: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        timesOrdered: {
            type: Number,
            default: 1,
            min: 1
        },
        lastOrderedAt: {
            type: Date,
            default: Date.now
        }
    }]
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", userSchema);
export default User;
