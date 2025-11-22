# PayFast Payment Gateway Integration

## Overview
This document provides a complete guide for the PayFast payment integration in FoodVerse. The integration follows PayFast's official documentation and implements all recommended security measures.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Payment Flow](#payment-flow)
- [Security Implementation](#security-implementation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

### ✅ Implemented Features
- **Secure Payment Processing** - Form-based redirect to PayFast
- **Webhook Handler (ITN)** - Instant Transaction Notifications
- **4-Layer Security Validation** - As per PayFast documentation
- **Email Notifications** - Automatic customer confirmation emails
- **Real-time Updates** - Socket.io notifications to shop owners
- **Phone Number Formatting** - Auto-formats to South African format
- **Sandbox Testing** - Full sandbox environment support

## Architecture

### Payment Flow Diagram
```
Customer Checkout
      ↓
Create Order (pending)
      ↓
Generate PayFast Form
      ↓
Redirect to PayFast
      ↓
Customer Pays
      ↓
PayFast ITN Webhook → 4 Security Checks
      ↓
Update Order Status
      ↓
Send Notifications (Email + Socket)
      ↓
Redirect Customer to Success Page
```

### File Structure
```
backend/
├── controllers/
│   └── order.controllers.js
│       ├── initiatePayFastPayment()
│       ├── verifyPayFastPayment()
│       └── handlePayFastWebhook()
├── routes/
│   └── order.routes.js
│       ├── POST /initiate-payfast-payment
│       ├── POST /verify-payfast-payment/:orderId
│       └── POST /payfast-webhook
├── utils/
│   ├── payfast.js
│   │   ├── generatePayFastSignature()
│   │   ├── createPayFastPayment()
│   │   ├── verifyPayFastSignature()
│   │   ├── validatePayFastIP()
│   │   ├── validatePaymentAmount()
│   │   └── validatePayFastPayment()
│   └── mail.js
│       └── sendPaymentConfirmationMail()
└── models/
    └── order.model.js (updated with PayFast fields)

frontend/
├── pages/
│   ├── CheckOut.jsx (PayFast form submission)
│   ├── PaymentSuccess.jsx (success handler)
│   └── PaymentCancelled.jsx (cancellation handler)
└── App.jsx (payment routes)
```

## Setup Instructions

### 1. Environment Variables

Create/update your `.env` file in the backend:

```env
# PayFast Configuration
FASTPAY_MERCHANT_ID=10000100
FASTPAY_MERCHANT_KEY=46f0cd694581a
FASTPAY_PASSPHRASE=jt7NOE43FZPn
FASTPAY_SANDBOX_URL=https://sandbox.payfast.co.za/eng/process

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Email Configuration (for notifications)
EMAIL=your-email@gmail.com
PASS=your-gmail-app-password

# MongoDB
MONGO_URL=your-mongodb-connection-string

# Other configurations
PORT=8000
NODE_ENV=development
```

### 2. PayFast Sandbox Account

1. Visit https://sandbox.payfast.co.za
2. Create a sandbox account
3. Navigate to **Settings** → **Merchant Credentials**
4. Copy your Merchant ID and Merchant Key
5. Set a **Salt Passphrase** in Settings
6. Use these credentials in your `.env` file

### 3. Install Dependencies

All required dependencies are already in package.json:
```bash
cd backend
npm install

cd frontend
npm install
```

### 4. Database Schema

The Order model includes PayFast fields:
```javascript
payment: {
  status: String, // 'pending', 'paid', 'failed', 'cancelled'
  payFastOrderId: String, // Our order reference (m_payment_id)
  pfPaymentId: String, // PayFast transaction ID (pf_payment_id)
  paidAt: Date
}
```

## Payment Flow

### Step 1: Initiate Payment
**Endpoint:** `POST /api/order/initiate-payfast-payment`

**Request:**
```javascript
{
  cartItems: [...],
  deliveryAddress: {
    text: "123 Main St",
    latitude: -26.2041,
    longitude: 28.0473
  },
  totalAmount: 150.00
}
```

**Response:**
```javascript
{
  success: true,
  paymentUrl: "https://sandbox.payfast.co.za/eng/process",
  formData: {
    merchant_id: "10000100",
    merchant_key: "46f0cd694581a",
    return_url: "http://localhost:5173/payment-success",
    cancel_url: "http://localhost:5173/payment-cancelled",
    notify_url: "http://localhost:8000/api/order/payfast-webhook",
    name_first: "John",
    name_last: "Doe",
    email_address: "john@example.com",
    cell_number: "0821234567",
    m_payment_id: "order-id",
    amount: "150.00",
    item_name: "FoodVerse Order #order-id",
    item_description: "Food delivery order",
    email_confirmation: "1",
    confirmation_address: "john@example.com",
    signature: "generated-md5-hash"
  },
  orderId: "order-id"
}
```

### Step 2: PayFast Processing
- Customer is redirected to PayFast
- Customer completes payment on PayFast's secure page
- PayFast processes the transaction

### Step 3: Webhook Notification (ITN)
**Endpoint:** `POST /api/order/payfast-webhook`

PayFast sends instant notification with:
```javascript
{
  m_payment_id: "order-id",
  pf_payment_id: "1089250",
  payment_status: "COMPLETE",
  item_name: "FoodVerse Order #order-id",
  amount_gross: "150.00",
  amount_fee: "-3.45",
  amount_net: "146.55",
  name_first: "John",
  name_last: "Doe",
  email_address: "john@example.com",
  merchant_id: "10000100",
  signature: "verified-signature"
}
```

### Step 4: Security Validation

The webhook handler performs 4 security checks:

#### ✅ Check 1: Signature Verification
```javascript
const signatureValid = verifyPayFastSignature(pfData);
```
- Regenerates MD5 signature from received data
- Compares with signature sent by PayFast
- Uses passphrase as salt

#### ✅ Check 2: IP Validation
```javascript
const ipValid = await validatePayFastIP(clientIp);
```
- Validates request comes from PayFast servers
- Allowed IPs from: www.payfast.co.za, sandbox.payfast.co.za, w1w.payfast.co.za, w2w.payfast.co.za
- Skipped in development mode

#### ✅ Check 3: Amount Validation
```javascript
const amountValid = validatePaymentAmount(order.totalAmount, pfData.amount_gross);
```
- Compares expected order amount with received amount
- Allows for floating point precision (±0.01)

#### ✅ Check 4: Server Validation
```javascript
const serverValid = await validatePayFastPayment(pfData);
```
- Posts data back to PayFast validation URL
- Confirms payment authenticity with PayFast servers
- Returns 'VALID' or 'INVALID'

### Step 5: Order Update & Notifications

If all checks pass:
1. **Update Order**
   ```javascript
   order.payment.status = 'paid';
   order.payment.pfPaymentId = pfData.pf_payment_id;
   order.payment.paidAt = new Date();
   ```

2. **Send Real-time Notifications**
   ```javascript
   io.to(ownerSocketId).emit('newOrder', orderData);
   ```

3. **Send Email Confirmation**
   ```javascript
   await sendPaymentConfirmationMail({
     to: customer.email,
     orderId: order._id,
     amount: order.totalAmount,
     items: orderItems
   });
   ```

### Step 6: Customer Return
- Customer is redirected to `return_url` (success page)
- Frontend calls `/verify-payfast-payment/:orderId`
- Displays order confirmation

## Security Implementation

### MD5 Signature Generation

```javascript
function generatePayFastSignature(data, passphrase) {
  // 1. Create parameter string in exact order
  let pfParamString = '';
  for (const key in data) {
    if (data[key] !== '' && key !== 'signature') {
      pfParamString += `${key}=${encodeURIComponent(data[key])}&`;
    }
  }
  
  // 2. Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);
  
  // 3. Add passphrase
  if (passphrase) {
    pfParamString += `&passphrase=${encodeURIComponent(passphrase)}`;
  }
  
  // 4. Generate MD5 hash
  return crypto.createHash('md5').update(pfParamString).digest('hex');
}
```

### Phone Number Formatting

Automatically formats phone numbers to South African format:

```javascript
// Input formats supported:
"+27821234567"  → "0821234567" ✅
"0821234567"    → "0821234567" ✅
"821234567"     → "0821234567" ✅
"invalid"       → "0823456789" (default test number) ✅
```

## Testing

### Testing on Localhost

#### Option 1: Using ngrok (Recommended)
```bash
# Install ngrok
npm install -g ngrok

# Expose your backend
ngrok http 8000

# Output: https://abc123.ngrok.io
# Update BACKEND_URL in .env to this URL
```

#### Option 2: Using localtunnel
```bash
# Install localtunnel
npm install -g localtunnel

# Expose your backend
lt --port 8000

# Output: https://xyz.loca.lt
# Update BACKEND_URL in .env to this URL
```

### Sandbox Test Credentials

**Merchant Details:**
- Merchant ID: `10000100`
- Merchant Key: `46f0cd694581a`
- Passphrase: `jt7NOE43FZPn`

**Buyer Login:**
- Username: `sbtu01@payfast.io`
- Password: `clientpass`

**Test Wallet:**
- Balance: R99,999,999.99 (resets daily)

### Test Payment Flow

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Place Test Order:**
   - Add items to cart
   - Go to checkout
   - Select "Online Payment"
   - Enter delivery address
   - Click "Place Order"

4. **Complete Payment on PayFast:**
   - Login with test credentials
   - Click "Pay Now Using Your Wallet"
   - For recurring: use test credit card provided

5. **Verify:**
   - Check webhook logs in backend console
   - Check email inbox for confirmation
   - Verify order status in database
   - Check shop owner notifications

### Viewing ITN Logs

PayFast Sandbox provides ITN viewer:
1. Login to https://sandbox.payfast.co.za
2. Navigate to **ITN** section
3. View all sent notifications and responses

## Troubleshooting

### Common Issues

#### 1. Signature Mismatch
**Symptom:** Error "Signature verification failed"

**Solutions:**
- Verify passphrase matches in PayFast dashboard and `.env`
- Check field order matches PayFast documentation
- Ensure URL encoding uses uppercase (e.g., `%3A` not `%3a`)
- Remove any empty fields before generating signature

#### 2. Cell Number Format Invalid
**Symptom:** "The cell number format is invalid"

**Solutions:**
- Phone must be exactly 10 digits starting with 0
- Format: `0XXXXXXXXX`
- Phone formatting is now automatic
- Default test number used if invalid: `0823456789`

#### 3. Webhook Not Receiving Notifications
**Symptom:** Payment completes but order not updated

**Solutions:**
- Check `notify_url` is publicly accessible
- Use ngrok/localtunnel for localhost testing
- Verify webhook endpoint doesn't require authentication
- Check PayFast ITN logs for errors
- Ensure backend responds with 200 OK immediately

#### 4. Amount Mismatch
**Symptom:** "Payment amount doesn't match order amount"

**Solutions:**
- Verify `amount` field is formatted as decimal: `"150.00"`
- Check order total calculation includes all fees
- Use `parseFloat(amount).toFixed(2)` for formatting

#### 5. Email Not Sending
**Symptom:** Payment successful but no email received

**Solutions:**
- Check Gmail app password is correct (not regular password)
- Enable "Less secure app access" in Gmail
- Verify EMAIL and PASS in `.env` file
- Check spam folder
- Review console logs for email errors

### Debug Logging

Enable detailed logging in the backend:

```javascript
// In payfast.js and order.controllers.js
console.log('PayFast Signature Generation:', { ... });
console.log('Security Check 1:', signatureValid);
console.log('Security Check 2:', ipValid);
console.log('Security Check 3:', amountValid);
console.log('Security Check 4:', serverValid);
```

### Testing Checklist

- [ ] PayFast credentials configured in `.env`
- [ ] Passphrase set in PayFast sandbox dashboard
- [ ] Email credentials configured
- [ ] Backend publicly accessible (ngrok for localhost)
- [ ] Frontend and backend running
- [ ] Database connection working
- [ ] Test order placement successful
- [ ] PayFast redirect working
- [ ] Webhook receiving notifications
- [ ] All 4 security checks passing
- [ ] Order status updating to 'paid'
- [ ] Email confirmation sent
- [ ] Socket notifications sent to shop owners
- [ ] Customer redirected to success page

## API Reference

### Initiate Payment
```
POST /api/order/initiate-payfast-payment
Authorization: Bearer <token>
Content-Type: application/json
```

### Verify Payment
```
POST /api/order/verify-payfast-payment/:orderId
Authorization: Bearer <token>
```

### Webhook (ITN)
```
POST /api/order/payfast-webhook
Content-Type: application/x-www-form-urlencoded
(No authentication required)
```

## Production Deployment

### Going Live Checklist

1. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   FASTPAY_MERCHANT_ID=<your-live-merchant-id>
   FASTPAY_MERCHANT_KEY=<your-live-merchant-key>
   FASTPAY_PASSPHRASE=<your-live-passphrase>
   FASTPAY_SANDBOX_URL=https://www.payfast.co.za/eng/process
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://api.yourdomain.com
   ```

2. **Update PayFast Settings:**
   - Login to https://www.payfast.co.za
   - Set passphrase in Settings
   - Configure return_url and cancel_url
   - Set notify_url (webhook URL)

3. **SSL Certificate:**
   - Ensure both frontend and backend use HTTPS
   - PayFast requires secure connections

4. **Test Small Transaction:**
   - Process a small real payment (R5 minimum)
   - Verify complete flow
   - Check all notifications

5. **Monitor:**
   - Watch logs for first few transactions
   - Verify emails are delivered
   - Check order status updates

## Support & Resources

### PayFast Documentation
- [Official Docs](https://developers.payfast.co.za/)
- [Custom Integration](https://developers.payfast.co.za/docs#custom_integration)
- [Webhook/ITN Guide](https://developers.payfast.co.za/docs#step_4)

### FoodVerse Support
- GitHub Issues: [Report a bug](https://github.com/AnasIqbal56/FoodVerse/issues)
- Email: foodverse124@gmail.com

### PayFast Support
- Email: support@payfast.co.za
- Phone: +27 21 201 0965

## License
This integration is part of the FoodVerse project and follows the same license.

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0  
**Author:** FoodVerse Team
