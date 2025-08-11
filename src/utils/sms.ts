// SMS utility functions for AfricasTalking integration
// This file provides the structure for SMS sending functionality

export interface SMSRequest {
  to: string[];
  message: string;
  from?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  recipients?: Array<{
    number: string;
    status: string;
    messageId: string;
  }>;
  error?: string;
}

/**
 * Send SMS using AfricasTalking API
 * You'll need to implement the actual API integration here
 */
export const sendSMS = async (request: SMSRequest): Promise<SMSResponse> => {
  try {
    // TODO: Replace this with actual AfricasTalking API integration
    // Example implementation:
    /*
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': process.env.REACT_APP_AFRICASTALKING_API_KEY,
      },
      body: new URLSearchParams({
        username: process.env.REACT_APP_AFRICASTALKING_USERNAME,
        to: request.to.join(','),
        message: request.message,
        from: request.from || 'ChickenFarm',
      }),
    });

    const data = await response.json();
    
    if (data.SMSMessageData && data.SMSMessageData.Recipients) {
      return {
        success: true,
        recipients: data.SMSMessageData.Recipients,
      };
    }
    */

    // Mock implementation for development
    console.log('SMS Request:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful response
    return {
      success: true,
      messageId: `SMS_${Date.now()}`,
      recipients: request.to.map(number => ({
        number,
        status: 'Success',
        messageId: `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
};

/**
 * Validate phone number format for Tanzania
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Tanzania phone number patterns
  const patterns = [
    /^(\+255|255)[67]\d{8}$/, // +255 or 255 prefix
    /^0[67]\d{8}$/, // Local format starting with 0
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

/**
 * Format phone number for SMS API
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Convert to international format
  if (cleanPhone.startsWith('0')) {
    return `+255${cleanPhone.substring(1)}`;
  } else if (cleanPhone.startsWith('255')) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith('+255')) {
    return cleanPhone;
  }
  
  return cleanPhone;
};

/**
 * Bulk SMS sending utility
 */
export const sendBulkSMS = async (
  phoneNumbers: string[],
  message: string,
  from?: string
): Promise<SMSResponse> => {
  // Validate phone numbers
  const validNumbers = phoneNumbers
    .filter(phone => validatePhoneNumber(phone))
    .map(phone => formatPhoneNumber(phone));
  
  if (validNumbers.length === 0) {
    return {
      success: false,
      error: 'No valid phone numbers provided',
    };
  }
  
  return sendSMS({
    to: validNumbers,
    message,
    from,
  });
};

/**
 * Common SMS templates for the chicken farm
 */
export const SMS_TEMPLATES = {
  ORDER_CONFIRMATION: (orderNumber: string, total: string) =>
    `Your order #${orderNumber} has been confirmed. Total: ${total}. We'll contact you for delivery details. Thank you!`,
  
  ORDER_READY: (orderNumber: string) =>
    `Your order #${orderNumber} is ready for delivery. We'll contact you shortly to arrange delivery.`,
  
  PAYMENT_REMINDER: (orderNumber: string, amount: string) =>
    `Reminder: Payment of ${amount} is pending for order #${orderNumber}. Please prepare cash for delivery.`,
  
  NEW_STOCK: (products: string) =>
    `New stock available: ${products}. Contact us at +255-746-283-053 to place your order!`,
  
  PROMOTIONAL: (offer: string) =>
    `Special offer: ${offer}. Limited time only! Call +255-746-283-053 or visit our farm.`,
};