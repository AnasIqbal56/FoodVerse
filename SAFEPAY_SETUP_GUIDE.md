# Safepay Payment Gateway Integration Guide

## Overview
Your FoodVerse application now has complete Safepay sandbox integration that will show real transactions on your Safepay dashboard.

## What Has Been Implemented

### 1. Backend Changes

#### Order Model (`backend/models/order.model.js`)
- Added `online` to payment methods
- Added payment tracking fields:
  - `payment.safepayToken`: Unique token from Safepay
  - `payment.safepayTracker`: Tracker ID for the payment
  - `payment.status`: Payment status (pending/paid/failed)
  - `payment.paidAt`: Timestamp when payment was completed
  - `payment.transactionId`: Safepay transaction reference

#### Safepay Utility (`backend/utils/safepay.js`)
- Updated to use environment variables for deployed URLs
- Uses `FRONTEND_URL` for redirect and cancel URLs
- Uses `BACKEND_URL` for webhook URL

#### Order Controllers (`backend/controllers/order.controllers.js`)
Added three new controllers:

1. **initiateSafepayPayment**: Creates order and initiates Safepay payment session
2. **handleSafepayWebhook**: Processes payment confirmations from Safepay
3. **verifyPaymentStatus**: Allows frontend to check payment status

#### Order Routes (`backend/routes/order.routes.js`)
Added three new endpoints:
- `POST /api/order/initiate-payment` - Start payment process
- `POST /api/order/safepay-webhook` - Receive Safepay webhooks (no auth required)
- `GET /api/order/verify-payment/:orderId` - Check payment status

### 2. Frontend Changes

#### CheckOut Page (`frontend/src/pages/CheckOut.jsx`)
- Implements online payment flow
- Calls `/api/order/initiate-payment` endpoint
- Stores pending order ID in localStorage
- Redirects user to Safepay checkout page

#### Order Placed Page (`frontend/src/pages/OrderPlaced.jsx`)
- Verifies payment status when user returns from Safepay
- Shows loading state while verifying
- Displays success with transaction ID for paid orders
- Handles failed payments with retry option
- Polls backend until payment is confirmed

## Environment Variables Setup

### Backend (.env)
Add these variables to your backend `.env` file:

```env
# Safepay Configuration
SAFEPAY_BASE_URL=https://sandbox.api.getsafepay.com
SAFEPAY_API_KEY=your_sandbox_api_key_here
SAFEPAY_SECRET_KEY=your_sandbox_secret_key_here

# Deployed URLs (Update these with your actual deployed URLs)
BACKEND_URL=https://foodverse-59g3.onrender.com
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env)
Your frontend already has:
```env
VITE_GEOAPIKEY=your_geo_api_key
```

## Safepay Dashboard Setup

### Step 1: Add Webhook Endpoint
1. Go to your Safepay Dashboard: https://sandbox.api.getsafepay.com/dashboard
2. Navigate to **Developer → Endpoints**
3. Click "Add an endpoint"
4. Enter your webhook URL: `https://foodverse-59g3.onrender.com/api/order/safepay-webhook`
5. Select events to listen to:
   - `payment.succeeded`
   - `payment.failed`
   - `transaction.completed`
6. Save the endpoint

### Step 2: Get Your API Keys
1. In Safepay Dashboard, go to **Developer → API**
2. Copy your **API Key** (starts with `sec_`)
3. Copy your **Secret Key**
4. Add these to your backend `.env` file

### Step 3: Test Mode Settings
1. Ensure you're in "Test Mode" (toggle in dashboard)
2. Use test card numbers for transactions:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

## How the Payment Flow Works

### 1. User Selects Online Payment
```
User fills cart → Goes to checkout → Selects "Online Payment" → Clicks "Pay & Place Order"
```

### 2. Backend Creates Order & Payment Session
```
Frontend calls: POST /api/order/initiate-payment
Backend:
  - Creates order with status "pending"
  - Calls Safepay API to create payment session
  - Saves Safepay token to order
  - Returns checkout URL to frontend
```

### 3. User Completes Payment
```
Frontend redirects user to: https://sandbox.api.getsafepay.com/checkout?tracker=TOKEN
User enters card details on Safepay's secure page
User completes 3D Secure verification (if applicable)
Safepay processes payment
```

### 4. Safepay Sends Webhook
```
Safepay sends POST request to: /api/order/safepay-webhook
Backend:
  - Receives payment confirmation
  - Updates order payment status to "paid"
  - Notifies shop owner via Socket.IO
```

### 5. User Returns to Your App
```
Safepay redirects to: /order-placed
Frontend:
  - Checks localStorage for pending order ID
  - Calls: GET /api/order/verify-payment/:orderId
  - Shows success with transaction ID
  - Clears cart
```

## Testing the Integration

### Test with Sandbox
1. Deploy your backend and frontend
2. Update environment variables with deployed URLs
3. Add webhook endpoint in Safepay dashboard
4. Place a test order with online payment
5. Use test card: 4242 4242 4242 4242
6. Complete payment
7. Check your Safepay dashboard for the transaction

### Verify on Safepay Dashboard
After successful payment, you should see:
- Transaction in "Payments" section
- Amount and order ID
- Payment status: "Completed"
- Customer details
- Transaction timestamp

## Important Notes

### Webhook Requirements
- Webhook URL MUST be publicly accessible (not localhost)
- Use your deployed backend URL
- Safepay will retry failed webhooks
- Webhook endpoint has no authentication (Safepay's signature is verified)

### Security
- Never expose API keys in frontend
- Keep SECRET_KEY secure
- Validate all webhook data
- Check order ownership before showing details

### Payment States
- **pending**: Order created, waiting for payment
- **paid**: Payment successful, order confirmed
- **failed**: Payment declined or error occurred

### Socket.IO Notifications
When payment succeeds, shop owners receive real-time notifications:
```javascript
io.to(ownerSocketId).emit('newOrder', {
  _id, paymentMethod, user, shopOrders, payment, ...
})
```

## Troubleshooting

### Webhook Not Received
- Check if webhook endpoint is added in Safepay dashboard
- Verify webhook URL is publicly accessible
- Check backend logs for webhook errors
- Ensure backend server is running

### Payment Status Shows "Pending"
- Webhook may not have been received yet
- Check Safepay dashboard webhook logs
- Frontend will poll until status updates
- Check backend logs for webhook errors

### Redirect URLs Not Working
- Verify FRONTEND_URL in backend .env
- Check if URLs match your deployed frontend
- Ensure no trailing slashes in URLs

### Test Cards Not Working
- Ensure you're in Safepay Test Mode
- Use exact test card numbers from Safepay docs
- Check if 3D Secure popup is blocked by browser

## Production Checklist

Before going live with real money:
- [ ] Switch Safepay from sandbox to production
- [ ] Update SAFEPAY_BASE_URL to production URL
- [ ] Get production API keys
- [ ] Update webhook endpoint to production backend
- [ ] Test with real small amount
- [ ] Implement proper error handling
- [ ] Add transaction logging
- [ ] Set up payment reconciliation
- [ ] Add refund functionality
- [ ] Implement proper HMAC signature verification

## Support
- Safepay Docs: https://docs.getsafepay.com
- Safepay Support: support@getsafepay.com
- Dashboard: https://sandbox.api.getsafepay.com/dashboard

---

## Quick Start Commands

### Backend
```bash
cd backend
npm install
# Add environment variables to .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Your Safepay integration is now complete and ready to show real transactions on your sandbox dashboard!
