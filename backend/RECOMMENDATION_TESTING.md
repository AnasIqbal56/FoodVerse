# FoodVerse Recommendation System - Test Guide

## Quick Test Scenarios

### Scenario 1: New User (No Order History)
**Expected:** Generic recommendations based on ratings and trending items

```bash
GET /api/recommendations/NEW_USER_ID?limit=5
```

**Expected Response:**
- Items with high ratings (≥4.2)
- Trending items (high sales count)
- Low personalization score

---

### Scenario 2: Vegetarian User with Nut Allergy

#### Step 1: Set Preferences
```bash
curl -X PUT http://localhost:8000/api/recommendations/preferences/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "dietaryPreference": ["veg"],
    "allergies": ["nuts"],
    "favoriteCategories": []
  }'
```

#### Step 2: Get Recommendations
```bash
GET /api/recommendations/USER_ID?limit=10
```

**Expected:**
- ✅ Only vegetarian items
- ✅ No items containing nuts
- ✅ Filtered results

---

### Scenario 3: User with Order History

#### Step 1: Place Orders (happens automatically)
When user places order via `/api/order/place-order`, the system:
1. Tracks items in `orderHistory`
2. Increments `salesCount` for items
3. Auto-adds categories to `favoriteCategories`

#### Step 2: Get Recommendations
```bash
GET /api/recommendations/USER_ID?limit=10
```

**Expected:**
- ✅ Previously ordered items appear with high scores (+20 points)
- ✅ Items from favorite categories ranked higher (+15 points)
- ✅ Tag matching from previous orders (+5 per tag)

---

### Scenario 4: Halal Muslim User

```json
{
  "dietaryPreference": ["halal"],
  "allergies": [],
  "favoriteCategories": ["Main Course", "Biryani"]
}
```

**Expected:**
- ✅ Only halal-certified items shown
- ✅ Main Course and Biryani categories prioritized
- ✅ Non-halal items excluded completely

---

### Scenario 5: Keto Diet User

```json
{
  "dietaryPreference": ["keto", "low-calorie"],
  "allergies": ["gluten"],
  "favoriteCategories": []
}
```

**Expected:**
- ✅ Only keto/low-calorie items
- ✅ No items with gluten
- ✅ High-protein, low-carb suggestions

---

## Test Data Setup

### 1. Create Test Items with Full Fields

```javascript
// POST /api/item/add-item
[
  {
    "name": "Paneer Tikka Pizza",
    "category": "Pizza",
    "foodType": "veg",
    "price": 299,
    "dietType": ["veg", "halal"],
    "spiceLevel": "medium",
    "tags": ["cheesy", "spicy", "grilled"],
    "allergens": [],
    "salesCount": 150,
    "rating": { "average": 4.5, "count": 80 }
  },
  {
    "name": "Chicken Biryani",
    "category": "Main Course",
    "foodType": "non veg",
    "price": 249,
    "dietType": ["non-veg", "halal"],
    "spiceLevel": "high",
    "tags": ["spicy", "traditional", "aromatic"],
    "allergens": [],
    "salesCount": 450,
    "rating": { "average": 4.7, "count": 320 }
  },
  {
    "name": "Veg Caesar Salad",
    "category": "Salads",
    "foodType": "veg",
    "price": 180,
    "dietType": ["veg", "keto", "low-calorie"],
    "spiceLevel": "low",
    "tags": ["healthy", "fresh", "crispy"],
    "allergens": ["dairy"],
    "salesCount": 75,
    "rating": { "average": 4.2, "count": 45 }
  },
  {
    "name": "Chocolate Brownie",
    "category": "Desserts",
    "foodType": "veg",
    "price": 120,
    "dietType": ["veg"],
    "spiceLevel": "low",
    "tags": ["sweet", "chocolate", "rich"],
    "allergens": ["nuts", "dairy", "gluten"],
    "salesCount": 220,
    "rating": { "average": 4.8, "count": 150 }
  }
]
```

---

### 2. Create Test User

```javascript
// Manually update user document in MongoDB
{
  "_id": "64test123...",
  "fullName": "Test User",
  "email": "test@foodverse.com",
  "role": "user",
  
  // Add recommendation fields
  "dietaryPreference": ["veg"],
  "allergies": ["nuts"],
  "favoriteCategories": ["Pizza"],
  "orderHistory": [
    {
      "itemId": "PANEER_PIZZA_ID",
      "timesOrdered": 3,
      "lastOrderedAt": new Date()
    }
  ]
}
```

---

### 3. Expected Scoring for Test User

Given the test data above, for a **vegetarian user with nut allergy who loves Pizza:**

**Item 1: Paneer Tikka Pizza**
- Previously ordered: +20
- Favorite category (Pizza): +15
- Dietary match (veg): +10
- High rating (4.5): +10
- Not trending: 0
- Tags (0 matches initially): 0
- **Total: 55 points**

**Item 2: Chicken Biryani**
- ❌ **EXCLUDED** (non-veg, user is veg)

**Item 3: Veg Caesar Salad**
- Not ordered: 0
- Not favorite category: 0
- Dietary match (veg): +10
- High rating (4.2): +10
- Not trending: 0
- Tags (0 matches): 0
- ❌ **EXCLUDED** (contains dairy if user is lactose intolerant)
- **Total: 20 points** (if dairy not in allergies)

**Item 4: Chocolate Brownie**
- ❌ **EXCLUDED** (contains nuts, user is allergic)

**Final Ranking:**
1. Paneer Tikka Pizza (55 points) ✅
2. Veg Caesar Salad (20 points) ✅

---

## Testing Checklist

### ✅ Basic Functionality
- [ ] GET `/api/recommendations/:userId` returns 200 OK
- [ ] Returns array of recommendations
- [ ] Each item has required fields (itemId, name, score, etc.)
- [ ] Recommendations are sorted by score (highest first)

### ✅ Safety Filters
- [ ] Items with user's allergens are excluded
- [ ] Veg users never see non-veg items
- [ ] Halal users only see halal items
- [ ] No null/undefined items in results

### ✅ Scoring Algorithm
- [ ] Previously ordered items have +20 score
- [ ] Favorite categories have +15 score
- [ ] Dietary matches have +10 score
- [ ] High ratings (≥4.2) have +10 score
- [ ] Trending items have +15 score
- [ ] Matching tags have +5 per tag

### ✅ Preference Updates
- [ ] PUT `/api/recommendations/preferences/:userId` works
- [ ] Changes are persisted in database
- [ ] New preferences affect future recommendations

### ✅ Order Tracking
- [ ] Placing order updates user's orderHistory
- [ ] Item salesCount increments
- [ ] favoriteCategories auto-updates
- [ ] Future recommendations reflect order history

### ✅ Trending Items
- [ ] GET `/api/recommendations/trending/items` returns results
- [ ] Items sorted by salesCount (descending)
- [ ] Includes rating and shop information

---

## Performance Testing

### Load Test: 100 Concurrent Users
```bash
# Using Apache Bench
ab -n 1000 -c 100 http://localhost:8000/api/recommendations/USER_ID
```

**Expected:**
- Response time: < 200ms
- No errors
- Consistent results

### Large Dataset Test
- 10,000 items in database
- 1,000 users with full profiles
- Should still return results in < 500ms

---

## Debugging Tips

### No Recommendations Returned
1. Check if user exists in database
2. Verify items have required fields (dietType, tags, etc.)
3. Check if allergen filtering is too strict
4. Review user's dietary preferences

### All Scores are 0
1. User has no order history → Expected for new users
2. No items match dietary preferences
3. Items missing salesCount/rating data

### Wrong Items Recommended
1. Verify user preferences in database
2. Check item allergens are correctly set
3. Review favorite categories
4. Inspect order history

---

## Console Logging

The recommendation controller includes extensive logging:

```
📊 User Profile: { userId, dietaryPreference, allergies, ... }
🔍 Item Query Filters: { allergens: { $nin: [...] }, ... }
📦 Found 45 eligible items
📈 Trending Threshold: 150 sales
🎯 Top Recommendations: [{ name, score, reasons }]
```

Use these logs to debug scoring and filtering issues.

---

## Integration Testing

### Test Complete Flow
1. Create new user
2. Update preferences
3. Browse items
4. Place order
5. Get recommendations
6. Verify previously ordered items score higher

### Expected User Journey
```
New User → Generic Recommendations
  ↓
Set Preferences → Filtered Recommendations
  ↓
Place Order → Order Tracked
  ↓
Return Later → Personalized Recommendations
  ↓
Rate Items → Improved Recommendations
```

---

## Success Criteria

The recommendation system is working correctly if:

✅ **Safety**: No allergen items shown to allergic users  
✅ **Personalization**: Order history affects recommendations  
✅ **Relevance**: High-rated items appear in top 10  
✅ **Diversity**: Not all items from same category  
✅ **Performance**: Response time < 500ms  
✅ **Learning**: Recommendations improve with more orders  

---

## Next Steps After Testing

1. **Monitor**: Track recommendation click-through rates
2. **Optimize**: Adjust scoring weights based on user behavior
3. **Enhance**: Add time-based recommendations (breakfast/dinner)
4. **Scale**: Implement caching for trending items
5. **Analyze**: Create dashboard to view recommendation effectiveness

---

## Support

If recommendations aren't working as expected:
1. Check MongoDB indexes are created
2. Verify all items have required fields
3. Review console logs for errors
4. Test with simpler user preferences first
5. Check network requests in browser DevTools

---

## Test Automation Script

```javascript
// test-recommendations.js
const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
const userId = 'TEST_USER_ID';

async function runTests() {
  console.log('🧪 Testing Recommendation System...\n');

  try {
    // Test 1: Get recommendations
    console.log('Test 1: Get Recommendations');
    const recs = await axios.get(`${API_URL}/recommendations/${userId}`);
    console.log(`✅ Returned ${recs.data.recommendations.length} items\n`);

    // Test 2: Update preferences
    console.log('Test 2: Update Preferences');
    await axios.put(`${API_URL}/recommendations/preferences/${userId}`, {
      dietaryPreference: ['veg'],
      allergies: ['nuts']
    });
    console.log('✅ Preferences updated\n');

    // Test 3: Get trending
    console.log('Test 3: Get Trending Items');
    const trending = await axios.get(`${API_URL}/recommendations/trending/items`);
    console.log(`✅ Returned ${trending.data.trending.length} trending items\n`);

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
```

Run with: `node test-recommendations.js`

---

**Happy Testing! 🚀**
