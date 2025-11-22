import crypto from 'crypto';

// PayFast Configuration
const getPayFastConfig = () => ({
  merchant_id: process.env.FASTPAY_MERCHANT_ID,
  merchant_key: process.env.FASTPAY_MERCHANT_KEY,
  sandbox_url: process.env.FASTPAY_SANDBOX_URL || 'https://sandbox.payfast.co.za/eng/process',
  passphrase: process.env.FASTPAY_PASSPHRASE || '', // Optional
  is_sandbox: process.env.NODE_ENV !== 'production'
});

/**
 * Generate MD5 signature for PayFast
 * Following PayFast documentation signature format
 */
export const generatePayFastSignature = (data, passphrase = '') => {
  try {
    // Create parameter string
    let pfParamString = '';
    
    // PayFast requires specific order - as provided in data object
    for (const key in data) {
      if (data.hasOwnProperty(key) && data[key] !== '' && key !== 'signature') {
        pfParamString += `${key}=${encodeURIComponent(String(data[key]).trim()).replace(/%20/g, '+')}&`;
      }
    }
    
    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);
    
    // Add passphrase if provided
    if (passphrase) {
      pfParamString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }
    
    // Generate MD5 hash
    const signature = crypto.createHash('md5').update(pfParamString).digest('hex');
    
    console.log('PayFast Signature Generation:', {
      paramString: pfParamString.substring(0, 100) + '...',
      signature
    });
    
    return signature;
  } catch (error) {
    console.error('Signature generation error:', error);
    throw error;
  }
};

/**
 * Create PayFast payment form data
 * Returns form fields to be posted to PayFast
 */
export const createPayFastPayment = async (paymentData) => {
  try {
    const config = getPayFastConfig();
    const { orderId, amount, customerEmail, customerName, customerPhone } = paymentData;

    // Validate required fields
    if (!orderId || !amount) {
      return {
        success: false,
        error: 'Missing required payment data: orderId and amount'
      };
    }

    if (!config.merchant_id || !config.merchant_key) {
      return {
        success: false,
        error: 'PayFast credentials not configured in environment variables'
      };
    }

    // Split customer name
    const nameParts = customerName ? customerName.split(' ') : ['Customer', ''];
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Format phone number for South Africa (10 digits starting with 0)
    let formattedPhone = '';
    if (customerPhone) {
      // Remove all non-numeric characters
      const cleaned = customerPhone.replace(/\D/g, '');
      
      // Format to South African number (0XXXXXXXXX - 10 digits)
      if (cleaned.length >= 9) {
        if (cleaned.startsWith('27')) {
          // Convert +27 format to 0 format
          formattedPhone = '0' + cleaned.substring(2, 11);
        } else if (cleaned.startsWith('0')) {
          // Already in correct format
          formattedPhone = cleaned.substring(0, 10);
        } else {
          // Assume local number, add 0 prefix
          formattedPhone = '0' + cleaned.substring(0, 9);
        }
      }
    }
    
    // If no valid phone, use default test number for sandbox
    if (!formattedPhone || formattedPhone.length !== 10) {
      formattedPhone = '0823456789'; // Valid test number for sandbox
    }

    // Prepare PayFast data in correct order (important for signature)
    const pfData = {
      // Merchant details
      merchant_id: config.merchant_id,
      merchant_key: config.merchant_key,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancelled`,
      notify_url: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/order/payfast-webhook`,
      
      // Buyer details
      name_first: firstName,
      name_last: lastName,
      email_address: customerEmail || 'customer@foodverse.com',
      cell_number: formattedPhone, // Always include formatted phone number
      
      // Transaction details
      m_payment_id: orderId.toString(), // Our order ID
      amount: parseFloat(amount).toFixed(2),
      item_name: `FoodVerse Order #${orderId}`,
      item_description: `Food delivery order ${orderId}`,
      
      // Email confirmation
      email_confirmation: '1',
      confirmation_address: customerEmail || 'customer@foodverse.com'
    };

    // Generate signature
    pfData.signature = generatePayFastSignature(pfData, config.passphrase);
    
    // Get payment URL
    const paymentUrl = config.sandbox_url;

    console.log('PayFast Payment Created:', {
      orderId,
      amount: pfData.amount,
      merchant_id: pfData.merchant_id,
      paymentUrl
    });

    return {
      success: true,
      paymentUrl,
      formData: pfData,
      orderId
    };

  } catch (error) {
    console.error('PayFast payment creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify PayFast signature from return data
 */
export const verifyPayFastSignature = (data) => {
  try {
    const config = getPayFastConfig();
    const receivedSignature = data.signature;
    
    if (!receivedSignature) {
      return false;
    }

    // Create data object without signature
    const dataWithoutSignature = { ...data };
    delete dataWithoutSignature.signature;
    
    // Generate expected signature
    const expectedSignature = generatePayFastSignature(dataWithoutSignature, config.passphrase);
    
    const isValid = expectedSignature === receivedSignature;
    
    console.log('Signature Verification:', {
      received: receivedSignature,
      expected: expectedSignature,
      isValid
    });
    
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

/**
 * Get PayFast configuration for frontend
 */
export const getPayFastPublicConfig = () => {
  const config = getPayFastConfig();
  return {
    merchant_id: config.merchant_id,
    sandbox_url: config.sandbox_url
  };
};

/**
 * Validate PayFast IP address
 * Checks if request comes from valid PayFast servers
 */
export const validatePayFastIP = (ipAddress) => {
  const validHosts = [
    'www.payfast.co.za',
    'sandbox.payfast.co.za',
    'w1w.payfast.co.za',
    'w2w.payfast.co.za'
  ];

  // For localhost testing, allow local IPs
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Get all valid IPs from PayFast hostnames
  const dns = require('dns').promises;
  
  return new Promise(async (resolve) => {
    try {
      let validIps = [];
      
      for (const host of validHosts) {
        try {
          const addresses = await dns.resolve4(host);
          validIps = [...validIps, ...addresses];
        } catch (err) {
          console.error(`DNS lookup failed for ${host}:`, err.message);
        }
      }
      
      // Remove duplicates
      validIps = [...new Set(validIps)];
      
      const isValid = validIps.includes(ipAddress);
      console.log('IP Validation:', { ipAddress, isValid, validIps: validIps.slice(0, 3) });
      
      resolve(isValid);
    } catch (error) {
      console.error('IP validation error:', error);
      resolve(false);
    }
  });
};

/**
 * Validate payment amount
 * Compares expected amount with amount received from PayFast
 */
export const validatePaymentAmount = (expectedAmount, receivedAmount) => {
  const expected = parseFloat(expectedAmount);
  const received = parseFloat(receivedAmount);
  
  // Allow for floating point precision errors (difference < 0.01)
  const isValid = Math.abs(expected - received) < 0.01;
  
  console.log('Amount Validation:', {
    expected,
    received,
    difference: Math.abs(expected - received),
    isValid
  });
  
  return isValid;
};

/**
 * Server-side validation with PayFast
 * Confirms payment details with PayFast servers
 */
export const validatePayFastPayment = async (pfData) => {
  try {
    const config = getPayFastConfig();
    const https = require('https');
    const querystring = require('querystring');
    
    // Build parameter string (without signature)
    let pfParamString = '';
    for (const key in pfData) {
      if (pfData.hasOwnProperty(key) && key !== 'signature') {
        pfParamString += `${key}=${encodeURIComponent(String(pfData[key]).trim()).replace(/%20/g, '+')}&`;
      }
    }
    pfParamString = pfParamString.slice(0, -1);
    
    const validationUrl = config.is_sandbox
      ? 'https://sandbox.payfast.co.za/eng/query/validate'
      : 'https://www.payfast.co.za/eng/query/validate';
    
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(validationUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(pfParamString)
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const isValid = data.trim() === 'VALID';
          console.log('PayFast Server Validation:', { response: data.trim(), isValid });
          resolve(isValid);
        });
      });
      
      req.on('error', (error) => {
        console.error('PayFast validation request error:', error);
        reject(error);
      });
      
      req.write(pfParamString);
      req.end();
    });
    
  } catch (error) {
    console.error('PayFast server validation error:', error);
    return false;
  }
};
