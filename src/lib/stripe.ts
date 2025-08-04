import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;

export const isStripeConfigured = !!stripePublishableKey;

// Payment method configurations
export const paymentMethods = [
  { 
    id: 'cash_on_delivery', 
    label: 'Cash on Delivery', 
    icon: 'Banknote',
    available: true,
    description: 'Pay when your order is delivered'
  },
  { 
    id: 'mpesa', 
    label: 'M-Pesa', 
    icon: 'Smartphone',
    available: true,
    description: 'Pay using M-Pesa mobile money'
  },
  { 
    id: 'tigo_pesa', 
    label: 'Tigo Pesa', 
    icon: 'Smartphone',
    available: true,
    description: 'Pay using Tigo Pesa mobile money'
  },
  { 
    id: 'airtel_money', 
    label: 'Airtel Money', 
    icon: 'Smartphone',
    available: true,
    description: 'Pay using Airtel Money mobile money'
  },
  { 
    id: 'stripe', 
    label: 'Credit/Debit Card', 
    icon: 'CreditCard',
    available: isStripeConfigured,
    description: 'Pay securely with your card'
  },
];

export const getAvailablePaymentMethods = () => {
  return paymentMethods.filter(method => method.available);
};

// Stripe payment processing
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};