// Mobile payment gateway integrations for Tanzania

export interface MobilePaymentRequest {
  amount: number;
  phoneNumber: string;
  orderId: string;
  description?: string;
}

export interface MobilePaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  error?: string;
}

// M-Pesa Integration
export const processMpesaPayment = async (request: MobilePaymentRequest): Promise<MobilePaymentResponse> => {
  try {
    // In a real implementation, you would call the M-Pesa API
    // For now, we'll simulate the payment process
    console.log('Processing M-Pesa payment:', request);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful response
    return {
      success: true,
      transactionId: `MPESA_${Date.now()}`,
      message: 'Payment initiated successfully. Please check your phone for the payment prompt.',
    };
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    return {
      success: false,
      message: 'Failed to process M-Pesa payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Tigo Pesa Integration
export const processTigoPesaPayment = async (request: MobilePaymentRequest): Promise<MobilePaymentResponse> => {
  try {
    console.log('Processing Tigo Pesa payment:', request);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful response
    return {
      success: true,
      transactionId: `TIGO_${Date.now()}`,
      message: 'Payment initiated successfully. Please check your phone for the payment prompt.',
    };
  } catch (error) {
    console.error('Tigo Pesa payment error:', error);
    return {
      success: false,
      message: 'Failed to process Tigo Pesa payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Airtel Money Integration
export const processAirtelMoneyPayment = async (request: MobilePaymentRequest): Promise<MobilePaymentResponse> => {
  try {
    console.log('Processing Airtel Money payment:', request);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful response
    return {
      success: true,
      transactionId: `AIRTEL_${Date.now()}`,
      message: 'Payment initiated successfully. Please check your phone for the payment prompt.',
    };
  } catch (error) {
    console.error('Airtel Money payment error:', error);
    return {
      success: false,
      message: 'Failed to process Airtel Money payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Main mobile payment processor
export const processMobilePayment = async (
  paymentMethod: string,
  request: MobilePaymentRequest
): Promise<MobilePaymentResponse> => {
  switch (paymentMethod) {
    case 'mpesa':
      return processMpesaPayment(request);
    case 'tigo_pesa':
      return processTigoPesaPayment(request);
    case 'airtel_money':
      return processAirtelMoneyPayment(request);
    default:
      return {
        success: false,
        message: 'Unsupported payment method',
        error: `Payment method ${paymentMethod} is not supported`,
      };
  }
};

// Validate Tanzania phone number
export const validateTanzaniaPhoneNumber = (phoneNumber: string): boolean => {
  // Remove spaces and special characters
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Check for valid Tanzania phone number formats
  const patterns = [
    /^(\+255|255)[67]\d{8}$/, // +255 or 255 prefix
    /^0[67]\d{8}$/, // Local format starting with 0
  ];

  return patterns.some(pattern => pattern.test(cleanNumber));
};

// Format phone number for API calls
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Convert to international format
  if (cleanNumber.startsWith('0')) {
    return `+255${cleanNumber.substring(1)}`;
  } else if (cleanNumber.startsWith('255')) {
    return `+${cleanNumber}`;
  } else if (cleanNumber.startsWith('+255')) {
    return cleanNumber;
  }

  return cleanNumber;
};