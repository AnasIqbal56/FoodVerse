# Stripe Payment Integration

## Overview
Complete Stripe payment gateway integration for FoodVerse application with secure card payments.

---

## Features
✅ **Secure Card Payments** - PCI-compliant payment processing  
✅ **Payment Intent API** - Modern Stripe Payment Intents  
✅ **Automatic Payment Methods** - Supports cards and other payment methods  
✅ **Real-time Verification** - Backend payment confirmation  
✅ **Order Management** - Automatic order status updates  
✅ **Socket Notifications** - Real-time alerts to shop owners  
✅ **PKR Currency Support** - Pakistani Rupee with conversion to paisa  

---

## Stripe Test Credential

### API Keys
- **Publishable Key**: `pk_test_xxxxxxxxxxxxxxxxxxxxx` (stored in `.env`)
- **Secret Key**: `sk_test_xxxxxxxxxxxxxxxxxxxxx` (stored in `.env`)

> ⚠️ **Security Note**: Never commit actual API keys to version control. Keep them in `.env` file only.

### Test Cards
| Card Number | Description | Result |
|-------------|-------------|---------|
| `4242 4242 4242 4242` | Visa - Success | ✅ Payment succeeds |
| `4000 0000 0000 0002` | Visa - Declined | ❌ Payment declined |
| `4000 0025 0000 3155` | Visa - 3D Secure | 🔐 Requires authentication |

**Card Details for Testing:**
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## Implementation Details

### Backend Architecture

#### 1. **Environment Variables** (`backend/.env`)
```env
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxx"
```

> ⚠️ **Important**: Replace with your actual Stripe test keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

#### 2. **Stripe Utility** (`backend/utils/stripe.js`)
**Functions:**
- `createPaymentIntent(paymentData)` - Creates Stripe Payment Intent
- `retrievePaymentIntent(paymentIntentId)` - Retrieves payment details
- `verifyPaymentStatus(paymentIntentId)` - Checks if payment succeeded
- `cancelPaymentIntent(paymentIntentId)` - Cancels pending payment

**Key Features:**
- Automatic currency conversion (PKR → paisa)
- Metadata tracking (orderId, customer info)
- Receipt emails via Stripe
- Comprehensive error handling

#### 3. **Payment Controllers** (`backend/controllers/order.controllers.js`)

**a) `initiateStripePayment`**
- **Route**: `POST /api/order/initiate-stripe-payment`
- **Auth**: Required (`isAuth` middleware)
- **Purpose**: Create order and payment intent

**Request Body:**
```json
{
  "cartItems": [...],
  "deliveryAddress": {
    "text": "123 Main St",
    "latitude": 24.8607,
    "longitude": 67.0011
  },
  "totalAmount": 1500
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "orderId": "order_id_here",
  "publishableKey": "pk_test_xxx"
}
```

**b) `confirmStripePayment`**
- **Route**: `POST /api/order/confirm-stripe-payment/:orderId`
- **Auth**: Required (`isAuth` middleware)
- **Purpose**: Verify payment and update order status

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "order": { /* populated order object */ }
}
```

#### 4. **Routes** (`backend/routes/order.routes.js`)
```javascript
// Stripe payment routes
orderRouter.post("/initiate-stripe-payment", isAuth, initiateStripePayment);
orderRouter.post("/confirm-stripe-payment/:orderId", isAuth, confirmStripePayment);
```

---

### Frontend Architecture

#### 1. **Stripe React Components**

**a) `StripePaymentForm.jsx`**
- Renders Stripe Payment Element
- Handles card input validation
- Confirms payment with Stripe
- Displays test card information
- Error handling and loading states

**Props:**
- `orderId` - Order ID for reference
- `onSuccess(paymentIntent)` - Callback on successful payment
- `onError(error)` - Callback on payment failure

#### 2. **CheckOut Page Integration** (`frontend/src/pages/CheckOut.jsx`)

**Key Features:**
- Payment method selection (COD / Online)
- Dynamic Stripe form display
- Payment Intent initialization
- Payment confirmation flow
- Cart clearing on success
- Redirect to order-placed page

**Payment Flow:**
1. User selects "Online Payment"
2. Clicks "Continue to Payment"
3. API call to `initiate-stripe-payment`
4. Stripe form appears with Payment Element
5. User enters card details
6. Form submits to Stripe
7. On success, backend confirms payment
8. Order status updated to "paid"
9. Cart cleared, redirect to success page

**State Management:**
```javascript
const [showStripeForm, setShowStripeForm] = useState(false);
const [stripePromise, setStripePromise] = useState(null);
const [clientSecret, setClientSecret] = useState(null);
const [currentOrderId, setCurrentOrderId] = useState(null);
```

---

## Payment Flow Diagram

```
┌──────────────┐
│   User       │
│  Checkout    │
└──────┬───────┘
       │ 1. Select Online Payment
       ▼
┌──────────────┐
│   Frontend   │ 2. POST /initiate-stripe-payment
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │ 3. Create Order (status: pending)
│              │ 4. Create Payment Intent
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Stripe     │ 5. Return clientSecret
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Frontend   │ 6. Show Stripe Form
│              │ 7. User enters card details
└──────┬───────┘
       │ 8. Submit payment
       ▼
┌──────────────┐
│   Stripe     │ 9. Process payment
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Frontend   │ 10. Payment successful
│              │ 11. POST /confirm-stripe-payment
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │ 12. Verify with Stripe
│              │ 13. Update order: status = 'paid'
│              │ 14. Send notifications to shop owners
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Frontend   │ 15. Clear cart
│              │ 16. Navigate to /order-placed
└──────────────┘
```

---

## Database Schema Updates

### Order Model - Payment Object
```javascript
payment: {
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paidAt: Date,
  transactionId: String, // Stores Stripe Payment Intent ID
}
```

---

## Testing Guide

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Test Payment Flow

**Test Scenario 1: Successful Payment**
1. Add items to cart
2. Go to checkout
3. Enter delivery address
4. Select "Online Payment"
5. Click "Continue to Payment"
6. Enter test card: `4242 4242 4242 4242`
7. Expiry: `12/25`, CVC: `123`
8. Click "Pay Now"
9. ✅ Should redirect to order-placed page

**Test Scenario 2: Declined Payment**
1. Follow steps 1-5 above
2. Enter test card: `4000 0000 0000 0002`
3. Click "Pay Now"
4. ❌ Should show error: "Your card was declined"

**Test Scenario 3: COD Payment**
1. Add items to cart
2. Go to checkout
3. Select "Cash on Delivery"
4. Click "Place Order"
5. ✅ Should work normally (unchanged)

---

## Security Features

✅ **PCI Compliance** - Card data never touches your servers  
✅ **HTTPS Required** - Secure data transmission  
✅ **Payment Intent API** - Strong Customer Authentication (SCA) ready  
✅ **Server-side Verification** - Backend confirms payment status  
✅ **Auth Middleware** - User authentication required  
✅ **Transaction IDs** - Full payment tracking  

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Amount must be at least 50` | Total < 0.50 PKR | Increase minimum order amount |
| `Your card was declined` | Test card for decline used | Use `4242 4242 4242 4242` |
| `Payment verification failed` | Network issue during confirm | Contact support with payment ID |
| `Failed to create payment` | Stripe API error | Check API keys in .env |

### Error Messages
- **Frontend**: User-friendly alerts with actionable messages
- **Backend**: Detailed console logs for debugging
- **Payment ID Tracking**: Users get payment ID for support queries

---

## Stripe Dashboard

### Accessing Test Mode
1. Login to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle "Test Mode" in top-right
3. View payments at: **Payments** → **All Payments**

### What to Monitor
- ✅ **Successful Payments** - Status: `succeeded`
- ❌ **Failed Payments** - Status: `failed` or `requires_payment_method`
- 📊 **Payment Amounts** - Verify correct totals (in paisa)
- 📧 **Receipt Emails** - Check if sent to customers

---

## Currency Configuration

**Default**: Pakistani Rupee (PKR)

### Change to USD
**Backend** (`backend/utils/stripe.js`):
```javascript
// Line 78
currency: 'usd', // Change from 'pkr' to 'usd'
```

**Note**: Amount is automatically converted to smallest unit (cents for USD, paisa for PKR)

---

## Production Deployment Checklist

### Before Going Live

- [ ] Replace test API keys with live keys in `.env`
- [ ] Update `STRIPE_SECRET_KEY` with live secret key
- [ ] Update `STRIPE_PUBLISHABLE_KEY` with live publishable key
- [ ] Remove test card hints from UI
- [ ] Enable Stripe webhooks for payment events
- [ ] Test with real cards (small amounts)
- [ ] Verify receipt emails are sent
- [ ] Set up payment failure notifications
- [ ] Configure refund policies in Stripe Dashboard
- [ ] Enable 3D Secure for international cards

### Live Keys Location
Stripe Dashboard → **Developers** → **API keys** → Toggle "Test Mode" OFF

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/order/initiate-stripe-payment` | ✅ | Create payment intent |
| POST | `/api/order/confirm-stripe-payment/:orderId` | ✅ | Verify and confirm payment |

---

## Package Dependencies

### Backend
```json
{
  "stripe": "^latest"
}
```

### Frontend
```json
{
  "@stripe/stripe-js": "^8.5.2",
  "@stripe/react-stripe-js": "^5.4.0"
}
```

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing
- **Payment Intents Guide**: https://stripe.com/docs/payments/payment-intents
- **React Integration**: https://stripe.com/docs/stripe-js/react

---

## Troubleshooting

### Payment Intent Not Creating
**Check:**
1. Stripe secret key is correct in `.env`
2. Backend server is running
3. User is authenticated
4. Cart has items
5. Total amount > 0.50 PKR

### Stripe Form Not Showing
**Check:**
1. Publishable key returned from API
2. `clientSecret` is not null
3. `@stripe/react-stripe-js` is installed
4. No console errors in browser

### Payment Succeeds but Order Not Updating
**Check:**
1. `confirmStripePayment` endpoint is called
2. `paymentIntentId` is passed correctly
3. User is authenticated
4. Order exists in database

---

## Next Steps

1. ✅ Test all payment scenarios
2. ✅ Verify email receipts work
3. ✅ Test order confirmation with shop owners
4. ✅ Check real-time socket notifications
5. ✅ Verify cart clearing after payment
6. ⚠️ Set up webhook for payment.succeeded events (optional)
7. ⚠️ Implement refund functionality (future enhancement)

---

**Integration completed successfully!** 🎉

All Stripe payment functionality is now live and ready for testing.
