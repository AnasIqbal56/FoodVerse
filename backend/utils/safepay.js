import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com';
const SAFEPAY_API_KEY = process.env.SAFEPAY_API_KEY;
const SAFEPAY_SECRET_KEY = process.env.SAFEPAY_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'https://foodverse-59g3.onrender.com';

// Validate required environment variables
const validateConfig = () => {
  if (!SAFEPAY_API_KEY) {
    throw new Error('SAFEPAY_API_KEY is required in environment variables');
  }
  if (!SAFEPAY_SECRET_KEY) {
    throw new Error('SAFEPAY_SECRET_KEY is required in environment variables');
  }
};

// Create payment session with Safepay using Order v1 API
export const createSafepayPayment = async ({ orderId, amount, customerEmail, customerPhone }) => {
  try {
    // Validate configuration
    validateConfig();

    // Validate input parameters
    if (!orderId || !amount || !customerEmail) {
      throw new Error('Missing required parameters: orderId, amount, and customerEmail are required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    console.log('Creating Safepay payment with:', {
      orderId,
      amount,
      customerEmail,
      customerPhone: customerPhone || 'not provided',
      apiKey: SAFEPAY_API_KEY?.substring(0, 10) + '...',
      baseUrl: SAFEPAY_BASE_URL,
      frontendUrl: FRONTEND_URL,
      backendUrl: BACKEND_URL
    });

    // Determine environment from base URL
    const environment = SAFEPAY_BASE_URL.includes('sandbox') ? 'sandbox' : 'production';
    
    // Using Order v1 API for hosted checkout
    const payload = {
      environment: environment,
      amount: parseFloat(amount).toFixed(2),
      currency: "PKR",
      order_id: orderId.toString(),
      customer_email: customerEmail,
      client: SAFEPAY_API_KEY,
      redirect_url: `${FRONTEND_URL}/order-placed`,
      cancel_url: `${FRONTEND_URL}/checkout`,
      webhook_url: `${BACKEND_URL}/api/order/safepay-webhook`,
      source: "custom",
    };

    // Add customer phone if provided
    if (customerPhone) {
      payload.customer_phone = customerPhone;
    }

    console.log('Safepay Order v1 request payload:', { ...payload, client: '***' });

    const response = await axios.post(
      `${SAFEPAY_BASE_URL}/order/v1/init`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SAFEPAY_SECRET_KEY}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('Safepay Order v1 response:', {
      status: response.status,
      data: response.data
    });

    // Extract token from response (handle different response structures)
    const token = response.data?.data?.token || 
                  response.data?.token || 
                  response.data?.tracker ||
                  response.data?.data?.tracker;
    
    if (!token) {
      console.error('Safepay response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('No token received from Safepay. Check API response structure.');
    }

    // Construct checkout URL - SafePay uses tracker parameter in query string
    const checkoutUrl = `${SAFEPAY_BASE_URL}/checkout?tracker=${token}`;

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
      statusText: error.response?.statusText,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method
      } : null
    });

    // Return user-friendly error messages
    let errorMessage = error.message;
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    }

    return {
      success: false,
      error: errorMessage,
      details: error.response?.data || null,
    };
  }
};

// Verify Safepay webhook signature
export const verifyWebhookSignature = (payload, signature, webhookSecret = null) => {
  // Safepay sends signature in X-SFPY-Signature header
  const secret = webhookSecret || process.env.SAFEPAY_WEBHOOK_SECRET || SAFEPAY_SECRET_KEY;
  
  if (!signature) {
    console.warn('No signature provided in webhook');
    // In sandbox, accept webhooks without signature for testing
    if (SAFEPAY_BASE_URL.includes('sandbox')) {
      return true;
    }
    return false;
  }

  try {
    // Safepay uses HMAC SHA256 for webhook signature verification
    // The signature is typically in format: sha256=hexdigest
    const signatureParts = signature.split('=');
    if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') {
      console.warn('Invalid signature format:', signature);
      if (SAFEPAY_BASE_URL.includes('sandbox')) {
        return true; // Accept in sandbox for testing
      }
      return false;
    }

    const receivedSignature = signatureParts[1];
    
    // Create HMAC signature from payload
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.warn('Webhook signature verification failed');
      // In sandbox, still accept for testing
      if (SAFEPAY_BASE_URL.includes('sandbox')) {
        console.warn('Accepting webhook in sandbox mode despite signature mismatch');
        return true;
      }
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    // In sandbox, accept webhooks even if verification fails
    if (SAFEPAY_BASE_URL.includes('sandbox')) {
      return true;
    }
    return false;
  }
};
