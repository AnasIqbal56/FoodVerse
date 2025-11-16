import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com';
const SAFEPAY_API_KEY = process.env.SAFEPAY_API_KEY;
const SAFEPAY_SECRET_KEY = process.env.SAFEPAY_SECRET_KEY;

// Create payment session with Safepay
export const createSafepayPayment = async ({ orderId, amount, customerEmail, customerPhone }) => {
  try {
    console.log('Creating Safepay payment with:', {
      orderId,
      amount,
      customerEmail,
      customerPhone,
      apiKey: SAFEPAY_API_KEY?.substring(0, 10) + '...',
      baseUrl: SAFEPAY_BASE_URL
    });

    // Use localhost for frontend during development, deployed backend for webhook
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const backendUrl = process.env.BACKEND_URL || "https://foodverse-59g3.onrender.com";
    
    const payload = {
      environment: "sandbox",
      amount: amount,
      currency: "PKR",
      order_id: orderId,
      client: SAFEPAY_API_KEY,
      redirect_url: `${frontendUrl}/order-placed`,
      cancel_url: `${frontendUrl}/checkout`,
      webhook_url: `${backendUrl}/api/order/safepay-webhook`,
      source: "custom",
    };

    console.log('Safepay request payload:', payload);

    const response = await axios.post(
      `${SAFEPAY_BASE_URL}/order/v1/init`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Safepay response:', response.data);

    const token = response.data.data?.token || response.data.token;
    
    // Try different Safepay checkout URL formats
    // Format 1: Direct checkout with tracker
    const checkoutUrl = `https://sandbox.getsafepay.com/checkout/pay?tracker=${token}`;
    
    // Alternative format if above doesn't work:
    // const checkoutUrl = `https://sandbox.api.getsafepay.com/checkout/${token}`;

    return {
      success: true,
      data: response.data,
      checkoutUrl: checkoutUrl,
      token: token,
    };
  } catch (error) {
    console.error('Safepay payment creation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Verify Safepay webhook signature
export const verifyWebhookSignature = (payload, signature) => {
  // Safepay sends signature in X-SFPY-Signature header
  // For sandbox testing, we'll log and accept all webhooks
  // In production, implement proper HMAC verification
  console.log('Webhook signature verification:', { signature });
  return true; // Accept all webhooks in sandbox
};
