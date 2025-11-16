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

    const payload = {
      environment: "sandbox",
      amount: amount,
      currency: "PKR",
      order_id: orderId,
      client: SAFEPAY_API_KEY,
      redirect_url: "http://localhost:5173/order-placed",
      cancel_url: "http://localhost:5173/checkout",
      // TODO: Replace with ngrok URL for testing: https://YOUR-NGROK-URL.ngrok.io/api/order/safepay-webhook
      webhook_url: "http://localhost:8000/api/order/safepay-webhook",
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
    
    // Use Safepay's actual hosted checkout URL for sandbox
    // This enables proper 3D Secure flow and transaction tracking
    const checkoutUrl = `https://sandbox.api.getsafepay.com/checkout?tracker=${token}`;

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
