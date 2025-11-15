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

    // Redirect to our custom checkout page for sandbox testing
    const token = response.data.data?.token || response.data.token;
    const checkoutUrl = `http://localhost:5173/safepay-checkout?tracker=${token}&amount=${amount}`;

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

// Verify payment status
export const verifySafepayPayment = async (token) => {
  try {
    const response = await axios.get(
      `${SAFEPAY_BASE_URL}/order/v1/status/${token}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-CLIENT-ID': SAFEPAY_API_KEY,
          'X-SFPY-CLIENT-SECRET': SAFEPAY_SECRET_KEY,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      paymentStatus: response.data.data.state,
    };
  } catch (error) {
    console.error('Safepay payment verification error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};
