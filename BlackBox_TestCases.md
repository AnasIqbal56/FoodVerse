# FoodVerse – Black-Box Test Case Design Document

**Application:** FoodVerse – Food Ordering & Delivery Platform  
**Testing Type:** Black-Box Testing  
**Date:** March 4, 2026  
**Prepared By:** QA Team

---

## Table of Contents

1. [Selected Features Overview](#1-selected-features-overview)
2. [Feature 1 – Order Placement & Validation (Decision Table)](#2-feature-1--order-placement--validation)
3. [Feature 2 – Food Item Rating & Review (Boundary Value Analysis)](#3-feature-2--food-item-rating--review)
4. [Feature 3 – Cart Total & Delivery Fee Calculation (BVA)](#4-feature-3--cart-total--delivery-fee-calculation)
5. [Feature 4 – Personalized Recommendation Engine (Equivalence Partitioning)](#5-feature-4--personalized-recommendation-engine)
6. [Feature 5 – Dietary Preferences & Allergen Filtering (EP + Decision Table)](#6-feature-5--dietary-preferences--allergen-filtering)
7. [Feature 6 – Owner: Add Food Item (Equivalence Partitioning + BVA)](#7-feature-6--owner-add-food-item)
8. [Feature 7 – Rider: Accept Order & OTP Delivery Confirmation (BVA + State Transition)](#8-feature-7--rider-accept-order--otp-delivery-confirmation)
9. [Feature 8 – Payment Process – Stripe Online & COD (EP + Decision Table)](#9-feature-8--payment-process--stripe-online--cod)
10. [Technique Comparison & Justification](#10-technique-comparison--justification)
11. [Testing Level Analysis](#11-testing-level-analysis)
12. [Feature-wise Test Summary Report](#12-feature-wise-test-summary-report)

---

## 1. Selected Features Overview

| # | Feature | Why Selected | Technique Used |
|---|---------|-------------|----------------|
| 1 | Order Placement & Validation | Core revenue-generating workflow; involves multiple concurrent validation conditions (cart, address, payment, location) | Decision Table Testing |
| 2 | Food Item Rating & Review | Strict numeric boundary enforcement (1–5 stars); prevents fraud through ordering verification | Boundary Value Analysis (BVA) |
| 3 | Cart Total & Delivery Fee Calculation | Financial computation with a clear boundary threshold (₹500 free delivery trigger) | Boundary Value Analysis (BVA) |
| 4 | Personalized Recommendation Engine | Complex scoring algorithm with distinct user-profile-based input partitions | Equivalence Partitioning (EP) |
| 5 | Dietary Preferences & Allergen Filtering | Boolean-style multi-condition filtering maps exactly to decision table structure | Equivalence Partitioning + Decision Table |

> **Excluded features:** Login/SignUp (standard auth, low business logic complexity), Shop Creation (single-path CRUD).

---

## 2. Feature 1 – Order Placement & Validation

### Feature Description
When a user clicks "Place Order" in CheckOut.jsx, the system validates:
- Cart must not be empty
- Delivery address text must be provided
- Geographic coordinates (lat/lon) must be present — **Note:** coordinates are auto-fetched (via browser Geolocation API or Geoapify reverse-geocoding), but can still be `null` in real scenarios: browser geolocation denied/unavailable, Geoapify API failure (quota exceeded, network error, invalid key), or user landing on checkout without ever triggering a location lookup. The validation guard `if (!location?.lat || !location?.lon)` in `handlePlaceOrder` exists precisely for these cases.
- Payment method must be `cod` or `online` — **Note (updated):** default is now `""` (none selected); user must explicitly choose, otherwise an alert fires before any API call is made

**Source:** `backend/controllers/order.controllers.js` → `placeOrder()`, `frontend/src/pages/CheckOut.jsx` → `handlePlaceOrder()`

### Technique: Decision Table Testing

A decision table is used when the output depends on **combinations of conditions** rather than a single variable. `placeOrder` has 4 independent boolean conditions producing different outcomes.

#### Decision Table

| Condition | TC-OP-01 | TC-OP-02 | TC-OP-03 | TC-OP-04 | TC-OP-05 | TC-OP-06 | TC-OP-07 | TC-OP-08 |
|-----------|----------|----------|----------|----------|----------|----------|----------|----------|
| Cart has items? | NO | YES | YES | YES | YES | YES | YES | YES |
| Address text provided? | – | NO | YES | YES | YES | YES | YES | YES |
| Coordinates (lat/lon) resolved? (auto-fetched; null if geolocation denied / geocoding API fails) | – | – | NO | YES | YES | YES | YES | YES |
| Payment method valid? | – | – | – | NO | YES (cod) | YES (online) | YES (cod) | YES (online) |
| Total Amount > 0? | – | – | – | – | NO | NO | YES | YES |
| **Expected Output** | 400: Cart empty | Alert: No address | Alert: No location | 400: Bad Request | 400: Invalid amount | 400: Invalid amount | **201: Order placed (COD)** | **201: Order placed (Online→Stripe)** |

#### Test Case Table

| Test Case ID | Description | Input Data | Expected Output | Expected HTTP Status |
|---|---|---|---|---|
| TC-OP-01 | Empty cart order attempt | `cartItems: []`, valid address, valid coordinates, `paymentMethod: cod` | "Your cart is empty" alert; order NOT created | 400 |
| TC-OP-02 | Missing delivery address | 2 cart items, `addressInput: ""`, valid lat/lon, `paymentMethod: cod` | "Please enter a delivery address" alert; order NOT created | 400 |
| TC-OP-03 | Coordinates not resolved (auto-fetch failed) | 2 cart items, address typed but **Geoapify geocoding API returned an error** (or browser geolocation denied) so Redux `location` state remains `null`; `lat: null`, `lon: null` | "Please select a valid delivery location on the map" alert; order NOT created | **400** |
| TC-OP-03a | Geolocation permission denied by browser | 2 cart items, address typed manually, user dismisses browser geolocation prompt → `location` state stays `null` | "Please select a valid delivery location on the map" alert | **400** |
| TC-OP-03b | Geocoding API quota exceeded | 2 cart items, `addressInput` filled, search button clicked but Geoapify returns 429/error → `location` not updated | "Please select a valid delivery location on the map" alert | **400** |
| TC-OP-04 | No payment method selected (new default) | 2 cart items, valid address, valid coords, `paymentMethod: ""` (nothing chosen) | "Please select a payment method to continue" alert; order NOT created | **400** |
| TC-OP-04a | Invalid payment method (direct API call) | 2 cart items, valid address, valid lat/lon, `paymentMethod: "crypto"` sent directly to backend | Order rejected – enum validation error | 500/400 |
| TC-OP-05 | COD order with zero total | 2 items with price 0, valid address, valid coords, `paymentMethod: cod` | Order rejected – invalid amount | 400 |
| TC-OP-06 | Online payment with zero total | Same as TC-OP-05 but `paymentMethod: online` | Order rejected – Stripe rejects zero charge | 400 |
| TC-OP-07 | **Valid COD order (Happy Path)** | `cartItems: [{id, shopId, price: 150, quantity: 2, name}]`, address: "123 Main St", `lat: 28.6139`, `lon: 77.2090`, `paymentMethod: cod`, `totalAmount: 340` | Order created, status "pending", socket notification to shop owner | **201** |
| TC-OP-08 | **Valid Online Payment order** | Same as TC-OP-07 but `paymentMethod: online` | Stripe PaymentIntent created, clientSecret returned, order created after payment confirmation | **201** |
| TC-OP-09 | Cart items from 2 different shops | `cartItems` with items from shopA and shopB, valid address, COD | Two `shopOrders` sub-documents created; subtotals correct per shop | 201 |
| TC-OP-10 | Cart item with missing shopId | 1 item where `shopId` is undefined, valid address, COD | Error: "Cart item missing shop id" | 500 |

---

## 3. Feature 2 – Food Item Rating & Review

### Feature Description
Authenticated users can rate a food item (1–5 stars) only if that item exists in a completed order. Duplicate ratings update the existing record and re-calculate the running average.

**Source:** `backend/controllers/rating.controllers.js` → `addRating()`

### Technique: Boundary Value Analysis (BVA)

BVA is ideal because the rating field has a **defined numeric range [1, 5]**. BVA mandates testing at: minimum (1), just below minimum (0), maximum (5), just above maximum (6), and a nominal value (3).

#### Input Domain

| Variable | Type | Valid Range | Boundaries |
|---|---|---|---|
| `rating` | Integer | [1, 5] | 0 (below min), 1 (min), 2 (min+1), 3 (nominal), 4 (max-1), 5 (max), 6 (above max) |
| `review` | String | Optional (0–500 chars) | Empty string (""), null, 500-char string, 501-char string |
| `itemId` | ObjectId | Must exist in the referenced order | Valid ID in order, valid ID NOT in order, invalid format |

#### BVA Test Case Table

| Test Case ID | Input: rating | Input: review | Input: itemId | Input: orderId | Expected Output | Expected Status |
|---|---|---|---|---|---|---|
| TC-RT-01 | **0** (below min) | "Good" | Valid, in order | Valid, belongs to user | "Rating must be between 1 and 5" | **400** |
| TC-RT-02 | **1** (minimum) | "Worst I had" | Valid, in order | Valid, belongs to user | Rating created; item avg updated to 1.0 | **201** |
| TC-RT-03 | **2** (min + 1) | "Below average" | Valid, in order | Valid, belongs to user | Rating created; item avg updated | **201** |
| TC-RT-04 | **3** (nominal midpoint) | "Okay" | Valid, in order | Valid, belongs to user | Rating created; item avg updated | **201** |
| TC-RT-05 | **4** (max − 1) | "Good food" | Valid, in order | Valid, belongs to user | Rating created; item avg updated | **201** |
| TC-RT-06 | **5** (maximum) | "Excellent!" | Valid, in order | Valid, belongs to user | Rating created; item avg = 5.0 | **201** |
| TC-RT-07 | **6** (above max) | "Amazing" | Valid, in order | Valid, belongs to user | "Rating must be between 1 and 5" | **400** |
| TC-RT-08 | **null** (missing) | "No stars given" | Valid, in order | Valid, belongs to user | "Rating must be between 1 and 5" | **400** |
| TC-RT-09 | **3.5** (decimal) | "Half star?" | Valid, in order | Valid, belongs to user | Rounded/rejected depending on schema | 201/400 |
| TC-RT-10 | **5** | "" (empty review) | Valid, in order | Valid, belongs to user | Rating created with empty review string | **201** |
| TC-RT-11 | **4** | 501-char string | Valid, in order | Valid, belongs to user | Review truncated or validation error | 201/400 |
| TC-RT-12 | **5** | "Great" | **Item NOT in order** | Valid, belongs to user | "Item not found in this order" | **400** |
| TC-RT-13 | **5** | "Great" | Valid, in order | **Order belongs to different user** | "Unauthorized" | **403** |
| TC-RT-14 | **4** | "Updated" | Valid, in order (already rated) | Same order | Existing rating updated; avg recalculated | **200** |

#### Average Calculation Verification (BVA Corner Case)

> **Formula used by system:** `newAverage = ((oldAverage × oldCount) + newRating) / newCount`

| Test Case ID | Scenario | Count Before | Avg Before | New Rating | Expected Avg After | Expected Count |
|---|---|---|---|---|---|---|
| TC-RT-AV-01 | First rating ever | 0 | 0.0 | 5 | **5.00** | 1 |
| TC-RT-AV-02 | Second rating | 1 | 5.0 | 1 | **3.00** | 2 |
| TC-RT-AV-03 | Update existing rating (old=5, new=1) | 2 | 3.0 | 1 (updated) | **2.00** | 2 (unchanged) |

---

## 4. Feature 3 – Cart Total & Delivery Fee Calculation

### Feature Description
The checkout page applies a **delivery fee of ₹40** unless the cart subtotal exceeds ₹500, in which case delivery is **free (₹0)**.

**Source:** `frontend/src/pages/CheckOut.jsx`
```javascript
const deliveryFee = totalAmount > 500 ? 0 : 40;
const AmountWithDeliveryFee = totalAmount + deliveryFee;
```

### Technique: Boundary Value Analysis (BVA)

The business rule `totalAmount > 500` defines a clear **boundary at ₹500**. BVA mandates testing at 499, 500, 501, and 0, along with extreme values.

#### Boundary Identification

| Boundary Point | Value | Condition |
|---|---|---|
| Below minimum | ₹0 | Edge case (empty/zero price items) |
| Below threshold | ₹499 | deliveryFee = ₹40 |
| At threshold | ₹500 | deliveryFee = ₹40 (NOT free – strict `>`) |
| Just above threshold | ₹501 | deliveryFee = ₹0 (FREE) |
| Large order | ₹5000 | deliveryFee = ₹0 |

#### BVA Test Case Table

| Test Case ID | Cart Subtotal (totalAmount) | Expected Delivery Fee | Expected Grand Total | Pass/Fail Criteria |
|---|---|---|---|---|
| TC-DF-01 | **₹0** | ₹40 | **₹40** | Grand total must equal ₹40 |
| TC-DF-02 | **₹1** | ₹40 | **₹41** | Grand total must equal ₹41 |
| TC-DF-03 | **₹40** | ₹40 | **₹80** | Grand total must equal ₹80 |
| TC-DF-04 | **₹100** | ₹40 | **₹140** | Grand total must equal ₹140 |
| TC-DF-05 | **₹499** | ₹40 | **₹539** | Delivery fee must be ₹40 (NOT free) |
| TC-DF-06 | **₹500** (at boundary) | ₹40 | **₹540** | `500 > 500` is FALSE → fee = ₹40 |
| TC-DF-07 | **₹501** (just above) | ₹0 (FREE) | **₹501** | `501 > 500` is TRUE → fee = ₹0 |
| TC-DF-08 | **₹502** | ₹0 | **₹502** | Delivery free |
| TC-DF-09 | **₹1000** | ₹0 | **₹1000** | Delivery free for large order |
| TC-DF-10 | **₹5000** | ₹0 | **₹5000** | Delivery free for very large order |
| TC-DF-11 | **₹-50** (negative, edge) | ₹40 | **₹-10** | System should prevent negative totals |
| TC-DF-12 | **₹500.01** (decimal) | ₹0 | **₹500.01** | Decimal just above → free delivery |
| TC-DF-13 | **₹499.99** (decimal) | ₹40 | **₹539.99** | Decimal just below → delivery fee applies |

#### Critical Test: Boundary Exactness

| Scenario | Expected Behavior | Actual Rule |
|---|---|---|
| `totalAmount = 500` | **Fee = ₹40** (NOT free) | `500 > 500` evaluates to **false** |
| `totalAmount = 501` | **Fee = ₹0** (FREE) | `501 > 500` evaluates to **true** |

> **Risk:** If the condition were accidentally changed to `>= 500`, TC-DF-06 would expose the defect: grand total would wrongly become ₹500 instead of ₹540.

---

## 5. Feature 4 – Personalized Recommendation Engine

### Feature Description
The rule-based engine scores food items for a user based on:
- Order history (+20 pts per previously ordered item)
- Favorite categories (+15 pts)
- Dietary preference match (+10 pts)
- High rating ≥ 4.2 (+10 pts)
- Trending (high salesCount) (+15 pts)
- Tag match (+5 pts per tag)
- **Allergen filter:** Excludes items containing user's allergens
- **Dietary filter:** veg-only, halal-only, or mixed

**Source:** `backend/controllers/recommendation.controllers.js`

### Technique: Equivalence Partitioning (EP)

EP divides input space into **classes where all values within a class are expected to produce the same behavior**. The recommendation engine has multiple independent user-profile dimensions, each yielding distinct partitions.

#### Equivalence Classes

**EP Dimension 1 – User Order History**

| Class ID | Partition | Representative Value |
|---|---|---|
| EP-REC-OH-1 | No order history | `orderHistory: []` |
| EP-REC-OH-2 | Has order history (≥1 item) | `orderHistory: [{itemId: "abc", count: 3}]` |

**EP Dimension 2 – Dietary Preference**

| Class ID | Partition | Representative Value |
|---|---|---|
| EP-REC-DP-1 | No preference set | `dietaryPreference: []` |
| EP-REC-DP-2 | Single preference (veg) | `dietaryPreference: ["veg"]` |
| EP-REC-DP-3 | Single preference (halal) | `dietaryPreference: ["halal"]` |
| EP-REC-DP-4 | Multiple preferences | `dietaryPreference: ["keto", "gluten-free"]` |

**EP Dimension 3 – Allergens**

| Class ID | Partition | Representative Value |
|---|---|---|
| EP-REC-AL-1 | No allergens | `allergies: []` |
| EP-REC-AL-2 | Single allergen | `allergies: ["peanuts"]` |
| EP-REC-AL-3 | Multiple allergens | `allergies: ["milk", "eggs", "wheat"]` |
| EP-REC-AL-4 | All items contain user allergen | `allergies: ["wheat"]` (all DB items have wheat) |

**EP Dimension 4 – Favourite Categories**

| Class ID | Partition | Representative Value |
|---|---|---|
| EP-REC-FC-1 | No favourite categories | `favoriteCategories: []` |
| EP-REC-FC-2 | Has favourite categories | `favoriteCategories: ["Pizza", "Burgers"]` |

#### Equivalence Partitioning Test Case Table

| Test Case ID | User Profile Input | Items in DB | Expected Behavior | Score Boost Active |
|---|---|---|---|---|
| TC-REC-01 | `orderHistory: []`, `dietaryPreference: []`, `allergies: []`, `favoriteCategories: []` – **blank profile** | 10 generic items | Returns items sorted by rating and salesCount only; no personalization bonuses | Rating (+10), Trending (+15) |
| TC-REC-02 | `orderHistory: [{itemId: "PizzaA"}]` – **has order history**, no other prefs | Item "PizzaA" in DB | "PizzaA" should appear at or near top with +20 order history bonus | OrderHistory (+20) |
| TC-REC-03 | `dietaryPreference: ["veg"]` – **veg only** | Mix of veg and non-veg items | Non-veg items EXCLUDED from results entirely | DietaryFilter |
| TC-REC-04 | `dietaryPreference: ["halal"]` – **halal only** | Mix of halal and non-halal items | Only halal items returned | DietaryFilter |
| TC-REC-05 | `allergies: ["peanuts"]` – **single allergen** | Items with/without peanuts | Items containing "peanuts" in allergens field are EXCLUDED | AllergenFilter |
| TC-REC-06 | `allergies: ["milk","eggs","wheat"]` – **multiple allergens** | Items with various allergens | Items containing ANY of milk/eggs/wheat excluded | AllergenFilter |
| TC-REC-07 | `allergies: ["wheat"]`, all DB items contain wheat | All items have wheat allergen | Returns empty recommendations array; message: "No items match your preferences" | AllergenFilter (all excluded) |
| TC-REC-08 | `favoriteCategories: ["Pizza"]`, 5 Pizza items + 5 Burger items | 10 items | Pizza items score +15 higher; appear above burgers if equal otherwise | CategoryBonus (+15) |
| TC-REC-09 | `dietaryPreference: ["veg"]` + `allergies: ["milk"]` – **combined filters** | veg items (some with milk) | Returns only veg items that do NOT contain milk | Both filters active |
| TC-REC-10 | Full profile: history + fav category + allergen + dietary pref | Mixed DB | Item matching all criteria scores highest; allergen items excluded | All bonuses |
| TC-REC-11 | `limit=3` query param | 10 eligible items | Exactly 3 items returned, highest scored ones | Limit parameter |
| TC-REC-12 | Invalid/non-existent userId | – | "User not found" response | – |

---

## 6. Feature 5 – Dietary Preferences & Allergen Filtering

### Feature Description
Users set dietary preferences (veg, vegan, halal, keto, etc.) and allergen lists in their profile (`DietaryPreferences.jsx`). The recommendation engine AND item browsing filter results accordingly.

**Source:** `backend/controllers/recommendation.controllers.js` (filter logic), `backend/models/item.model.js` (allergens/dietType enums), `backend/models/user.model.js`

### Technique: Equivalence Partitioning + Decision Table

**EP** is used to partition dietary preference states; a **Decision Table** captures the multi-condition filter combinations and their outputs.

#### Equivalence Partitions for Dietary Preferences

| Class | Partition Description | Example Values |
|---|---|---|
| EP-DF-1 | No dietary restrictions set | `dietaryPreference: []`, `allergies: []` |
| EP-DF-2 | Preference set, no allergens | `dietaryPreference: ["keto"]`, `allergies: []` |
| EP-DF-3 | No preference, allergens set | `dietaryPreference: []`, `allergies: ["eggs"]` |
| EP-DF-4 | Both preferences and allergens set | `dietaryPreference: ["vegan"]`, `allergies: ["milk"]` |
| EP-DF-5 | Conflicting preferences (e.g., veg + non-veg) | `dietaryPreference: ["veg", "non-veg"]` |

#### EP Test Cases

| Test Case ID | Preferences | Allergens | DB Items Available | Expected Filter Output |
|---|---|---|---|---|
| TC-DF-EP-01 | `[]` | `[]` | All items | **All items shown** – no filter applied |
| TC-DF-EP-02 | `["keto"]` | `[]` | 5 keto, 5 non-keto | Only **5 keto items** shown |
| TC-DF-EP-03 | `[]` | `["eggs"]` | 3 with eggs, 7 without | Only **7 items** (egg-containing excluded) |
| TC-DF-EP-04 | `["vegan"]` | `["milk"]` | 4 vegan+no-milk, 2 vegan+milk, 4 non-vegan | Only the **4 vegan items without milk** returned |
| TC-DF-EP-05 | `["veg", "non-veg"]` (conflicting) | `[]` | Mixed | System should apply first matching rule; non-veg likely excluded if veg precedence | 

#### Decision Table for Item Filter Logic

**Conditions:**
- C1: User has dietary preference set?
- C2: Preference includes "veg"?
- C3: Preference includes "halal"?
- C4: User has allergens set?
- C5: Item's allergens overlap user's allergen list?

**Actions:**
- A1: Apply `foodType: 'veg'` filter
- A2: Apply `dietType: {$in: ['halal']}` filter
- A3: Apply `allergens: {$nin: allergies}` filter
- A4: Include item in results

| Condition/Action | DT-01 | DT-02 | DT-03 | DT-04 | DT-05 | DT-06 | DT-07 | DT-08 |
|---|---|---|---|---|---|---|---|---|
| C1: Has dietary pref | N | Y | Y | Y | Y | N | Y | Y |
| C2: Pref = "veg" | – | Y | N | N | Y | – | Y | Y |
| C3: Pref = "halal" | – | N | Y | N | N | – | N | Y |
| C4: Has allergens | N | N | N | Y | N | Y | Y | Y |
| C5: Item has user allergen | – | – | – | Y | – | Y | Y | – |
| **A1: veg filter** | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **A2: halal filter** | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **A3: allergen exclusion** | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| **A4: Include item** | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |

#### Decision Table Test Cases

| Test Case ID | Conditions (C1–C5) | Item Profile | Expected Result |
|---|---|---|---|
| TC-DT-01 | No pref, no allergens | Any item | Item INCLUDED – no filter |
| TC-DT-02 | veg pref, no allergens | `foodType: "veg"` | Item INCLUDED |
| TC-DT-03 | veg pref, no allergens | `foodType: "non veg"` | Item **EXCLUDED** |
| TC-DT-04 | halal pref, no allergens | `dietType: ["halal"]` | Item INCLUDED |
| TC-DT-05 | halal pref, no allergens | `dietType: ["kosher"]` (non-halal) | Item **EXCLUDED** |
| TC-DT-06 | No pref, allergens: ["eggs"] | Item has `allergens: []` | Item INCLUDED |
| TC-DT-07 | No pref, allergens: ["eggs"] | Item has `allergens: ["eggs"]` | Item **EXCLUDED** |
| TC-DT-08 | veg pref + allergens: ["milk"] | `foodType: "veg"`, `allergens: ["milk"]` | Item **EXCLUDED** (allergen override) |
| TC-DT-09 | veg pref + allergens: ["milk"] | `foodType: "veg"`, `allergens: ["wheat"]` | Item **INCLUDED** (veg + no milk) |
| TC-DT-10 | veg pref + halal pref + allergens: ["eggs"] | `foodType: "veg"`, `dietType: ["halal"]`, `allergens: []` | Item **INCLUDED** (meets both dietary + no allergen) |

---

---

## 7. Feature 6 – Owner: Add Food Item

### Feature Description
Shop owners add menu items through the **Add Food Item** form (`/add-item` → `AddItem.jsx`). A `multipart/form-data` POST request is sent to `POST /api/item/add-item`. The backend:
1. Requires the owner to have a shop already created (no shop → 400)
2. Uploads the image to **Cloudinary** (image is required)
3. Creates an `Item` document in MongoDB linked to the owner's shop
4. Returns the updated shop object (all items populated)

**Mandatory fields:** `name`, `category` (enum: 12 values), `price` (Number ≥ 0), `foodType` (veg / non veg), `image` (file upload)  
**Optional fields:** `dietType[]`, `spiceLevel` (low / medium / high, default medium), `allergens[]`, `tags[]`

**Source:** `frontend/src/pages/AddItem.jsx`, `backend/controllers/item.controllers.js` → `addItem()`, `backend/models/item.model.js`

### Technique: Equivalence Partitioning + Boundary Value Analysis

**EP** partitions the large categorical input fields (12 categories, 19 diet types, 17 allergens, 11 tags) into valid/invalid classes, and partitions the mandatory-vs-optional field presence. **BVA** targets the `price` field which has a defined minimum (`min: 0` in schema) and realistic upper bounds, and the `name` field length.

---

#### EP – Input Field Equivalence Classes

**EP Dimension 1 – Item Name**

| Class ID | Partition | Representative Value | Valid? |
|---|---|---|---|
| EP-AI-N1 | Non-empty string (normal) | `"Chicken Biryani"` | ✅ Valid |
| EP-AI-N2 | Empty string | `""` | ❌ Invalid (required) |
| EP-AI-N3 | Whitespace only | `"   "` | ❌ Invalid |
| EP-AI-N4 | Very long name (100+ chars) | 110-char string | ❌ / depends on schema |
| EP-AI-N5 | Special characters | `"Biryani <$#>"` | ✅ Accepted (no format constraint) |

**EP Dimension 2 – Category**

| Class ID | Partition | Representative Value | Valid? |
|---|---|---|---|
| EP-AI-C1 | Valid enum value | `"Pizza"` | ✅ Valid |
| EP-AI-C2 | Valid enum value (boundary of list) | `"Others"` | ✅ Valid |
| EP-AI-C3 | Invalid / not in enum | `"Sushi"` | ❌ Invalid – schema enum error |
| EP-AI-C4 | Empty / not selected | `""` | ❌ Invalid (required) |

**EP Dimension 3 – Food Type**

| Class ID | Partition | Value | Valid? |
|---|---|---|---|
| EP-AI-FT1 | Valid enum | `"veg"` | ✅ |
| EP-AI-FT2 | Valid enum | `"non veg"` | ✅ |
| EP-AI-FT3 | Invalid string | `"both"` | ❌ |
| EP-AI-FT4 | Missing field | *(omitted)* | ❌ (required) |

**EP Dimension 4 – Diet Type (multi-select, optional)**

| Class ID | Partition | Value | Valid? |
|---|---|---|---|
| EP-AI-DT1 | Empty array (no selection) | `[]` | ✅ (optional) |
| EP-AI-DT2 | Single valid diet type | `["keto"]` | ✅ |
| EP-AI-DT3 | Multiple valid diet types | `["vegan", "gluten-free", "low-fat"]` | ✅ |
| EP-AI-DT4 | One invalid diet type in array | `["keto", "carnivore"]` | ❌ – schema rejects "carnivore" |
| EP-AI-DT5 | All valid (maximum selection) | All 19 diet types | ✅ Edge case |

**EP Dimension 5 – Image Upload**

| Class ID | Partition | Value | Valid? |
|---|---|---|---|
| EP-AI-IMG1 | Valid image file (JPEG) | `burger.jpg` (< 5 MB) | ✅ |
| EP-AI-IMG2 | Valid image file (PNG) | `pizza.png` | ✅ |
| EP-AI-IMG3 | No file uploaded | *(omitted)* | ❌ – `image` required in schema |
| EP-AI-IMG4 | Non-image file | `menu.pdf` | ❌ – Cloudinary/multer rejects |
| EP-AI-IMG5 | Very large file (> 10 MB) | `large.jpg` | ❌ – multer size limit |

**EP Dimension 6 – Owner's Shop Existence**

| Class ID | Partition | State | Valid? |
|---|---|---|---|
| EP-AI-SH1 | Owner has a shop | Shop document exists in DB | ✅ |
| EP-AI-SH2 | Owner has NO shop | No Shop with `owner: userId` | ❌ – "Shop not found. Create shop first." |

---

#### BVA – Price Field

The `Item` model defines `price: { type: Number, min: 0, required: true }`.

| Variable | Below Min | At Min | Min+1 | Nominal | Large Value | Negative |
|---|---|---|---|---|---|---|
| `price` | –1 | **0** | 1 | 150 | 99,999 | –100 |

| Test Case ID | price Value | Expected Result | HTTP |
|---|---|---|---|
| TC-AI-PR-01 | **–1** (below min) | Schema validation error: "price must be ≥ 0" | **400/500** |
| TC-AI-PR-02 | **0** (at minimum) | ✅ Item created with price ₹0 | **201** |
| TC-AI-PR-03 | **1** (min + 1) | ✅ Item created | **201** |
| TC-AI-PR-04 | **150** (nominal) | ✅ Item created | **201** |
| TC-AI-PR-05 | **99,999** (large valid) | ✅ Item created | **201** |
| TC-AI-PR-06 | **"abc"** (non-numeric) | Cast error / validation failure | **400/500** |
| TC-AI-PR-07 | *(omitted / null)* | "price is required" | **400** |
| TC-AI-PR-08 | **0.5** (decimal price) | ✅ Item created (schema allows decimals) | **201** |

---

#### EP Full Test Cases

| Test Case ID | name | category | price | foodType | image | dietType | Owner has shop? | Expected Result | HTTP |
|---|---|---|---|---|---|---|---|---|---|
| TC-AI-01 | `"Margherita Pizza"` | `"Pizza"` | 250 | `"veg"` | pizza.jpg | `["veg"]` | YES | ✅ Item created, shop returned with new item | **201** |
| TC-AI-02 | `""` (empty) | `"Pizza"` | 250 | `"veg"` | pizza.jpg | `[]` | YES | ❌ "name is required" | **400** |
| TC-AI-03 | `"Burger"` | `"Sushi"` (invalid enum) | 180 | `"non veg"` | burger.jpg | `[]` | YES | ❌ Enum validation error for category | **400/500** |
| TC-AI-04 | `"Burger"` | `""` (missing) | 180 | `"non veg"` | burger.jpg | `[]` | YES | ❌ "category is required" | **400** |
| TC-AI-05 | `"Dal Makhani"` | `"North Indian"` | 120 | `"veg"` | dal.jpg | `["veg", "gluten-free"]` | YES | ✅ Item created with multiple diet types | **201** |
| TC-AI-06 | `"Fried Chicken"` | `"Fast Food"` | 300 | `"non veg"` | *(no image)* | `[]` | YES | ❌ Image required | **400/500** |
| TC-AI-07 | `"Fried Chicken"` | `"Fast Food"` | 300 | `"non veg"` | menu.pdf (wrong type) | `[]` | YES | ❌ Multer/Cloudinary rejects non-image | **400/500** |
| TC-AI-08 | `"Pasta"` | `"Others"` | 200 | `"veg"` | pasta.jpg | `[]` | **NO (no shop)** | ❌ "Shop not found. Create shop first." | **400** |
| TC-AI-09 | `"Cake"` | `"Desserts"` | 180 | `"veg"` | cake.jpg | `["keto", "carnivore"]` (invalid) | YES | ❌ Invalid dietType enum value | **400/500** |
| TC-AI-10 | `"Peanut Butter Toast"` | `"Snacks"` | 80 | `"veg"` | toast.jpg | `[]` | YES | allergens: `["peanuts"]`, tags: `["healthy"]` → ✅ Item created | **201** |
| TC-AI-11 | `"Biryani"` | `"Main Course"` | **–50** | `"non veg"` | biryani.jpg | `[]` | YES | ❌ price < 0, schema min violation | **400/500** |
| TC-AI-12 | `"Tea"` | `"Beverages"` | **0** | `"veg"` | tea.jpg | `[]` | YES | ✅ Zero-priced item allowed (free samples, etc.) | **201** |
| TC-AI-13 | `"South Thali"` | `"South Indian"` | 150 | `"both"` (invalid) | thali.jpg | `[]` | YES | ❌ foodType enum invalid | **400/500** |
| TC-AI-14 | `"Shawarma"` | `"Sandwiches"` | 220 | `"non veg"` | shawarma.jpg | `[]` | YES | Unauthenticated request (no cookie) | **401** |
| TC-AI-15 | `"Ice Cream"` | `"Desserts"` | 120 | `"veg"` | icecream.jpg | `["vegan", "dairy-free"]` | YES | spiceLevel: `"low"`, tags: `["sweet", "creamy"]` → ✅ All optional fields stored | **201** |

---

#### Decision Table – Mandatory Field Completeness

| Condition | DT-AI-01 | DT-AI-02 | DT-AI-03 | DT-AI-04 | DT-AI-05 | DT-AI-06 |
|---|---|---|---|---|---|---|
| name provided? | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |
| category valid enum? | ✓ | – | ✗ | ✓ | ✓ | ✓ |
| price ≥ 0? | ✓ | – | – | ✗ | ✓ | ✓ |
| foodType valid enum? | ✓ | – | – | – | ✗ | ✓ |
| image file present? | ✓ | – | – | – | – | ✗ |
| Owner has shop? | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Expected Result** | ✅ Item created (201) | ❌ name required | ❌ category enum error | ❌ price validation | ❌ foodType enum error | ❌ image required |
| **HTTP** | **201** | 400 | 400 | 400 | 400 | 400 |

---

## 8. Feature 7 – Rider: Accept Order & OTP Delivery Confirmation

### Feature Description
The delivery workflow for a **Rider (Delivery Boy)** involves two sequential actions:

**Step 1 – Accept Assignment:** When an owner marks an order as "out of delivery", the rider receives a Socket.IO `newAssignment` event. They can accept the assignment via `POST /api/order/accept-order/:assignmentId`. Business rules:
- Assignment must still be in `"broadcasted"` state (not yet taken)
- Rider must not already have an active (non-completed) assignment

**Step 2 – OTP Delivery Confirmation:** When the rider reaches the customer, they request a 4-digit OTP to be emailed to the customer (`sendDeliveryOtp`). The customer reads the OTP to the rider, who enters it (`verifyDeliveryOtp`). Rules:
- OTP is a 4-digit integer in range **[1000, 9999]**
- OTP expires in **5 minutes** (300,000 ms)
- Correct OTP + not expired → status set to "delivered", assignment marked "completed"

**Source:** `order.controllers.js` → `acceptOrder()`, `sendDeliveryOtp()`, `verifyDeliveryOtp()`

### Technique: Boundary Value Analysis (OTP) + Decision Table (Accept Order)

BVA addresses the OTP numeric range [1000–9999] and the 5-minute expiry time boundary. A Decision Table covers the multi-condition accept-order logic.

#### BVA – OTP Code Boundaries

| Variable | Min | Min+1 | Nominal | Max-1 | Max | Above Max | Below Min |
|---|---|---|---|---|---|---|---|
| OTP value (4-digit) | 1000 | 1001 | 5500 | 9998 | 9999 | 10000 | 999 |
| Expiry delta (ms) | 0 | 1 | 150,000 | 299,999 | 300,000 | 300,001 | –1 |

#### OTP BVA Test Cases

| Test Case ID | Input OTP | OTP in DB | Time Since OTP Generated | Expected Result | HTTP |
|---|---|---|---|---|---|
| TC-OTP-01 | `"1000"` (min valid) | `"1000"` | 1 minute (valid) | ✅ "Order Delivered Successfully", status → delivered | **200** |
| TC-OTP-02 | `"999"` (below min) | `"999"` | 1 minute | Even if DB matches — OTP generation uses `Math.floor(1000 + Math.random()*9000)` so 999 can never be generated; treat as invalid format | N/A |
| TC-OTP-03 | `"9999"` (max valid) | `"9999"` | 1 minute | ✅ Delivered successfully | **200** |
| TC-OTP-04 | `"10000"` (above max) | `"9999"` | 1 minute | OTP mismatch → "Invalid/Expired Otp" | **400** |
| TC-OTP-05 | `"5500"` (nominal) | `"5500"` | 2 minutes 30 sec (within 5 min) | ✅ Delivered successfully | **200** |
| TC-OTP-06 | `"5500"` | `"5500"` | **4 min 59 sec** (1 sec before expiry) | ✅ OTP still valid — delivered | **200** |
| TC-OTP-07 | `"5500"` | `"5500"` | **5 min 00 sec** (at expiry) | ❌ "Invalid/Expired Otp" — `otpExpires < Date.now()` | **400** |
| TC-OTP-08 | `"5500"` | `"5500"` | **5 min 01 sec** (just after expiry) | ❌ "Invalid/Expired Otp" | **400** |
| TC-OTP-09 | `"1234"` (wrong OTP) | `"5678"` | 1 minute | ❌ "Invalid/Expired Otp" | **400** |
| TC-OTP-10 | `""` (empty string) | `"5500"` | 1 minute | ❌ "Invalid/Expired Otp" (trim comparison fails) | **400** |
| TC-OTP-11 | `" 5500 "` (with spaces) | `"5500"` | 1 minute | ✅ Trim logic normalises → Delivered (system trims both sides) | **200** |
| TC-OTP-12 | `"5500"` | `null` (OTP never sent) | N/A | ❌ "Invalid/Expired Otp" (`storedOtp` is null after trim) | **400** |
| TC-OTP-13 | `"5500"` | `"5500"` | Valid time | orderId invalid | ❌ "enter valid order/shopOrderId" | **400** |

#### OTP Expiry Boundary Visualisation

```
Time: 0 min ──────────────── 4:59 ──── 5:00 ──── 5:01 ──► ∞
             [  VALID WINDOW  ]        [EXPIRED] [EXPIRED]
              TC-OTP-01..06             TC-OTP-07  TC-OTP-08
```

#### Decision Table – Accept Order (Rider)

| Condition | TC-AO-01 | TC-AO-02 | TC-AO-03 | TC-AO-04 | TC-AO-05 |
|-----------|----------|----------|----------|----------|----------|
| Assignment exists? | NO | YES | YES | YES | YES |
| Assignment status = "broadcasted"? | – | NO (already "assigned") | YES | YES | YES |
| Rider already has active assignment? | – | – | YES | NO | NO |
| Rider is in `brodcastedTo` list? | – | – | – | YES | NO |
| **Expected Result** | "assignment not found" | "assignment is expired" | "You are already assigned to another order" | ✅ Assignment accepted; owner notified via Socket.IO | ❌ Assignment accepted by wrong person (potential security gap) |
| **HTTP** | **400** | **400** | **400** | **200** | **200** (security concern) |

#### Accept Order Test Cases

| Test Case ID | Scenario | Input | Expected Output | HTTP |
|---|---|---|---|---|
| TC-AO-01 | Non-existent assignment ID | `assignmentId: "000000000000000000000000"` | "assignment not found" | **400** |
| TC-AO-02 | Assignment already accepted by another rider | Assignment in state `"assigned"` | "assignment is expired" | **400** |
| TC-AO-03 | Rider already on an active delivery | Rider has assignment with status `"assigned"` in DB | "You are already assigned to another order" | **400** |
| TC-AO-04 | **Happy Path – valid accept** | Broadcasted assignment, rider free, rider in broadcastedTo list | Assignment → "assigned", `acceptedAt` set, owner receives `deliveryBoyAccepted` socket event | **200** |
| TC-AO-05 | Rider accepts completed assignment | Assignment status `"completed"` | "assignment is expired" | **400** |
| TC-AO-06 | Unauthenticated request | No auth cookie / token | Middleware rejects | **401** |
| TC-AO-07 | **Happy Path + OTP** | Rider accepts → sends OTP → customer verifies → delivered | Full workflow: assignment→assigned, OTP emailed, verified, status→"delivered", assignment→"completed" | **200** |

---

## 9. Feature 8 – Payment Process – Stripe Online & COD

### Feature Description
FoodVerse supports two payment methods:

**COD (Cash on Delivery):** Order is created immediately in the database with `payment.status: "pending"`. No external payment gateway interaction.

**Stripe Online Payment (3-step flow):**
1. **Initiate** (`POST /api/payment/initiate`) — Creates order in DB with `payment.status: "pending"`, calls Stripe API to create a `PaymentIntent`. Amount is converted: `totalAmount × 100` (PKR → paisa). Minimum Stripe amount: **50 paisa** (i.e., `totalAmount ≥ 0.50`).
2. **Confirm on Frontend** — User's card details processed by Stripe.js/Elements. `clientSecret` passed to `StripePaymentForm.jsx`.
3. **Confirm to Backend** (`POST /api/payment/confirm/:orderId`) — Backend calls `verifyPaymentStatus(paymentIntentId)`. If Stripe confirms `succeeded`, order's `payment.status` → `"paid"`, shop owners notified via Socket.IO, confirmation email sent to customer.

**Source:** `order.controllers.js` → `initiateStripePayment()`, `confirmStripePayment()`, `utils/stripe.js` → `createPaymentIntent()`, `verifyPaymentStatus()`

### Technique: Equivalence Partitioning + Decision Table

EP partitions the `totalAmount` input domain and payment status states. A Decision Table maps payment method × validation conditions → outcomes.

#### EP – Amount Input Domain for Stripe

| Class ID | Partition Description | Range | Representative Value |
|---|---|---|---|
| EP-PAY-A1 | Below Stripe minimum (invalid) | totalAmount < 0.50 PKR | ₹0, ₹0.49 |
| EP-PAY-A2 | At Stripe minimum | totalAmount = 0.50 PKR | ₹0.50 (= 50 paisa) |
| EP-PAY-A3 | Normal valid amount (below free delivery) | 0.50 < totalAmount ≤ 500 | ₹150, ₹499 |
| EP-PAY-A4 | Normal valid amount (above free delivery threshold) | totalAmount > 500 | ₹750, ₹2000 |
| EP-PAY-A5 | Extremely large amount | totalAmount > 99,999 | ₹1,00,000 |
| EP-PAY-A6 | Negative amount | totalAmount < 0 | ₹-100 |

#### EP – Payment Intent Status Partitions

| Class ID | Stripe Status | Meaning | Action |
|---|---|---|---|
| EP-PAY-S1 | `succeeded` | Card charged successfully | Order confirmed, email sent |
| EP-PAY-S2 | `requires_payment_method` | Card declined | Backend returns "Payment verification failed" |
| EP-PAY-S3 | `requires_action` | 3D Secure required | Frontend handles; backend waits for confirm call |
| EP-PAY-S4 | `canceled` | Payment cancelled by user/timeout | Order remains with pending payment |
| EP-PAY-S5 | Already `paid` (duplicate confirm call) | Idempotency scenario | "Payment already confirmed" returned without re-processing |

#### EP Test Cases – Amount Validation

| Test Case ID | totalAmount | Converted (paisa) | Stripe API Called? | Expected Result | HTTP |
|---|---|---|---|---|---|
| TC-PAY-EP-01 | **₹0** | 0 paisa | NO | "Invalid amount" — backend validation catches `totalAmount <= 0` | **400** |
| TC-PAY-EP-02 | **₹0.49** | 49 paisa | YES (but Stripe rejects) | Stripe throws: "Amount must be at least 50 in smallest currency unit" | **400** |
| TC-PAY-EP-03 | **₹0.50** | 50 paisa (minimum) | YES ✅ | PaymentIntent created; clientSecret returned | **200** |
| TC-PAY-EP-04 | **₹150** | 15,000 paisa | YES ✅ | PaymentIntent created successfully | **200** |
| TC-PAY-EP-05 | **₹500** | 50,000 paisa | YES ✅ | PaymentIntent created; delivery fee ₹40 already included in totalAmount | **200** |
| TC-PAY-EP-06 | **₹750** | 75,000 paisa | YES ✅ | PaymentIntent created; free delivery already applied | **200** |
| TC-PAY-EP-07 | **₹1,00,000** | 1,00,00,000 paisa | YES ✅ | PaymentIntent created (Stripe handles large amounts) | **200** |
| TC-PAY-EP-08 | **₹-100** | -10,000 paisa | NO | "Invalid amount" — backend catches `totalAmount <= 0` | **400** |

#### EP Test Cases – Payment Status Confirmation

| Test Case ID | Stripe PaymentIntent Status | Previous order payment.status | Expected Backend Action | HTTP |
|---|---|---|---|---|
| TC-PAY-EP-09 | **`succeeded`** | pending | ✅ `payment.status → "paid"`, `paidAt` set, socket `newOrder` to owner, confirmation email sent | **200** |
| TC-PAY-EP-10 | **`requires_payment_method`** (card declined) | pending | ❌ "Payment verification failed"; order remains pending | **400** |
| TC-PAY-EP-11 | **`canceled`** | pending | ❌ "Payment verification failed" | **400** |
| TC-PAY-EP-12 | **`succeeded`** (duplicate confirm call) | **paid** | "Payment already confirmed" — idempotent; no re-processing | **200** |
| TC-PAY-EP-13 | `succeeded` | pending | orderId belongs to a **different user** | ❌ "Unauthorized access to order" | **403** |
| TC-PAY-EP-14 | `succeeded` | pending | orderId does not exist in DB | ❌ "Order not found" | **404** |

#### Decision Table – Full Payment Flow

**Conditions:**
- C1: Payment method (cod / online)
- C2: Cart empty?
- C3: Address complete (text + lat + lon)?
- C4: totalAmount > 0?
- C5: Stripe PaymentIntent creation successful?
- C6: Stripe payment status = `succeeded` (on confirm step)?

| Condition/Action | DT-PAY-01 | DT-PAY-02 | DT-PAY-03 | DT-PAY-04 | DT-PAY-05 | DT-PAY-06 |
|---|---|---|---|---|---|---|
| C1: Payment method | COD | COD | Online | Online | Online | Online |
| C2: Cart empty? | NO | YES | NO | NO | NO | NO |
| C3: Address complete? | YES | – | YES | NO | YES | YES |
| C4: totalAmount > 0? | YES | – | YES | – | NO | YES |
| C5: Stripe PI created? | N/A | N/A | – | – | N/A | YES |
| C6: Stripe status = succeeded? | N/A | N/A | N/A | N/A | N/A | YES |
| **Expected Action** | ✅ Order created (pending payment) | ❌ "Cart is empty" | ❌ "Send Complete Delivery Address" | ❌ "Send Complete Delivery Address" | ❌ "Invalid amount" | ✅ Order confirmed, paid, owner notified |
| **HTTP** | 201 | 400 | 400 | 400 | 400 | 200 |

#### Full Decision Table Test Cases

| Test Case ID | Method | Cart | Address | Amount | Stripe PI | Stripe Confirm | Expected Outcome | HTTP |
|---|---|---|---|---|---|---|---|---|
| TC-PAY-DT-01 | **COD** | ✅ 2 items | ✅ complete | ₹340 | N/A | N/A | Order created immediately, `payment.status: pending`, Shop owner gets Socket `newOrder` event | **201** |
| TC-PAY-DT-02 | **COD** | ❌ empty | – | – | N/A | N/A | "Cart is empty" | **400** |
| TC-PAY-DT-03 | **Online** | ✅ 2 items | ❌ no text | ₹340 | N/A | N/A | "Send Complete Delivery Address" | **400** |
| TC-PAY-DT-04 | **Online** | ✅ 2 items | ❌ lat missing | ₹340 | N/A | N/A | "Send Complete Delivery Address" | **400** |
| TC-PAY-DT-05 | **Online** | ✅ 2 items | ✅ complete | **₹0** | N/A | N/A | "Invalid amount" | **400** |
| TC-PAY-DT-06 | **Online** | ✅ 2 items | ✅ complete | ₹540 | ✅ created | – | clientSecret + orderId returned to frontend; order in DB with `payment.status: pending` | **200** |
| TC-PAY-DT-07 | **Online** | ✅ 2 items | ✅ complete | ₹540 | ❌ Stripe API error | – | Order deleted from DB; "Failed to create payment" | **400** |
| TC-PAY-DT-08 | **Online** | ✅ 2 items | ✅ complete | ₹540 | ✅ created | ✅ succeeded | `payment.status→paid`, email sent, socket `newOrder` to all shop owners in order | **200** |
| TC-PAY-DT-09 | **Online** | ✅ 2 items | ✅ complete | ₹540 | ✅ created | ❌ declined | "Payment verification failed"; order stays pending | **400** |
| TC-PAY-DT-10 | **Online** | ✅ 2 items | ✅ complete | ₹540 | ✅ created | ✅ succeeded (2nd call, already paid) | "Payment already confirmed" — idempotent | **200** |

#### Stripe Payment Flow Diagram

```
Customer Checkout
      │
      ├─(COD)──────────────────────────────────► POST /api/order/place-order
      │                                                │
      │                                         201: Order created
      │                                         payment.status = "pending"
      │                                                │
      │                                         Socket → Shop Owner
      │
      └─(Online)───────────────────────────────► POST /api/payment/initiate
                                                       │
                                              Validates: cart, address, amount
                                                       │
                                              Creates Order (payment.status=pending)
                                                       │
                                              Stripe: createPaymentIntent
                                                       │
                                          ┌── Stripe fails ──► Delete order → 400
                                          │
                                          └── Stripe OK ──► Returns clientSecret
                                                       │
                                               [StripePaymentForm]
                                              Card details → Stripe
                                                       │
                                         ┌── Card declined ──► POST /confirm → 400
                                         │
                                         └── Card OK ──────► POST /api/payment/confirm/:orderId
                                                                    │
                                                           verifyPaymentStatus(intentId)
                                                                    │
                                                        payment.status → "paid"
                                                        Socket: newOrder → all owners
                                                        Email: confirmation to customer
                                                                    │
                                                                 200 ✅
```

---

## 10. Technique Comparison & Justification

### 10.1 Comparison of Selected Techniques

| Technique | Best For | Limitation | Used For |
|---|---|---|---|
| **Decision Table** | Multiple concurrent boolean/enum conditions; combinatorial logic | Can explode in size with >5 conditions (2^n combinations) | Order Placement, Dietary Filtering |
| **Boundary Value Analysis (BVA)** | Numeric ranges with defined min/max; detects off-by-one errors | Does not cover logical combinations well; only numeric ranges | Rating Value (1–5), Delivery Fee (₹500 threshold) |
| **Equivalence Partitioning (EP)** | Reducing test cases by grouping equivalent inputs; large input domains | Does not verify boundary precision; misses edge values | Recommendation Engine, Dietary Preferences |
| **State Transition Testing** | Features with state machines (e.g., order status flow) | Requires complete state diagram; complex to maintain | Could be used for Order Status (pending→preparing→out of delivery→delivered) |
| **Use Case Testing** | End-to-end scenario validation; user journey covering multiple features | Coarse-grained; misses edge conditions within individual features | Could test: User browses→adds to cart→checks out→receives order |
| **Error Guessing** | Exploratory testing; finding bugs through experience | Subjective; not systematic | Could supplement any feature |

### 10.2 Justification for Each Chosen Technique

#### Feature 1 (Order Placement) → Decision Table
The `placeOrder` function validates **4 independent conditions simultaneously**: cart emptiness, address text, coordinate validity, and payment method. Each condition can be TRUE or FALSE independently, producing different error messages or success paths. Decision tables excel at ensuring **all combinations** of these conditions are covered, preventing cases where two simultaneous failures mask each other. Alternative techniques like BVA would miss the combinatorial interactions; EP cannot capture boolean combinations efficiently.

#### Feature 2 (Rating & Review) → Boundary Value Analysis
The rating field has a **hard numeric constraint**: `if (!rating || rating < 1 || rating > 5)`. This is a textbook BVA scenario. Historical data shows that off-by-one bugs (accepting 0 or 6) are among the most common defects in range validation. BVA systematically probes 0, 1, 5, 6 to expose these. EP alone would only test "valid range" (1–5) and "invalid range" without pinpointing where the boundary fails. Decision tables are unnecessary as there is only one primary input variable.

#### Feature 3 (Delivery Fee) → Boundary Value Analysis
The rule `totalAmount > 500 ? 0 : 40` is a **single critical business threshold**. BVA directly targets this: testing ₹499, ₹500, and ₹501 exposes whether the strict `>` operator is correct versus `>=`. This is financially critical — a `>=` bug at ₹500 would grant free delivery when ₹40 should be charged. No other technique focuses as precisely on numeric boundary accuracy. EP would only confirm "above 500 gives free delivery" without verifying the exact cut-off.

#### Feature 4 (Recommendation Engine) → Equivalence Partitioning
The engine's inputs are **multi-dimensional user profile attributes** with large domains (17+ allergen types, 19+ dietary types, dozens of categories). Testing every combination is impractical. EP reduces this to representative classes: "no history" vs "has history", "no allergens" vs "single allergen" vs "multiple allergens". Each class is expected to produce the same type of scoring behavior. Decision tables would require an exponential number of columns. BVA is inapplicable since the inputs are categorical, not numeric.

#### Feature 5 (Dietary Filtering) → EP + Decision Table
This feature mixes two concerns: (a) **categorical equivalence classes** for preference types (EP captures these), and (b) **multi-condition boolean filter logic** (veg pref AND allergen overlap → exclude). The Decision Table precisely maps filter condition combinations to inclusion/exclusion outcomes, eliminating ambiguity about what happens when veg preference AND allergen filter fire simultaneously. Using only EP would miss the interaction between dietary type and allergen filters.

#### Feature 6 (Owner: Add Food Item) → EP + BVA
The `addItem` function accepts **8 distinct fields** spanning large categorical enums (12 categories, 19 diet types, 17 allergens, 11 tags) plus a numeric `price` field with a schema minimum. EP is ideal for the categorical inputs: it reduces the 12 category values to three classes (valid, invalid-enum, missing) without needing to test all 12 individually. BVA is essential for `price` specifically because the `min: 0` schema constraint creates a boundary — testing –1, 0, and 1 will expose any off-by-one in validation. A Decision Table captures the mandatory-field completeness combinations. Using only EP or only BVA would leave gaps: EP alone misses the price boundary precision; BVA alone cannot address the categorical enum classes efficiently.

#### Feature 7 (Rider OTP Delivery Confirmation) → BVA + Decision Table
The OTP is a **4-digit code with a fixed numeric range [1000–9999]** and a **hard expiry at exactly 5 minutes** — both are classic BVA targets. Off-by-one errors at the boundaries (e.g., accepting an OTP at exactly minute 5:00 vs. 5:01) are high-probability defects. The Decision Table on the `acceptOrder` side captures the multi-condition rider eligibility check (assignment state × rider busy state). Using EP alone for OTP would miss the expiry boundary precision; using BVA alone would miss the combinatorial acceptance conditions.

#### Feature 8 (Payment Process) → EP + Decision Table
The Stripe payment flow has two distinct input dimensions: **(a) amount partitions** (below minimum, at minimum, normal, large) best covered by EP since all values above 50 paisa behave identically from the business rules perspective, and **(b) multi-condition payment workflow** (method × validation × Stripe outcome) best captured by a Decision Table. Pure BVA on the amount would generate excessive test cases for values far from the Stripe 50-paisa minimum. Decision tables ensure the three-step flow (initiate → frontend confirm → backend confirm) covers all success/failure combinations systematically.

---

## 11. Testing Level Analysis

### 11.1 At Which Testing Level is Black-Box Testing Applied?

Black-box testing is applied at **multiple testing levels**, but is most prominently used at:

| Testing Level | Black-Box Applicability | Application in FoodVerse |
|---|---|---|
| **Unit Testing** | Less common; usually white-box. BB can be used for individual pure functions | Testing `deliveryFee` calculation function in isolation without knowing its implementation |
| **Integration Testing** | Moderate; tests interfaces between components | Testing that `placeOrder` controller correctly interacts with `Order` model, `Shop` model, and Socket.IO notification without inspecting internals |
| **System Testing** | **Primary level** – entire application tested as a black box against requirements | Testing all 5 features end-to-end via REST API and React UI |
| **Acceptance Testing (UAT)** | **Primary level** – stakeholders validate against business requirements | Verifying that "orders above ₹500 get free delivery" matches business specification |

### 11.2 Why Black-Box Testing is Suitable at System and Acceptance Testing Levels

#### At System Testing Level:
1. **Implementation Independence:** Testers validate the system against its **specification** without needing access to or knowledge of the Node.js/React source code. The REST API contract (e.g., `POST /api/order/place-order` returns 400 for empty cart) is the specification.

2. **Complete Feature Validation:** System testing covers **end-to-end flows**: a user adds to cart in React → CartPage.jsx → Redux store → CheckOut.jsx → Axios POST → Express controller → MongoDB → Socket.IO notification. Black-box testing treats this as a single unit, verifying that inputs (user actions) produce correct outputs (order created, owner notified).

3. **Uncovers Integration Defects:** Features like the delivery fee calculation span the frontend (CheckOut.jsx) and backend (order.controllers.js). A black-box test at system level catches mismatches between UI display and backend computation.

4. **Aligns with Real User Behavior:** Users interact with the application as a black box. System-level BB tests mirror actual usage patterns.

#### At Acceptance Testing Level:
1. **Business Rules Verified as-is:** Business stakeholders can validate rules like "free delivery above ₹500" or "rating must be 1–5" directly from test tables without engineering knowledge.

2. **Non-Technical Tester Friendly:** Decision tables and BVA test cases (TC-DF-06: put ₹500 in cart → expect ₹40 delivery fee) can be executed by product owners using the live application UI.

3. **Regulatory/Compliance Validation:** For allergen filtering (Feature 5), the Dietary filter blackbox tests act as compliance evidence that the system correctly excludes allergen-containing items — critical for food safety regulations.

#### Why Black-Box is MORE Suitable than White-Box at These Levels:
- White-box (structural) testing requires access to source code and is typically limited to unit/integration levels by developers.
- At system level, **no single tester can hold the entire FoodVerse codebase** (10+ controllers, 6+ models, 20+ React pages) in their head. Black-box abstracts this complexity.
- Black-box tests remain **valid even after internal refactoring**: if `order.controllers.js` is rewritten, TC-OP-01 (empty cart → 400) still applies unchanged.

---

## 12. Feature-wise Test Summary Report

### Feature 1 – Order Placement & Validation

| Metric | Value |
|---|---|
| Technique | Decision Table Testing |
| Total Test Cases | 10 |
| Valid (Happy Path) TCs | 2 (TC-OP-07, TC-OP-08) |
| Invalid / Error Path TCs | 8 |
| Conditions Covered | 4 (cart, address, coordinates, payment method) |
| Combinations tested | All 8 distinct condition combinations + 2 edge cases |
| Critical Risk | TC-OP-01 (empty cart), TC-OP-02 (no address) – most likely user errors |
| Key Boundary | Cart ≥ 1 item, coordinates not null, address not empty |

### Feature 2 – Food Item Rating & Review

| Metric | Value |
|---|---|
| Technique | Boundary Value Analysis |
| Total Test Cases | 14 (incl. 3 average calculation tests) |
| Boundary Points Tested | 0, 1, 2, 3, 4, 5, 6 (all 7 BVA points for rating range) |
| Average Recalculation Tests | 3 (first rating, second rating, updated rating) |
| Authorization Tests | 2 (TC-RT-12 wrong item, TC-RT-13 wrong user) |
| Critical Defect Risk | Off-by-one: accepting rating=0 or rating=6 |
| Key Boundary | rating ∈ [1, 5] strict integer |

### Feature 3 – Cart Total & Delivery Fee Calculation

| Metric | Value |
|---|---|
| Technique | Boundary Value Analysis |
| Total Test Cases | 13 |
| Boundary Values Tested | ₹0, ₹1, ₹499, ₹500, ₹501, ₹5000, ₹-50, ₹499.99, ₹500.01 |
| Financial Risk TC | TC-DF-06 (₹500 exact – must charge ₹40, not free) |
| Critical Defect Risk | Wrong operator (`>=` vs `>`) at the ₹500 threshold |
| Business Impact | Incorrect free-delivery triggers → revenue loss |
| Key Boundary | `totalAmount > 500` (strict), not `>= 500` |

### Feature 4 – Personalized Recommendation Engine

| Metric | Value |
|---|---|
| Technique | Equivalence Partitioning |
| Total Test Cases | 12 |
| EP Dimensions | 4 (order history, dietary preference, allergens, favourite categories) |
| Partitions per Dimension | 2 (order history), 4 (dietary pref), 4 (allergens), 2 (favourite cats) |
| Scoring Bonuses Covered | OrderHistory (+20), Category (+15), Trending (+15), Rating (+10), Dietary (+10), Tag (+5) |
| Safety Filter TCs | 5 (allergen exclusion tests TC-REC-05 to TC-REC-09) |
| Edge Case | TC-REC-07 (all items excluded → empty results) |
| Critical Risk | Allergen filter failure → health/safety hazard for users with food allergies |

### Feature 5 – Dietary Preferences & Allergen Filtering

| Metric | Value |
|---|---|
| Techniques | Equivalence Partitioning + Decision Table |
| EP Test Cases | 5 |
| Decision Table Test Cases | 10 |
| **Total Test Cases** | **15** |
| Conditions in Decision Table | 5 (pref set, veg, halal, allergen set, item-allergen overlap) |
| Action Combinations | 4 actions (veg filter, halal filter, allergen filter, include/exclude) |
| Critical Risk | TC-DT-08: veg item with user allergen must be EXCLUDED (allergen takes priority over veg match) |
| Compliance Relevance | Allergen filtering TCs serve as food safety compliance evidence |

---

### Feature 6 – Owner: Add Food Item

| Metric | Value |
|---|---|
| Perspective | **Shop Owner** |
| Techniques | Equivalence Partitioning + Boundary Value Analysis + Decision Table |
| EP Test Cases | 15 (TC-AI-01 to TC-AI-15) |
| BVA Price TCs | 8 (TC-AI-PR-01 to TC-AI-PR-08) |
| Decision Table TCs | 6 (DT-AI-01 to DT-AI-06) |
| **Total Test Cases** | **29** |
| EP Dimensions Covered | Name (5 classes), Category (4), FoodType (4), DietType (5), Image (5), Shop existence (2) |
| BVA Boundary Points | price: –1, 0, 1, 150, 99999, "abc", null, 0.5 |
| Critical Risk | TC-AI-08: owner without a shop gets a clear error; TC-AI-06/07: missing/invalid image handled |
| Happy Path | TC-AI-01: all valid fields → item created, shop object returned with new item linked |
| Key Business Rule | Image is mandatory; `name`, `category`, `price`, `foodType` are all required; shop must exist first |

### Feature 7 – Rider: Accept Order & OTP Delivery Confirmation

| Metric | Value |
|---|---|
| Perspective | **Delivery Boy (Rider)** |
| Techniques | Boundary Value Analysis (OTP range + expiry) + Decision Table (accept eligibility) |
| OTP BVA Test Cases | 13 (TC-OTP-01 to TC-OTP-13) |
| Accept Order Decision Table TCs | 7 (TC-AO-01 to TC-AO-07) |
| **Total Test Cases** | **20** |
| OTP Boundary Points | 1000 (min), 9999 (max), expiry boundary at exactly 300,000 ms (5 min) |
| Critical Expiry TCs | TC-OTP-06 (4:59 — valid), TC-OTP-07 (5:00 — expired), TC-OTP-08 (5:01 — expired) |
| Critical Accept TCs | TC-AO-03 (already-busy rider cannot double-accept), TC-AO-02 (expired assignment rejected) |
| End-to-End Happy Path | TC-AO-07: accept → OTP sent → OTP verified → delivered → assignment completed |
| Security Concern | TC-AO-05: rider not in `brodcastedTo` list can still call `acceptOrder` — potential auth gap |

### Feature 8 – Payment Process: Stripe Online & COD

| Metric | Value |
|---|---|
| Perspective | **Customer (User)** |
| Techniques | Equivalence Partitioning + Decision Table |
| EP Amount TCs | 8 (TC-PAY-EP-01 to TC-PAY-EP-08) |
| EP Payment Status TCs | 6 (TC-PAY-EP-09 to TC-PAY-EP-14) |
| Decision Table TCs | 10 (TC-PAY-DT-01 to TC-PAY-DT-10) |
| **Total Test Cases** | **24** |
| Stripe Minimum Boundary | ₹0.50 (50 paisa) — TC-PAY-EP-02 (49 paisa, invalid) vs TC-PAY-EP-03 (50 paisa, valid) |
| Idempotency TC | TC-PAY-DT-10 / TC-PAY-EP-12: duplicate confirm returns "already confirmed" safely |
| COD Happy Path | TC-PAY-DT-01: immediate order creation, no Stripe, socket to owner |
| Stripe Failure Safety | TC-PAY-DT-07: PI creation fails → order deleted from DB (no orphan orders) |
| Critical Risk | TC-PAY-EP-09: payment must transition to "paid" AND trigger owner notification + confirmation email |

### Overall Test Summary

| Feature | Perspective | Technique | # Test Cases | Risk Level |
|---|---|---|---|---|
| 1. Order Placement | Customer | Decision Table | 10 | 🔴 HIGH – core business flow |
| 2. Item Rating & Review | Customer | BVA | 14 | 🟡 MEDIUM – data integrity |
| 3. Delivery Fee Calculation | Customer | BVA | 13 | 🔴 HIGH – direct financial impact |
| 4. Recommendation Engine | Customer | Equivalence Partitioning | 12 | 🟡 MEDIUM – personalization quality |
| 5. Dietary & Allergen Filter | Customer | EP + Decision Table | 15 | 🔴 HIGH – food safety / health risk |
| 6. Add Food Item (Owner) | **Owner** | EP + BVA + Decision Table | 29 | 🟡 MEDIUM – menu data integrity |
| 7. Accept Order & OTP Delivery | **Rider** | BVA + Decision Table | 20 | 🔴 HIGH – delivery security & fraud |
| 8. Payment Process (Stripe+COD) | Customer | EP + Decision Table | 24 | 🔴 HIGH – financial transaction integrity |
| **TOTAL** | **All Roles** | **Mixed** | **137** | – |

---

## Appendix A – Traceability Matrix

| Test Case ID | Source File | Function / Logic | Technique |
|---|---|---|---|
| TC-OP-01 to TC-OP-10 | `order.controllers.js` | `placeOrder()` | Decision Table |
| TC-RT-01 to TC-RT-14 | `rating.controllers.js` | `addRating()` | BVA |
| TC-DF-01 to TC-DF-13 | `CheckOut.jsx` | `deliveryFee` calculation | BVA |
| TC-REC-01 to TC-REC-12 | `recommendation.controllers.js` | `getRecommendations()` | EP |
| TC-DT-01 to TC-DT-10 + TC-DF-EP-01 to TC-DF-EP-05 | `recommendation.controllers.js` | Allergen + dietary query filter | EP + Decision Table |
| TC-AI-01 to TC-AI-15 + TC-AI-PR-01 to TC-AI-PR-08 + DT-AI-01 to DT-AI-06 | `item.controllers.js`, `AddItem.jsx`, `item.model.js` | `addItem()` — owner food item creation | EP + BVA + Decision Table |
| TC-OTP-01 to TC-OTP-13 | `order.controllers.js` | `sendDeliveryOtp()`, `verifyDeliveryOtp()` | BVA |
| TC-AO-01 to TC-AO-07 | `order.controllers.js`, `assignDeliveryBoy.controllers.js` | `acceptOrder()` — rider eligibility | Decision Table |
| TC-PAY-EP-01 to TC-PAY-EP-14 | `order.controllers.js`, `utils/stripe.js` | `initiateStripePayment()`, `confirmStripePayment()`, `createPaymentIntent()` | Equivalence Partitioning |
| TC-PAY-DT-01 to TC-PAY-DT-10 | `order.controllers.js`, `CheckOut.jsx`, `StripePaymentForm.jsx` | Full payment workflow (COD + Stripe) | Decision Table |

---

## Appendix B – Defect Risk Summary

| Defect Type | Affected Feature | Potential Impact |
|---|---|---|
| Off-by-one in rating validator (`<1` instead of `<=0`) | Feature 2 | Accepts 0-star ratings; corrupts item averages |
| Wrong delivery threshold operator (`>=` instead of `>`) | Feature 3 | Revenue loss on ₹500 exact orders |
| Allergen exclusion `$nin` query missing | Feature 4 & 5 | Health hazard – allergic users see unsafe food |
| Cart emptiness not checked before payment intent | Feature 1 | Unnecessary Stripe API calls; UX confusion |
| Duplicate rating not detected (missing `findOne` check) | Feature 2 | Item average inflated by duplicate votes |
| Missing shop check allows item creation without a shop | Feature 6 | Item references non-existent shop — orphan item in DB |
| Negative price accepted (schema min: 0 not enforced at controller) | Feature 6 | Items with negative prices visible to customers |
| Invalid category enum not caught before DB insert | Feature 6 | Mongoose cast error returns 500 instead of clean 400 |
| OTP accepted at exact 5:00 expiry moment (boundary) | Feature 7 | Expired OTP passes if clock comparison is `<=` instead of `<` |
| Rider not in `brodcastedTo` list can call `acceptOrder` | Feature 7 | Unauthorised rider can hijack any broadcasted delivery assignment |
| Stripe PI creation failure does not delete order | Feature 8 | Orphan orders with `payment.status: pending` accumulate in DB |
| Duplicate `confirmStripePayment` call re-triggers owner `newOrder` socket event | Feature 8 | Owner receives duplicate notifications; double-processing risk |
