# Safepay Payment Flow Diagram

## Complete Payment Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

1. USER ADDS ITEMS TO CART
   │
   ├─> Views menu items
   ├─> Adds items to cart
   └─> Clicks "Checkout"

2. CHECKOUT PAGE (/checkout)
   │
   ├─> Enters delivery address
   ├─> Selects delivery location on map
   └─> Selects payment method: "Online Payment" ✓

3. CLICKS "Pay & Place Order"
   │
   └─> Frontend calls: POST /api/order/initiate-payment
       {
         cartItems: [...],
         deliveryAddress: {...},
         totalAmount: 1500
       }

┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND PROCESSING                           │
└─────────────────────────────────────────────────────────────────────┘

4. BACKEND: initiateSafepayPayment()
   │
   ├─> Validates cart & address
   ├─> Groups items by shop
   │
   ├─> Creates Order in Database:
   │   {
   │     user: userId,
   │     paymentMethod: "online",
   │     shopOrders: [...],
   │     payment: { status: "pending" }
   │   }
   │
   └─> Calls Safepay API: POST /order/v1/init
       {
         amount: 1500,
         currency: "PKR",
         order_id: "507f1f77bcf86cd799439011",
         redirect_url: "https://your-app.com/order-placed",
         webhook_url: "https://your-api.com/api/order/safepay-webhook"
       }

5. SAFEPAY API RESPONDS
   │
   └─> Returns:
       {
         token: "abc123xyz",
         checkout_url: "https://sandbox.api.getsafepay.com/checkout?tracker=abc123xyz"
       }

6. BACKEND SAVES & RESPONDS
   │
   ├─> Updates order.payment.safepayToken = "abc123xyz"
   │
   └─> Returns to frontend:
       {
         orderId: "507f1f77bcf86cd799439011",
         checkoutUrl: "https://sandbox.api.getsafepay.com/checkout?tracker=abc123xyz"
       }

┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND REDIRECT                            │
└─────────────────────────────────────────────────────────────────────┘

7. FRONTEND REDIRECTS USER
   │
   ├─> Saves orderId to localStorage
   │   localStorage.setItem('pendingOrderId', '507f1f77bcf86cd799439011')
   │
   └─> Redirects browser to Safepay checkout:
       window.location.href = checkoutUrl

┌─────────────────────────────────────────────────────────────────────┐
│                         SAFEPAY CHECKOUT                             │
└─────────────────────────────────────────────────────────────────────┘

8. USER ON SAFEPAY PAGE
   │
   ├─> Sees order summary (Rs. 1500)
   ├─> Enters card details:
   │   • Card: 4242 4242 4242 4242
   │   • CVV: 123
   │   • Expiry: 12/25
   │
   ├─> Completes 3D Secure (if required)
   │
   └─> Safepay processes payment

9. SAFEPAY PROCESSES PAYMENT
   │
   ├─> [SUCCESS] Payment approved ✓
   │   └─> Transaction ID: TXN123456789
   │
   └─> [PARALLEL ACTIONS]
       ├─> Sends webhook to your backend
       └─> Redirects user to: https://your-app.com/order-placed

┌─────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK PROCESSING                           │
└─────────────────────────────────────────────────────────────────────┘

10. SAFEPAY WEBHOOK (Happens in background)
    │
    └─> POST /api/order/safepay-webhook
        {
          data: {
            state: "COMPLETED",
            reference: "TXN123456789"
          },
          tracker: {
            order_id: "507f1f77bcf86cd799439011"
          }
        }

11. BACKEND: handleSafepayWebhook()
    │
    ├─> Finds order by order_id
    │
    ├─> Updates order:
    │   {
    │     payment: {
    │       status: "paid",
    │       transactionId: "TXN123456789",
    │       paidAt: new Date()
    │     }
    │   }
    │
    ├─> Saves to database ✓
    │
    └─> Sends Socket.IO notification to shop owner:
        socket.emit('newOrder', { order details... })

12. SHOP OWNER NOTIFIED
    │
    └─> Receives order in real-time on dashboard
        Shows: "New Order! Rs. 1500 - PAID"

┌─────────────────────────────────────────────────────────────────────┐
│                         USER RETURNS                                 │
└─────────────────────────────────────────────────────────────────────┘

13. USER REDIRECTED TO /order-placed
    │
    └─> OrderPlaced.jsx loads

14. FRONTEND: Payment Verification
    │
    ├─> Gets orderId from localStorage
    │   orderId = localStorage.getItem('pendingOrderId')
    │
    ├─> Calls: GET /api/order/verify-payment/507f1f77bcf86cd799439011
    │
    └─> Backend returns:
        {
          orderId: "507f1f77bcf86cd799439011",
          paymentStatus: "paid",
          paidAt: "2025-11-16T10:30:00Z",
          transactionId: "TXN123456789",
          order: { full order details }
        }

15. FRONTEND: Success Display
    │
    ├─> Shows: ✓ "Order Placed!"
    ├─> Shows: "✓ Payment Successful"
    ├─> Shows: "Transaction ID: TXN123456789"
    │
    ├─> Clears cart: dispatch(clearCart())
    ├─> Adds order to Redux: dispatch(addMyOrder(order))
    ├─> Removes pendingOrderId from localStorage
    │
    └─> Shows button: "Back to my orders"

┌─────────────────────────────────────────────────────────────────────┐
│                     SAFEPAY DASHBOARD UPDATED                        │
└─────────────────────────────────────────────────────────────────────┘

16. CHECK SAFEPAY DASHBOARD
    │
    └─> Go to: https://sandbox.api.getsafepay.com/dashboard
        │
        └─> Payments → Transactions
            │
            └─> Shows:
                • Order ID: 507f1f77bcf86cd799439011
                • Amount: Rs. 1,500
                • Status: Completed ✓
                • Transaction ID: TXN123456789
                • Customer: user@email.com
                • Timestamp: 16 Nov 2025, 10:30 AM
                • Method: Visa •••• 4242

┌─────────────────────────────────────────────────────────────────────┐
│                         SUCCESS! 🎉                                  │
└─────────────────────────────────────────────────────────────────────┘

✓ Order created in your database
✓ Payment processed via Safepay
✓ Transaction visible on Safepay dashboard
✓ Shop owner notified
✓ User sees success confirmation
✓ Cart cleared
✓ Order saved in user's order history
```

## Key Integration Points

### 1. Environment Variables Required
```env
SAFEPAY_API_KEY=sec_xxx...
SAFEPAY_SECRET_KEY=xxx...
BACKEND_URL=https://foodverse-59g3.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2. Webhook Endpoint Setup
- URL: `https://foodverse-59g3.onrender.com/api/order/safepay-webhook`
- Must be added in Safepay Dashboard → Developer → Endpoints
- Events: payment.succeeded, payment.failed, transaction.completed

### 3. Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

### 4. Database Schema
```javascript
Order {
  paymentMethod: "online",
  payment: {
    safepayToken: "abc123xyz",
    status: "paid",
    transactionId: "TXN123456789",
    paidAt: Date
  }
}
```

---

**This flow ensures that every transaction is tracked and visible on your Safepay sandbox dashboard!** 🚀
