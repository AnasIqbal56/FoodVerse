import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Payment Intent
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.amount - Amount in smallest currency unit (e.g., cents for USD, paisa for PKR)
 * @param {string} paymentData.currency - Currency code (usd, pkr, etc.)
 * @param {string} paymentData.customerEmail - Customer email
 * @param {string} paymentData.customerName - Customer name
 * @param {string} paymentData.orderId - Order ID for reference
 * @returns {Object} Payment intent object with client_secret
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const { amount, currency = 'pkr', customerEmail, customerName, orderId } = paymentData;

    // Validate amount (must be at least 50 cents/paisa)
    if (!amount || amount < 50) {
      throw new Error('Amount must be at least 50 in smallest currency unit');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure integer
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId,
        customerEmail: customerEmail,
        customerName: customerName,
      },
      description: `Order ${orderId} - ${customerName}`,
      receipt_email: customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✓ Stripe Payment Intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      orderId: orderId,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe Payment Intent creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Retrieve a Payment Intent by ID
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Object} Payment intent details
 */
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      paymentIntent,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error('Retrieve Payment Intent error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify payment status
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {boolean} Whether payment was successful
 */
export const verifyPaymentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Payment is successful if status is 'succeeded'
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Verify payment status error:', error);
    return false;
  }
};

/**
 * Cancel a payment intent
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Object} Cancellation result
 */
export const cancelPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    
    return {
      success: true,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error('Cancel payment intent error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default stripe;
