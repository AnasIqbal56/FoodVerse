# Safepay Setup - Local Frontend + Deployed Backend

## Your Current Setup
- ✅ Backend: Deployed on Render (https://foodverse-59g3.onrender.com)
- ✅ Frontend: Running locally (http://localhost:5173)

## Required Environment Variables (Backend .env)

You only need **2 Safepay variables**:

```env
# Safepay API Keys (get from Safepay dashboard)
SAFEPAY_API_KEY=sec_your_api_key_here
SAFEPAY_SECRET_KEY=your_secret_key_here

# Optional (defaults are already set in code)
# BACKEND_URL=https://foodverse-59g3.onrender.com
# FRONTEND_URL=http://localhost:5173
```

**No webhook variable needed!** The code automatically uses your deployed backend URL.

## Quick Setup Steps

### 1. Get Safepay API Keys (2 minutes)
1. Go to: https://sandbox.api.getsafepay.com/dashboard
2. Click **Developer → API**
3. Copy **API Key** (starts with `sec_`)
4. Copy **Secret Key**
5. Add both to your `backend/.env` file

### 2. Add Webhook Endpoint in Safepay Dashboard (1 minute)
1. Still in Safepay Dashboard
2. Click **Developer → Endpoints**
3. Click **"+ Add an endpoint"**
4. Paste this URL: `https://foodverse-59g3.onrender.com/api/order/safepay-webhook`
5. Select events (minimum required):
   - ☑️ **`payment.succeeded`** - When payment is successful (REQUIRED)
   - ☑️ **`payment.failed`** - When payment fails (REQUIRED)
   - ☑️ `payment.created` - Optional (for tracking)
6. Click **Subscribe**

### 3. Deploy Backend (if not already)
```bash
git add .
git commit -m "Add Safepay payment integration"
git push
```

Wait for Render to auto-deploy (2-3 minutes).

### 4. Test It! 🧪

1. **Run your local frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Opens at: http://localhost:5173

2. **Add items to cart**
3. **Go to checkout**
4. **Select "Online Payment"**
5. **Click "Pay & Place Order"**
6. **Use test card:**
   - Card: `4242 4242 4242 4242`
   - CVV: `123`
   - Expiry: `12/25`
7. **Complete payment**
8. **You'll return to localhost** and see success!

### 5. View Transaction on Safepay Dashboard 🎉
1. Go to: https://sandbox.api.getsafepay.com/dashboard
2. Click **Payments → Transactions**
3. See your test transaction!

## How It Works

```
Local Frontend (localhost:5173)
    ↓
Deployed Backend (Render)
    ↓
Safepay API
    ↓
User pays on Safepay page
    ↓
Safepay sends webhook → Deployed Backend
    ↓
Safepay redirects → Local Frontend
    ↓
Success! 🎉
```

## Important Notes

✅ **Frontend stays local** - You can test with localhost:5173
✅ **Webhook goes to deployed backend** - Safepay can reach it
✅ **No extra env variables** - Just API keys needed
✅ **Redirects work** - User returns to your localhost
✅ **Transactions show on dashboard** - Real Safepay integration

## Minimal .env File

Your backend `.env` only needs:

```env
# Your existing variables
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Add these 2 for Safepay
SAFEPAY_API_KEY=sec_xxxxxxxxxxxxxxxxxxxxx
SAFEPAY_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxx
```

That's it! The code handles the rest.

## Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

## Troubleshooting

**Webhook not working?**
- Verify webhook URL in Safepay dashboard
- Must be: `https://foodverse-59g3.onrender.com/api/order/safepay-webhook`
- Check backend is deployed and running

**Can't see transaction?**
- Make sure you're in Test Mode in Safepay
- Check Payments → Transactions
- May take 5-10 seconds to appear

---

**Ready to test!** Just add your 2 API keys and the webhook endpoint. 🚀
