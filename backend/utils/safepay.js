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
    // Note: SafePay API might expect different field names - adjust based on actual API response
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
    
    // Alternative payload structure if the above doesn't work
    // Some SafePay implementations use 'api_key' instead of 'client'
    // Uncomment and try if you get authentication errors:
    // const payload = {
    //   environment: environment,
    //   amount: parseFloat(amount).toFixed(2),
    //   currency: "PKR",
    //   order_id: orderId.toString(),
    //   customer_email: customerEmail,
    //   api_key: SAFEPAY_API_KEY,
    //   redirect_url: `${FRONTEND_URL}/order-placed`,
    //   cancel_url: `${FRONTEND_URL}/checkout`,
    //   webhook_url: `${BACKEND_URL}/api/order/safepay-webhook`,
    // };

    // Add customer phone if provided
    if (customerPhone) {
      payload.customer_phone = customerPhone;
    }

    console.log('Safepay Order v1 request payload:', { ...payload, client: '***' });

    // Try different authentication methods based on SafePay API requirements
    // Method 1: Bearer token with secret key (most common)
    let headers = {
      'Content-Type': 'application/json',
    };
    
    // SafePay might use different auth methods - try these in order:
    // Option 1: Bearer token with secret key
    if (SAFEPAY_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${SAFEPAY_SECRET_KEY}`;
    }
    
    // Option 2: Basic auth (uncomment if Bearer doesn't work)
    // const authString = Buffer.from(`${SAFEPAY_API_KEY}:${SAFEPAY_SECRET_KEY}`).toString('base64');
    // headers['Authorization'] = `Basic ${authString}`;
    
    // Option 3: API key in header (uncomment if needed)
    // headers['X-API-Key'] = SAFEPAY_API_KEY;
    // headers['X-API-Secret'] = SAFEPAY_SECRET_KEY;

    console.log('Making request to:', `${SAFEPAY_BASE_URL}/order/v1/init`);
    console.log('Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'none' });

    const response = await axios.post(
      `${SAFEPAY_BASE_URL}/order/v1/init`,
      payload,
      {
        headers: headers,
        timeout: 30000, // 30 second timeout
        validateStatus: function (status) {
          // Don't throw error for 4xx/5xx, we'll handle it manually
          return status >= 200 && status < 600;
        }
      }
    );

    console.log('Safepay Order v1 response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    // Check for error responses
    if (response.status >= 400) {
      const errorData = response.data || {};
      const errorMsg = errorData.message || errorData.error || errorData.error_message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`SafePay API error: ${errorMsg}. Status: ${response.status}`);
    }

    // Extract token from response (handle different response structures)
    const token = response.data?.data?.token || 
                  response.data?.token || 
                  response.data?.tracker ||
                  response.data?.data?.tracker ||
                  response.data?.data?.tracker_id;
    
    if (!token) {
      console.error('Safepay response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('No token received from Safepay. Check API response structure. Response: ' + JSON.stringify(response.data));
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
    let errorDetails = null;
    
    if (error.response) {
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      };
      
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : error.response.data.error.message || JSON.stringify(error.response.data.error);
        } else if (error.response.data.error_message) {
          errorMessage = error.response.data.error_message;
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from SafePay API. Check network connectivity and API endpoint.';
      errorDetails = {
        message: 'Network error - no response received',
        url: error.config?.url
      };
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
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
