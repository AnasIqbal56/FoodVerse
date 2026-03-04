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
7. [Technique Comparison & Justification](#7-technique-comparison--justification)
8. [Testing Level Analysis](#8-testing-level-analysis)
9. [Feature-wise Test Summary Report](#9-feature-wise-test-summary-report)

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
- Geographic coordinates (lat/lon) must be present
- Payment method must be `cod` or `online`

**Source:** `backend/controllers/order.controllers.js` → `placeOrder()`, `frontend/src/pages/CheckOut.jsx` → `handlePlaceOrder()`

### Technique: Decision Table Testing

A decision table is used when the output depends on **combinations of conditions** rather than a single variable. `placeOrder` has 4 independent boolean conditions producing different outcomes.

#### Decision Table

| Condition | TC-OP-01 | TC-OP-02 | TC-OP-03 | TC-OP-04 | TC-OP-05 | TC-OP-06 | TC-OP-07 | TC-OP-08 |
|-----------|----------|----------|----------|----------|----------|----------|----------|----------|
| Cart has items? | NO | YES | YES | YES | YES | YES | YES | YES |
| Address text provided? | – | NO | YES | YES | YES | YES | YES | YES |
| Coordinates (lat/lon) valid? | – | – | NO | YES | YES | YES | YES | YES |
| Payment method valid? | – | – | – | NO | YES (cod) | YES (online) | YES (cod) | YES (online) |
| Total Amount > 0? | – | – | – | – | NO | NO | YES | YES |
| **Expected Output** | 400: Cart empty | Alert: No address | Alert: No location | 400: Bad Request | 400: Invalid amount | 400: Invalid amount | **201: Order placed (COD)** | **201: Order placed (Online→Stripe)** |

#### Test Case Table

| Test Case ID | Description | Input Data | Expected Output | Expected HTTP Status |
|---|---|---|---|---|
| TC-OP-01 | Empty cart order attempt | `cartItems: []`, valid address, valid coordinates, `paymentMethod: cod` | "Your cart is empty" alert; order NOT created | 400 |
| TC-OP-02 | Missing delivery address | 2 cart items, `addressInput: ""`, valid lat/lon, `paymentMethod: cod` | "Please enter a delivery address" alert; order NOT created | 400 |
| TC-OP-03 | Missing geographic coordinates | 2 cart items, address text present, `lat: null`, `lon: null` | "Please select a valid delivery location" alert | 400 |
| TC-OP-04 | Invalid payment method | 2 cart items, valid address, valid lat/lon, `paymentMethod: "crypto"` | Order rejected – enum validation error | 500/400 |
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

## 7. Technique Comparison & Justification

### 7.1 Comparison of Selected Techniques

| Technique | Best For | Limitation | Used For |
|---|---|---|---|
| **Decision Table** | Multiple concurrent boolean/enum conditions; combinatorial logic | Can explode in size with >5 conditions (2^n combinations) | Order Placement, Dietary Filtering |
| **Boundary Value Analysis (BVA)** | Numeric ranges with defined min/max; detects off-by-one errors | Does not cover logical combinations well; only numeric ranges | Rating Value (1–5), Delivery Fee (₹500 threshold) |
| **Equivalence Partitioning (EP)** | Reducing test cases by grouping equivalent inputs; large input domains | Does not verify boundary precision; misses edge values | Recommendation Engine, Dietary Preferences |
| **State Transition Testing** | Features with state machines (e.g., order status flow) | Requires complete state diagram; complex to maintain | Could be used for Order Status (pending→preparing→out of delivery→delivered) |
| **Use Case Testing** | End-to-end scenario validation; user journey covering multiple features | Coarse-grained; misses edge conditions within individual features | Could test: User browses→adds to cart→checks out→receives order |
| **Error Guessing** | Exploratory testing; finding bugs through experience | Subjective; not systematic | Could supplement any feature |

### 7.2 Justification for Each Chosen Technique

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

---

## 8. Testing Level Analysis

### 8.1 At Which Testing Level is Black-Box Testing Applied?

Black-box testing is applied at **multiple testing levels**, but is most prominently used at:

| Testing Level | Black-Box Applicability | Application in FoodVerse |
|---|---|---|
| **Unit Testing** | Less common; usually white-box. BB can be used for individual pure functions | Testing `deliveryFee` calculation function in isolation without knowing its implementation |
| **Integration Testing** | Moderate; tests interfaces between components | Testing that `placeOrder` controller correctly interacts with `Order` model, `Shop` model, and Socket.IO notification without inspecting internals |
| **System Testing** | **Primary level** – entire application tested as a black box against requirements | Testing all 5 features end-to-end via REST API and React UI |
| **Acceptance Testing (UAT)** | **Primary level** – stakeholders validate against business requirements | Verifying that "orders above ₹500 get free delivery" matches business specification |

### 8.2 Why Black-Box Testing is Suitable at System and Acceptance Testing Levels

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

## 9. Feature-wise Test Summary Report

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

### Overall Test Summary

| Feature | Technique | # Test Cases | Risk Level |
|---|---|---|---|
| 1. Order Placement | Decision Table | 10 | 🔴 HIGH – core business flow |
| 2. Item Rating & Review | BVA | 14 | 🟡 MEDIUM – data integrity |
| 3. Delivery Fee Calculation | BVA | 13 | 🔴 HIGH – direct financial impact |
| 4. Recommendation Engine | Equivalence Partitioning | 12 | 🟡 MEDIUM – personalization quality |
| 5. Dietary & Allergen Filter | EP + Decision Table | 15 | 🔴 HIGH – food safety / health risk |
| **TOTAL** | **Mixed** | **64** | – |

---

## Appendix A – Traceability Matrix

| Test Case ID | Source File | Function / Logic | Technique |
|---|---|---|---|
| TC-OP-01 to TC-OP-10 | `order.controllers.js` | `placeOrder()` | Decision Table |
| TC-RT-01 to TC-RT-14 | `rating.controllers.js` | `addRating()` | BVA |
| TC-DF-01 to TC-DF-13 | `CheckOut.jsx` | `deliveryFee` calculation | BVA |
| TC-REC-01 to TC-REC-12 | `recommendation.controllers.js` | `getRecommendations()` | EP |
| TC-DT-01 to TC-DT-10 + TC-DF-EP-01 to TC-DF-EP-05 | `recommendation.controllers.js` | Allergen + dietary query filter | EP + Decision Table |

---

## Appendix B – Defect Risk Summary

| Defect Type | Affected Feature | Potential Impact |
|---|---|---|
| Off-by-one in rating validator (`<1` instead of `<=0`) | Feature 2 | Accepts 0-star ratings; corrupts item averages |
| Wrong delivery threshold operator (`>=` instead of `>`) | Feature 3 | Revenue loss on ₹500 exact orders |
| Allergen exclusion `$nin` query missing | Feature 4 & 5 | Health hazard – allergic users see unsafe food |
| Cart emptiness not checked before payment intent | Feature 1 | Unnecessary Stripe API calls; UX confusion |
| Duplicate rating not detected (missing `findOne` check) | Feature 2 | Item average inflated by duplicate votes |
