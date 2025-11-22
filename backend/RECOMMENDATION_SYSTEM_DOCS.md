# FoodVerse Recommendation System Documentation

## Overview
This is a **Rule-Based Food Recommendation Engine** that provides personalized food suggestions to users based on their preferences, order history, and item popularity.

## Architecture

### 1. Data Models

#### Item Schema (`item.model.js`)
```javascript
{
  name: String,
  image: String,
  shop: ObjectId,
  category: String (enum),
  price: Number,
  foodType: "veg" | "non veg",
  
  // Recommendation Fields
  spiceLevel: "low" | "medium" | "high",
  dietType: ["veg", "non-veg", "keto", "gluten-free", "halal", "low-calorie", "vegan"],
  allergens: ["nuts", "dairy", "gluten", "shellfish", "soy", "eggs", "fish"],
  salesCount: Number,
  tags: [String],
  rating: {
    average: Number,
    count: Number
  }
}
```

#### User Schema (`user.model.js`)
```javascript
{
  // ... existing fields ...
  
  // Recommendation Fields
  dietaryPreference: [String],
  allergies: [String],
  favoriteCategories: [String],
  orderHistory: [{
    itemId: ObjectId,
    timesOrdered: Number,
    lastOrderedAt: Date
  }]
}
```

---

## API Endpoints

### 1. Get Personalized Recommendations
**GET** `/api/recommendations/:userId?limit=10`

Returns personalized food recommendations based on user profile.

**Response:**
```json
{
  "userId": "64abc123...",
  "totalEligibleItems": 45,
  "recommendations": [
    {
      "itemId": "64def456...",
      "name": "Paneer Tikka Pizza",
      "image": "https://...",
      "price": 299,
      "category": "Pizza",
      "foodType": "veg",
      "spiceLevel": "medium",
      "dietType": ["veg", "halal"],
      "tags": ["cheesy", "spicy", "grilled"],
      "rating": 4.5,
      "ratingCount": 120,
      "salesCount": 340,
      "shop": { "name": "Pizza Palace" },
      "score": 65
    }
  ],
  "filters": {
    "dietaryPreference": ["veg", "halal"],
    "allergies": ["nuts"],
    "favoriteCategories": ["Pizza", "Burgers"]
  }
}
```

---

### 2. Update User Preferences
**PUT** `/api/recommendations/preferences/:userId`

Update user's dietary preferences and allergies.

**Request Body:**
```json
{
  "dietaryPreference": ["veg", "keto"],
  "allergies": ["nuts", "dairy"],
  "favoriteCategories": ["Pizza", "Main Course"]
}
```

**Response:**
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "dietaryPreference": ["veg", "keto"],
    "allergies": ["nuts", "dairy"],
    "favoriteCategories": ["Pizza", "Main Course"]
  }
}
```

---

### 3. Track Order (Auto-called after order placement)
**POST** `/api/recommendations/track-order`

Tracks user orders to improve future recommendations.

**Request Body:**
```json
{
  "userId": "64abc123...",
  "itemIds": ["64def456...", "64def789..."]
}
```

**Response:**
```json
{
  "message": "Order tracked successfully",
  "orderHistoryCount": 15,
  "favoriteCategories": ["Pizza", "Burgers", "Main Course"]
}
```

---

### 4. Get Trending Items
**GET** `/api/recommendations/trending/items?limit=10`

Returns currently trending items across the platform.

**Response:**
```json
{
  "trending": [
    {
      "itemId": "64def456...",
      "name": "Chicken Biryani",
      "image": "https://...",
      "price": 249,
      "category": "Main Course",
      "rating": 4.7,
      "ratingCount": 450,
      "salesCount": 890,
      "tags": ["spicy", "traditional"],
      "shop": { "name": "Biryani House" }
    }
  ]
}
```

---

## Scoring Algorithm

The recommendation engine scores each item based on the following rules:

| Factor | Points | Description |
|--------|--------|-------------|
| Previously Ordered | **+20** | User has ordered this item before |
| Favorite Category | **+15** | Item belongs to user's favorite category |
| Dietary Match | **+10** | Item matches user's dietary preference |
| High Rating | **+10** | Item rating >= 4.2 stars |
| Trending | **+15** | Item sales count in top 20% |
| Tag Match | **+5 per tag** | Item tags match previously ordered items |

### Example Calculation

**User Profile:**
- Dietary Preference: `["veg", "halal"]`
- Allergies: `["nuts"]`
- Favorite Categories: `["Pizza", "Burgers"]`
- Order History: Paneer Pizza (3 times), Veg Burger (2 times)
- Previously ordered tags: `["cheesy", "grilled", "spicy"]`

**Item: Paneer Tikka Pizza**
- Category: `"Pizza"` ✅
- Diet Type: `["veg", "halal"]` ✅
- Rating: `4.5` ✅
- Sales Count: `340` (Trending) ✅
- Tags: `["cheesy", "spicy", "grilled"]` ✅
- Allergens: `[]` (No nuts) ✅

**Score Calculation:**
```
+ 20 points (Previously ordered - Paneer Pizza)
+ 15 points (Favorite category - Pizza)
+ 10 points (Dietary match - veg, halal)
+ 10 points (High rating - 4.5)
+ 15 points (Trending item)
+ 15 points (3 matching tags: cheesy, spicy, grilled)
─────────────────
= 85 points total
```

---

## Safety Filters

Before scoring, items are filtered to ensure safety:

1. **Allergen Exclusion**: Items containing user's allergens are removed
2. **Dietary Restrictions**: 
   - Veg users → Only veg items
   - Halal users → Only halal items
   - Vegan users → Only vegan items
3. **No Cross-Contamination**: Strict filtering for allergies

---

## Integration with Order System

The recommendation system automatically tracks orders:

**In `order.controllers.js` → `placeOrder()`:**

```javascript
// After order creation
const orderedItemIds = [/* extract item IDs */];

// Update user's order history
user.orderHistory.push({ itemId, timesOrdered: 1 });

// Auto-update favorite categories
user.favoriteCategories.push(item.category);

// Increment item sales count
await Item.updateMany(
  { _id: { $in: orderedItemIds } },
  { $inc: { salesCount: 1 } }
);
```

---

## Frontend Integration Example

### 1. Fetch Recommendations
```javascript
import axios from 'axios';

const getRecommendations = async (userId) => {
  const response = await axios.get(
    `${serverUrl}/api/recommendations/${userId}?limit=10`
  );
  return response.data.recommendations;
};
```

### 2. Update User Preferences
```javascript
const updatePreferences = async (userId, preferences) => {
  await axios.put(
    `${serverUrl}/api/recommendations/preferences/${userId}`,
    {
      dietaryPreference: preferences.diet,
      allergies: preferences.allergies
    },
    { withCredentials: true }
  );
};
```

### 3. Display Recommendations
```jsx
function RecommendationsSection() {
  const [recommendations, setRecommendations] = useState([]);
  const { userData } = useSelector(state => state.user);

  useEffect(() => {
    const fetchRecs = async () => {
      const recs = await getRecommendations(userData._id);
      setRecommendations(recs);
    };
    fetchRecs();
  }, [userData._id]);

  return (
    <div className="recommendations">
      <h2>Recommended for You</h2>
      <div className="items-grid">
        {recommendations.map(item => (
          <FoodCard key={item.itemId} data={item} />
        ))}
      </div>
    </div>
  );
}
```

---

## Testing the System

### 1. Create Test User with Preferences
```javascript
// Update user preferences
PUT /api/recommendations/preferences/64abc123
{
  "dietaryPreference": ["veg", "halal"],
  "allergies": ["nuts"],
  "favoriteCategories": ["Pizza", "Burgers"]
}
```

### 2. Create Test Items
```javascript
// Add items with recommendation fields
POST /api/item/add-item
{
  "name": "Paneer Tikka Pizza",
  "category": "Pizza",
  "foodType": "veg",
  "dietType": ["veg", "halal"],
  "spiceLevel": "medium",
  "tags": ["cheesy", "spicy", "grilled"],
  "allergens": [],
  "price": 299
}
```

### 3. Place Orders
```javascript
// Place order (automatically tracks for recommendations)
POST /api/order/place-order
{
  "cartItems": [{ "id": "64def456...", ... }],
  "paymentMethod": "cod"
}
```

### 4. Get Recommendations
```javascript
GET /api/recommendations/64abc123?limit=10

// Should return personalized recommendations
// with high scores for matching items
```

---

## Advanced Features

### 1. Trending Items Detection
Items are considered "trending" if their sales count is in the top 20% of all items.

### 2. Auto-Category Learning
System automatically adds frequently ordered categories to user's favorites.

### 3. Recency Weighting
More recent orders have higher influence on recommendations.

### 4. Diversity Scoring
Prevents recommending too many items from the same category.

---

## Performance Optimization

1. **Indexing**: Add indexes on frequently queried fields
```javascript
// In item.model.js
itemSchema.index({ salesCount: -1, 'rating.average': -1 });
itemSchema.index({ dietType: 1, allergens: 1 });

// In user.model.js
userSchema.index({ 'orderHistory.itemId': 1 });
```

2. **Caching**: Cache trending items for 1 hour
3. **Pagination**: Limit results to top 10-20 items
4. **Lean Queries**: Use `.lean()` for read-only operations

---

## Future Enhancements

1. **Time-based Recommendations**: Breakfast/Lunch/Dinner specific
2. **Weather-based**: Hot soup on rainy days
3. **Collaborative Filtering**: "Users like you also ordered..."
4. **Price Sensitivity**: Learn user's price range preferences
5. **Location-based**: Nearby restaurants first

---

## Troubleshooting

### No Recommendations Returned
- Check if user has preferences set
- Verify items have dietType and tags populated
- Ensure allergen filtering isn't too restrictive

### Low Scores
- Need more order history
- Add more tags to items
- Increase item sales count

### Wrong Recommendations
- Verify user preferences are correct
- Check item allergens are properly set
- Review scoring algorithm weights

---

## Conclusion

This rule-based recommendation system provides:
✅ Personalized suggestions based on user behavior
✅ Safety through allergen filtering
✅ Trending item detection
✅ Automatic learning from orders
✅ Production-ready, scalable architecture

The system will improve over time as users place more orders and rate items.
