# API Examples - FoodVerse Recommendation System

## Base URL
```
http://localhost:8000/api
```

---

## 1. Get Personalized Recommendations

### Request
```http
GET /api/recommendations/64abc123def456?limit=10
```

### Success Response (200 OK)
```json
{
  "userId": "64abc123def456",
  "totalEligibleItems": 45,
  "recommendations": [
    {
      "itemId": "64item001",
      "name": "Paneer Tikka Pizza",
      "image": "https://res.cloudinary.com/foodverse/image/...",
      "price": 299,
      "category": "Pizza",
      "foodType": "veg",
      "spiceLevel": "medium",
      "dietType": ["veg", "halal"],
      "tags": ["cheesy", "spicy", "grilled"],
      "rating": 4.5,
      "ratingCount": 120,
      "salesCount": 340,
      "shop": {
        "_id": "64shop123",
        "name": "Pizza Palace"
      },
      "score": 65
    },
    {
      "itemId": "64item002",
      "name": "Veg Burger Deluxe",
      "image": "https://res.cloudinary.com/foodverse/image/...",
      "price": 180,
      "category": "Burgers",
      "foodType": "veg",
      "spiceLevel": "low",
      "dietType": ["veg", "halal"],
      "tags": ["crispy", "fresh", "healthy"],
      "rating": 4.3,
      "ratingCount": 89,
      "salesCount": 210,
      "shop": {
        "_id": "64shop456",
        "name": "Burger King"
      },
      "score": 45
    }
  ],
  "filters": {
    "dietaryPreference": ["veg", "halal"],
    "allergies": ["nuts"],
    "favoriteCategories": ["Pizza", "Burgers"]
  }
}
```

### Query Parameters
- `limit` (optional): Number of recommendations (default: 10)

---

## 2. Update User Preferences

### Request
```http
PUT /api/recommendations/preferences/64abc123def456
Content-Type: application/json
Cookie: token=YOUR_AUTH_TOKEN

{
  "dietaryPreference": ["veg", "halal"],
  "allergies": ["nuts", "dairy"],
  "favoriteCategories": ["Pizza", "Burgers", "Main Course"]
}
```

### Success Response (200 OK)
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "dietaryPreference": ["veg", "halal"],
    "allergies": ["nuts", "dairy"],
    "favoriteCategories": ["Pizza", "Burgers", "Main Course"]
  }
}
```

### Error Response (404 Not Found)
```json
{
  "message": "User not found"
}
```

### Valid Values

**dietaryPreference:**
- `"veg"`, `"non-veg"`, `"keto"`, `"gluten-free"`, `"halal"`, `"low-calorie"`, `"vegan"`

**allergies:**
- `"nuts"`, `"dairy"`, `"gluten"`, `"shellfish"`, `"soy"`, `"eggs"`, `"fish"`

**favoriteCategories:**
- `"Snacks"`, `"Main Course"`, `"Desserts"`, `"Pizza"`, `"Burgers"`, `"Sandwiches"`,
- `"South Indian"`, `"North Indian"`, `"Chinese"`, `"Fast Food"`, `"Beverages"`, `"Others"`

---

## 3. Track Order (Auto-called after order placement)

### Request
```http
POST /api/recommendations/track-order
Content-Type: application/json
Cookie: token=YOUR_AUTH_TOKEN

{
  "userId": "64abc123def456",
  "itemIds": [
    "64item001",
    "64item002",
    "64item003"
  ]
}
```

### Success Response (200 OK)
```json
{
  "message": "Order tracked successfully",
  "orderHistoryCount": 8,
  "favoriteCategories": ["Pizza", "Burgers", "Main Course", "Desserts"]
}
```

### What Happens:
1. ✅ Each item added to user's `orderHistory`
2. ✅ `timesOrdered` incremented for repeat items
3. ✅ Item `salesCount` incremented
4. ✅ Categories auto-added to `favoriteCategories`

---

## 4. Get Trending Items

### Request
```http
GET /api/recommendations/trending/items?limit=10
```

### Success Response (200 OK)
```json
{
  "trending": [
    {
      "itemId": "64item999",
      "name": "Chicken Biryani",
      "image": "https://res.cloudinary.com/foodverse/image/...",
      "price": 249,
      "category": "Main Course",
      "rating": 4.7,
      "ratingCount": 450,
      "salesCount": 890,
      "tags": ["spicy", "traditional", "aromatic"],
      "shop": {
        "_id": "64shop789",
        "name": "Biryani House"
      }
    },
    {
      "itemId": "64item888",
      "name": "Margherita Pizza",
      "image": "https://res.cloudinary.com/foodverse/image/...",
      "price": 199,
      "category": "Pizza",
      "rating": 4.4,
      "ratingCount": 320,
      "salesCount": 675,
      "tags": ["classic", "cheesy", "italian"],
      "shop": {
        "_id": "64shop123",
        "name": "Pizza Palace"
      }
    }
  ]
}
```

### Query Parameters
- `limit` (optional): Number of items (default: 10)

---

## JavaScript/Axios Examples

### Get Recommendations
```javascript
import axios from 'axios';

const getRecommendations = async (userId, limit = 10) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/recommendations/${userId}?limit=${limit}`
    );
    return response.data.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

// Usage
const recommendations = await getRecommendations('64abc123def456', 10);
console.log(recommendations);
```

---

### Update User Preferences
```javascript
const updatePreferences = async (userId, preferences) => {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/recommendations/preferences/${userId}`,
      {
        dietaryPreference: preferences.diet,
        allergies: preferences.allergies,
        favoriteCategories: preferences.favorites
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// Usage
await updatePreferences('64abc123def456', {
  diet: ['veg', 'keto'],
  allergies: ['nuts', 'dairy'],
  favorites: ['Pizza', 'Salads']
});
```

---

### Track Order
```javascript
const trackOrder = async (userId, itemIds) => {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/recommendations/track-order',
      { userId, itemIds },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error tracking order:', error);
  }
};

// Usage (automatically called in order.controllers.js)
await trackOrder('64abc123def456', [
  '64item001',
  '64item002'
]);
```

---

### Get Trending Items
```javascript
const getTrendingItems = async (limit = 10) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/recommendations/trending/items?limit=${limit}`
    );
    return response.data.trending;
  } catch (error) {
    console.error('Error fetching trending items:', error);
    return [];
  }
};

// Usage
const trending = await getTrendingItems(5);
console.log(trending);
```

---

## React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';

function RecommendedForYou() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/recommendations/${userData._id}?limit=10`
        );
        setRecommendations(response.data.recommendations);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?._id) {
      fetchRecommendations();
    }
  }, [userData?._id]);

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return <div>No recommendations available</div>;
  }

  return (
    <div className="recommendations-section">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((item) => (
          <FoodCard
            key={item.itemId}
            data={{
              _id: item.itemId,
              name: item.name,
              image: item.image,
              price: item.price,
              category: item.category,
              foodType: item.foodType,
              rating: { average: item.rating, count: item.ratingCount },
              tags: item.tags,
              shop: item.shop
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default RecommendedForYou;
```

---

## Postman Collection

### Collection Variables
```json
{
  "baseUrl": "http://localhost:8000/api",
  "userId": "64abc123def456"
}
```

### Requests

#### 1. Get Recommendations
```
GET {{baseUrl}}/recommendations/{{userId}}?limit=10
```

#### 2. Update Preferences
```
PUT {{baseUrl}}/recommendations/preferences/{{userId}}
Headers: Content-Type: application/json
Body (raw JSON):
{
  "dietaryPreference": ["veg"],
  "allergies": ["nuts"],
  "favoriteCategories": ["Pizza"]
}
```

#### 3. Track Order
```
POST {{baseUrl}}/recommendations/track-order
Headers: Content-Type: application/json
Body (raw JSON):
{
  "userId": "{{userId}}",
  "itemIds": ["64item001", "64item002"]
}
```

#### 4. Get Trending
```
GET {{baseUrl}}/recommendations/trending/items?limit=10
```

---

## cURL Examples

### Get Recommendations
```bash
curl -X GET "http://localhost:8000/api/recommendations/64abc123def456?limit=10"
```

### Update Preferences
```bash
curl -X PUT "http://localhost:8000/api/recommendations/preferences/64abc123def456" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_AUTH_TOKEN" \
  -d '{
    "dietaryPreference": ["veg", "halal"],
    "allergies": ["nuts"],
    "favoriteCategories": ["Pizza", "Burgers"]
  }'
```

### Track Order
```bash
curl -X POST "http://localhost:8000/api/recommendations/track-order" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "64abc123def456",
    "itemIds": ["64item001", "64item002"]
  }'
```

### Get Trending Items
```bash
curl -X GET "http://localhost:8000/api/recommendations/trending/items?limit=5"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "No items provided"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error generating recommendations",
  "error": "Detailed error message"
}
```

---

## Rate Limiting (Future Enhancement)

```javascript
// Recommended: 100 requests per minute per user
// Add rate limiting middleware in routes
import rateLimit from 'express-rate-limit';

const recommendationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please try again later'
});

router.get('/:userId', recommendationLimiter, getRecommendations);
```

---

**API Documentation Complete! 🚀**
