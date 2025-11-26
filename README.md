# 🍔 FoodVerse - Food Delivery Application

A modern, full-stack food delivery application built with **React**, **Node.js**, **MongoDB**, and **Socket.io** for real-time updates. FoodVerse enables seamless ordering, tracking, and delivery management with features like payment processing, real-time notifications, and an intelligent recommendation system.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
  - [User Flow](#user-flow)
  - [Owner Flow](#owner-flow)
  - [Delivery Boy Flow](#delivery-boy-flow)
- [API Routes](#api-routes)
- [Socket Events](#socket-events)
- [File Structure](#file-structure)
- [Key Features Deep Dive](#key-features-deep-dive)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ✨ Features

### For Customers
- 🔐 User authentication (Sign up/Sign in/Forgot Password)
- 📍 Location-based shop discovery
- 🛒 Shopping cart with item management
- 💳 Multiple payment options (COD & Stripe)
- 📱 Real-time order tracking
- ⭐ Item ratings and reviews
- 🤖 AI-powered personalized recommendations (based on dietary preferences, allergies, order history)
- 📍 Real-time delivery tracking with map

### For Shop Owners
- 🏪 Shop creation and management
- 📦 Add/Edit/Delete items
- 📊 Order management dashboard
- 📈 Track order status in real-time
- 👨‍💼 Assign delivery boys to orders
- 📧 Email notifications
- 💰 View order analytics

### For Delivery Boys
- 🗺️ View available delivery orders
- 📍 Live location tracking
- ✅ Accept/complete deliveries
- 🔐 OTP verification for delivery confirmation
- 🔔 Real-time notifications for new orders
- 📞 Contact details for customers

### General Features
- 🔔 Real-time socket.io notifications
- 🌍 Geospatial queries for nearby delivery boys
- 💬 Contact/Support system
- 🎨 Beautiful and responsive UI with Tailwind CSS
- 🎯 Redux state management
- 🔒 JWT authentication
- 📸 Cloudinary image hosting

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ORM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Cloudinary** - Image hosting
- **Nodemailer** - Email service

### Frontend
- **React 19** - UI library
- **Redux Toolkit** - State management
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Leaflet/React-Leaflet** - Maps
- **Socket.io-client** - Real-time client
- **Stripe React** - Payment integration
- **Firebase** - Authentication
- **Axios** - HTTP client

---

## 🏗️ Project Architecture

```
FoodVerse/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth, file upload
│   ├── utils/           # Helper functions
│   ├── socket.js        # Real-time events
│   ├── index.js         # Server entry point
│   └── .env             # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── redux/       # State management
│   │   ├── assets/      # Images/static files
│   │   ├── App.jsx      # Root component
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── .env             # Environment variables
│
└── README.md            # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** account (or local MongoDB server) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts/API Keys
- **Stripe Account** - For payment processing - [Sign up](https://stripe.com)
- **Cloudinary Account** - For image hosting - [Sign up](https://cloudinary.com)
- **Gmail Account** - For email notifications (with app password)
- **Firebase Account** - For authentication - [Sign up](https://firebase.google.com)
- **LocationIQ API Key** - For geolocation - [Sign up](https://locationiq.com)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/AnasIqbal56/FoodVerse.git
cd FoodVerse
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Folder
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```


#### 2.3 Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev


```

Server will run on `http://localhost:8000`

---

### Step 3: Frontend Setup

#### 3.1 Open New Terminal and Navigate to Frontend
```bash
cd frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Create `.env` File
Create a `.env` file in the `frontend` folder:
```dotenv
# Firebase Configuration
VITE_FIREBASE_API_KEY="your_firebase_api_key"

# LocationIQ API Key
VITE_GEOAPIKEY="your_locationiq_api_key"
```

Already exists in the folder no need to create
#### 3.4 Get Your API Keys

**Firebase:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Go to Project Settings > Web App
4. Copy the `apiKey` value

**LocationIQ:**
1. Sign up at [LocationIQ](https://locationiq.com)
2. Get your API key from Dashboard

#### 3.5 Update Server URL (if needed)
In `frontend/src/App.jsx`, update the server URL:

```javascript
export const serverUrl = "http://localhost:8000"; // for local development


#### 3.6 Start Frontend Server
```bash
# Development mode
npm run dev

```

Frontend will run on `http://localhost:5173`
Make sure your port no 8000 and 5173 are free to use by the application
---
---

## ▶️ Running the Application

### Full Setup (Both Servers)
# make sure your connection is stable if not installation might be interrupted 
# In case of interruption again install packages by npm install # If it throws errors multiple times delete te package.json file in respective folder and again install by npm install
**Terminal 1 - Backend:**
```bash
cd backend
npm install  
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # if not already done
npm run dev
```

Then open your browser and navigate to: **`http://localhost:5173`**

### Windows PowerShell Tip
If you want to run both simultaneously in one terminal:
```powershell
# Run both servers in parallel
Start-Process powershell {cd backend; npm run dev} -NoNewWindow; Start-Process powershell {cd frontend; npm run dev} -NoNewWindow
```

---

## 🎯 How It Works

### 🧑‍💼 User Flow

1. **Registration/Login**
   - User signs up with email and password
   - Firebase authentication on frontend
   - JWT token created on backend
   - Location permissions requested

2. **Browse & Order**
   - User enters delivery address
   - Browsing shops and items in their area
   - View item details, ratings, and recommendations
   - Add items to cart
   - Proceed to checkout

3. **Payment**
   - Choose payment method (COD or Online)
   - For Online: Stripe integration for card payment
   - Order confirmation email sent

4. **Track Order**
   - Real-time order status updates via Socket.io
   - Status progression: Pending → Preparing → Out of Delivery → Delivered
   - See delivery boy location on map
   - Receive notifications at each status change

5. **Delivery & Rating**
   - Delivery boy arrives with OTP
   - OTP verification confirms delivery
   - User can rate the order and items
   - Recommendations updated based on order history

### 🏪 Owner Flow

1. **Setup Shop**
   - Owner creates/registers shop
   - Add shop details and location
   - Upload shop image

2. **Manage Items**
   - Add food items with price, description, image
   - Edit item details
   - Delete items
   - Organize items in categories

3. **Manage Orders**
   - View incoming orders in My Orders dashboard
   - See order details (items, customer, delivery address)
   - Update order status: Pending → Preparing
   - When ready, mark as "Out of Delivery"

4. **Delivery Assignment**
   - When status = "Out of Delivery":
     - System shows "Waiting for Delivery Boy to Accept"
     - Broadcasts to nearby delivery boys (5km radius)
   - When delivery boy accepts:
     - Shows delivery boy name and phone number
     - Delivery status tracked in real-time

5. **Order Completion**
   - When delivery boy verifies with OTP
   - Order status automatically updates to "Delivered"
   - Owner sees update in real-time on dashboard

### 🚴 Delivery Boy Flow

1. **Signup & Profile**
   - Register as delivery boy
   - Add phone number and bank details
   - Enable location services

2. **Go Online**
   - Login to app
   - Location automatically tracked in background
   - Shows as "online" and available

3. **Accept Orders**
   - Receives broadcast notifications for available orders
   - View orders in "Available Orders" section
   - Order shows: shop name, items count, amount, delivery address
   - Click "Accept Order" to claim the delivery

4. **Deliver**
   - Navigate to customer using map
   - Request OTP from owner
   - Verify OTP with customer
   - Mark as delivered

5. **Earnings**
   - Track completed deliveries
   - View earnings/payment

---

## 🔌 API Routes

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login

### User Routes (`/api/user`)
- `GET /current` - Get current user
- `POST /update-location` - Update user location

### Shop Routes (`/api/shop`)
- `POST /` - Create shop
- `GET /by-city/:city` - Get shops by city
- `GET /my-shop` - Get user's shop

### Item Routes (`/api/item`)
- `POST /` - Create item
- `GET /by-city/:city` - Get items by city
- `PUT /:itemId` - Update item
- `DELETE /:itemId` - Delete item

### Order Routes (`/api/order`)
- `POST /place-order` - Place new order
- `GET /my-orders` - Get user orders
- `POST /update-status/:orderId/:shopId` - Update order status
- `GET /get-assignments` - Get delivery boy assignments
- `GET /get-current-order` - Get current delivery order
- `POST /send-delivery-otp` - Send OTP to customer
- `POST /verify-delivery-otp` - Verify delivery OTP
- `GET /accept-order/:assignmentId` - Accept order assignment
- `POST /initiate-stripe-payment` - Start Stripe payment
- `POST /confirm-stripe-payment/:orderId` - Confirm Stripe payment

### Rating Routes (`/api/rating`)
- `POST /` - Add rating
- `GET /:itemId` - Get item ratings

### Recommendation Routes (`/api/recommendation`)
- `GET /user` - Get personalized recommendations

---

## 🔄 Socket Events

### Server → Client Events
- **`newAssignment`** - New delivery assignment broadcasted
- **`assignedOrder`** - Delivery boy assigned to order
- **`newOrder`** - New order placed to shop owner
- **`update-status`** - Order status updated
- **`delivery-completed`** - Order delivered via OTP

### Client → Server Events
- **`identify`** - Client sends userId and socketId for identity
- **`disconnect`** - Client disconnects

---

## 📁 File Structure

### Backend Controllers
```
controllers/
├── auth.controllers.js          # Authentication logic
├── user.controller.js           # User management
├── shop.controllers.js          # Shop operations
├── item.controllers.js          # Item management
├── order.controllers.js         # Order logic
├── assignDeliveryBoy.controllers.js  # Assignment logic
├── rating.controllers.js        # Ratings
├── recommendation.controllers.js # Recommendations
└── contact.controllers.js       # Contact messages
```

### Frontend Components
```
components/
├── Nav.jsx                      # Navigation bar
├── CartItemCard.jsx             # Cart item display
├── CategoryCard.jsx             # Category card
├── FoodCard.jsx                 # Food item card
├── OwnerOrderCard.jsx           # Owner order management
├── OwnerItemCard.jsx            # Owner item management
├── DeliveryBoy.jsx              # Delivery boy dashboard
├── UserDashboard.jsx            # User order tracking
├── StripePaymentForm.jsx        # Payment form
└── ...other components
```

---

## 🎨 Key Features Deep Dive

### Real-Time Order Tracking
- Socket.io maintains persistent connection
- Any status change instantly pushes to relevant users
- No page refresh needed
- Works across multiple browser tabs

### Geospatial Delivery
- MongoDB 2dsphere index for location queries
- Finds delivery boys within 5km radius
- Fallback to all online boys if none nearby
- Excludes busy delivery boys from assignments

### Smart Recommendations
- Tracks user order history
- Considers dietary preferences (veg, vegan, etc.)
- Avoids allergens marked by user
- Suggests based on favorite items and categories
- ML-based personalization

### Payment Processing
- **Cash on Delivery (COD)** - Payment at delivery
- **Stripe Integration** - Online card payments
- Secure payment confirmation
- Email receipts

### Location Services
- GPS tracking of delivery boy
- Live map view for customers
- Address search with LocationIQ API
- Geofencing for delivery confirmation

---

## 🐛 Troubleshooting

### Backend Won't Connect to MongoDB
**Error:** `MongooseError: connect ENOTFOUND`
- Check MongoDB connection string in `.env`
- Ensure MongoDB Atlas cluster is active
- Verify IP whitelist includes your IP
- Check internet connection

### Frontend Can't Connect to Backend
**Error:** `CORS Error` or `Connection Refused`
- Ensure backend is running on port 8000
- Check `serverUrl` in `frontend/src/App.jsx`
- Verify CORS settings in `backend/index.js`

### Socket.io Connection Issues
**Error:** `WebSocket connection failed`
- Restart both frontend and backend
- Clear browser cache (Ctrl+Shift+Del)
- Check firewall settings
- Verify Socket.io is initialized in `useSocket()` hook

### Stripe Payment Failing
**Error:** `Invalid API Key`
- Verify `STRIPE_SECRET_KEY` in `.env`
- Ensure it's the test key (starts with `sk_test_`)
- Not in production mode with test keys

### Images Not Uploading
**Error:** `Cloudinary upload failed`
- Verify Cloudinary credentials in `.env`
- Check file size (< 5MB recommended)
- Ensure image format is supported

### Location Permission Denied
**Error:** `Geolocation permission denied`
- Check browser location permissions
- Reset site permissions in browser settings
- Use HTTPS in production (required for geolocation)

### Recommendation Not Working
**Cause:** Low order history
- Recommendations improve after several orders
- Ensure dietary preferences are set
- System needs 3+ orders for good recommendations

---

## 📧 Getting App Password for Gmail

1. Go to [Google Account](https://myaccount.google.com)
2. Go to **Security** tab (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Search for **App passwords**
5. Select Mail and Windows Computer (or your setup)
6. Copy the generated 16-character password
7. Paste in `EMAIL_PASSWORD` in `.env`

---

## 🔒 Security Notes

- Never commit `.env` file (add to `.gitignore`)
- JWT secret should be strong and unique
- Use HTTPS in production
- Validate all user inputs on backend
- Stripe keys should be rotated regularly
- MongoDB connection should use strong passwords
- Enable IP whitelist on MongoDB Atlas

---


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


## 👨‍💻 Author

**Anas Iqbal**
- GitHub: [@AnasIqbal56](https://github.com/AnasIqbal56)

**Sawera Arif**
- GitHub: [@Sawera-11](https://github.com/SAWERA-11)

**Affan Ahmed**
- GitHub: [@affan-ak-khan](https://github.com/affan-ak-khan)

**Noor Afza**
- GitHub: [@Afza75](https://github.com/Afza75)
---

## 🎓 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Socket.io Guide](https://socket.io/docs/)
- [Stripe API Docs](https://stripe.com/docs/api)

---

**Last Updated:** November 2025
**Status:** ✅ Fully Functional
