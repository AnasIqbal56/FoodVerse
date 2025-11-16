# Safepay Integration Checklist ✓

Use this checklist to ensure your Safepay integration is complete and working.

## ✅ Code Implementation (All Done!)

- [x] Updated Order model with payment fields
- [x] Modified safepay.js utility with environment variables
- [x] Created `initiateSafepayPayment` controller
- [x] Created `handleSafepayWebhook` controller
- [x] Created `verifyPaymentStatus` controller
- [x] Added payment routes to order.routes.js
- [x] Updated frontend CheckOut.jsx with online payment
- [x] Updated frontend OrderPlaced.jsx with verification
- [x] Updated getMyOrders to filter unpaid orders

## 📋 Configuration Setup (You Need to Do)

### Backend Environment Variables
- [ ] Open `backend/.env` file
- [ ] Add `SAFEPAY_API_KEY=sec_your_key_here`
- [ ] Add `SAFEPAY_SECRET_KEY=your_secret_here`
- [ ] Add `BACKEND_URL=https://foodverse-59g3.onrender.com`
- [ ] Add `FRONTEND_URL=https://your-frontend-url.vercel.app`
- [ ] Save the file

### Get Safepay API Keys
- [ ] Go to: https://sandbox.api.getsafepay.com/dashboard
- [ ] Login to your Safepay sandbox account
- [ ] Navigate to **Developer → API**
- [ ] Copy your **API Key** (starts with `sec_`)
- [ ] Copy your **Secret Key**
- [ ] Paste them in your `.env` file

### Setup Webhook Endpoint
- [ ] Still in Safepay Dashboard
- [ ] Navigate to **Developer → Endpoints**
- [ ] Click **"Add an endpoint"** button
- [ ] Enter URL: `https://foodverse-59g3.onrender.com/api/order/safepay-webhook`
- [ ] Select these events:
  - [ ] `payment.succeeded`
  - [ ] `payment.failed`
  - [ ] `transaction.completed`
- [ ] Click **Save**
- [ ] Keep this tab open for later verification

## 🚀 Deployment

### Backend Deployment
- [ ] Add changes to git: `git add .`
- [ ] Commit: `git commit -m "Add Safepay payment integration"`
- [ ] Push: `git push`
- [ ] Verify Render auto-deploys your backend
- [ ] Check deployment logs for errors
- [ ] Wait for deployment to complete (usually 2-3 minutes)

### Frontend Deployment (if needed)
- [ ] Push frontend changes
- [ ] Verify Vercel auto-deploys
- [ ] Get your deployed frontend URL
- [ ] Update `FRONTEND_URL` in backend .env if changed

## 🧪 Testing

### Pre-Test Verification
- [ ] Backend is deployed and running
- [ ] Frontend is deployed and accessible
- [ ] Environment variables are set in backend
- [ ] Webhook endpoint is added in Safepay dashboard
- [ ] You're in **Test Mode** on Safepay (check toggle in dashboard)

### Test the Payment Flow
1. [ ] Open your frontend app
2. [ ] Log in as a user
3. [ ] Add items to cart (at least Rs. 100)
4. [ ] Go to checkout page
5. [ ] Enter delivery address
6. [ ] Select location on map
7. [ ] Choose **"Online Payment"** option
8. [ ] Click **"Pay & Place Order"**
9. [ ] Verify you're redirected to Safepay checkout page
10. [ ] See order amount displayed correctly

### Complete Test Payment
11. [ ] On Safepay checkout, enter card details:
    - Card Number: `4242 4242 4242 4242`
    - CVV: `123`
    - Expiry: `12/25` (any future date)
    - Name: `Test User`
12. [ ] Click **Pay** or **Submit**
13. [ ] Complete 3D Secure if prompted
14. [ ] Wait for payment processing

### Verify Success
15. [ ] You're redirected back to `/order-placed`
16. [ ] See loading spinner briefly
17. [ ] See ✓ "Order Placed!" message
18. [ ] See "Payment Successful" indicator
19. [ ] See Transaction ID displayed
20. [ ] Cart is cleared

### Check Backend Logs
21. [ ] Open your backend deployment logs (Render)
22. [ ] Search for: "Safepay webhook received"
23. [ ] Verify webhook was processed
24. [ ] No errors in logs

### Check Database
25. [ ] Open MongoDB (Atlas or your database)
26. [ ] Find the order by ID
27. [ ] Verify fields:
    - [ ] `paymentMethod: "online"`
    - [ ] `payment.status: "paid"`
    - [ ] `payment.transactionId` exists
    - [ ] `payment.paidAt` has timestamp

### Check Safepay Dashboard (MOST IMPORTANT!)
28. [ ] Go to: https://sandbox.api.getsafepay.com/dashboard
29. [ ] Click **Payments** in sidebar
30. [ ] Click **Transactions**
31. [ ] Find your transaction (should be at top)
32. [ ] Verify details:
    - [ ] Status: **Completed** ✓
    - [ ] Amount matches your order
    - [ ] Order ID matches your database
    - [ ] Transaction ID exists
    - [ ] Customer details visible
    - [ ] Timestamp is correct

### Check Shop Owner Dashboard
33. [ ] Log in as shop owner
34. [ ] Go to owner dashboard
35. [ ] Verify new order appears
36. [ ] Payment method shows "online"
37. [ ] Order status is active

## 🎯 Success Criteria

Your integration is successful if:
- ✅ User can complete checkout with online payment
- ✅ User is redirected to Safepay's page
- ✅ Payment completes successfully
- ✅ User sees success message with transaction ID
- ✅ **Transaction appears on Safepay Dashboard** 🎉
- ✅ Webhook is received by your backend
- ✅ Order status updates to "paid"
- ✅ Shop owner receives order notification
- ✅ Order appears in user's order history

## ❌ Testing Failure Scenarios

### Test Failed Payment
- [ ] Repeat checkout process
- [ ] Use card: `4000 0000 0000 0002`
- [ ] Complete payment
- [ ] Verify payment fails
- [ ] User sees "Payment Failed" message
- [ ] Order marked as failed in database
- [ ] No transaction in Safepay dashboard

### Test Cancelled Payment
- [ ] Start checkout process
- [ ] Go to Safepay page
- [ ] Click "Cancel" or "Back"
- [ ] Verify user returns to checkout
- [ ] Cart is still intact

## 🐛 Troubleshooting

### Webhook Not Received
- [ ] Check webhook URL in Safepay dashboard
- [ ] Verify URL is publicly accessible (not localhost)
- [ ] Check backend logs for incoming requests
- [ ] Test webhook URL manually: `curl https://your-backend.com/api/order/safepay-webhook`

### Payment Status Shows "Pending"
- [ ] Wait 10-15 seconds (webhook delay)
- [ ] Check Safepay dashboard webhook logs
- [ ] Verify webhook endpoint is active
- [ ] Check backend logs for webhook processing

### Transaction Not on Safepay Dashboard
- [ ] Verify you're in correct mode (Test/Live)
- [ ] Check if payment actually succeeded
- [ ] Look in Failed Payments section
- [ ] Filter by date/amount

### Environment Variable Issues
- [ ] Verify .env file exists in backend root
- [ ] Check variable names match exactly
- [ ] No spaces around `=` in .env
- [ ] Restart backend after .env changes
- [ ] Check deployment platform env vars

## 📊 Expected Results

### On Success:
```
✓ User completes payment on Safepay
✓ Safepay dashboard shows transaction
✓ Backend receives webhook
✓ Order status: paid
✓ User sees success message
✓ Shop owner gets notification
```

### On Safepay Dashboard:
```
Transaction Details:
├─ Status: Completed
├─ Amount: Rs. 1,500.00
├─ Order ID: 507f1f77bcf86cd799439011
├─ Transaction ID: TXN123456789
├─ Customer: user@email.com
├─ Method: Visa ••4242
└─ Date: Nov 16, 2025, 10:30 AM
```

## 📝 Next Steps After Testing

Once everything works:
- [ ] Document your test results
- [ ] Test with different amounts
- [ ] Test with multiple items
- [ ] Test cancellation flow
- [ ] Test with different browsers
- [ ] Consider production setup (when ready)

## 🎓 Learning Resources

- [x] Read `SAFEPAY_SETUP_GUIDE.md` (detailed guide)
- [x] Review `PAYMENT_FLOW_DIAGRAM.md` (visual flow)
- [ ] Safepay Docs: https://docs.getsafepay.com
- [ ] Safepay API Reference: https://docs.getsafepay.com/api-reference

---

## ✨ You're All Set!

Follow this checklist step by step, and you'll have a fully working Safepay integration with transactions visible on your sandbox dashboard!

**Questions?** Check the troubleshooting section or Safepay support.

**Ready?** Start with the Configuration Setup section! 🚀
