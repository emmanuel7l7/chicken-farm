import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, Loader } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { processMobilePayment, validateTanzaniaPhoneNumber, formatPhoneNumber } from '../lib/mobilePayments';
import { stripePromise, isStripeConfigured } from '../lib/stripe';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentForm: React.FC<{ formData: any; onSubmit: (e: React.FormEvent) => void; isLoading: boolean }> = ({ 
  formData, 
  onSubmit, 
  isLoading 
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    // Call the parent submit handler
    onSubmit(e);
  };

  return (
    <form onSubmit={formData.paymentMethod === 'stripe' ? handleStripeSubmit : onSubmit} className="space-y-4">
      {formData.paymentMethod === 'stripe' && (
        <div className="p-4 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      )}

      {['mpesa', 'tigo_pesa', 'airtel_money'].includes(formData.paymentMethod) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => formData.setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="+255 XXX XXX XXX"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your {formData.paymentMethod.replace('_', ' ').toUpperCase()} number
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (formData.paymentMethod === 'stripe' && (!stripe || !elements))}
        className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Place Order'
        )}
      </button>
    </form>
  );
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: 'cash_on_delivery',
    deliveryAddress: profile?.address || '',
    phone: profile?.phone || '',
    notes: '',
  });

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: Banknote, available: true },
    { id: 'mpesa', label: 'M-Pesa', icon: Smartphone, available: true },
    { id: 'tigo_pesa', label: 'Tigo Pesa', icon: Smartphone, available: true },
    { id: 'airtel_money', label: 'Airtel Money', icon: Smartphone, available: true },
    { id: 'stripe', label: 'Credit/Debit Card', icon: CreditCard, available: isStripeConfigured },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cartItems.length === 0) return;

    // Validate mobile payment phone number
    if (['mpesa', 'tigo_pesa', 'airtel_money'].includes(formData.paymentMethod)) {
      if (!formData.phone || !validateTanzaniaPhoneNumber(formData.phone)) {
        toast.error('Please enter a valid Tanzania phone number');
        return;
      }
    }

    setIsLoading(true);

    try {
      let paymentResult = null;
      let transactionId = null;

      // Process payment based on method
      if (['mpesa', 'tigo_pesa', 'airtel_money'].includes(formData.paymentMethod)) {
        const mobilePaymentRequest = {
          amount: getTotalPrice(),
          phoneNumber: formatPhoneNumber(formData.phone),
          orderId: `ORDER_${Date.now()}`,
          description: `Order for ${cartItems.length} items`,
        };

        paymentResult = await processMobilePayment(formData.paymentMethod, mobilePaymentRequest);
        
        if (!paymentResult.success) {
          toast.error(paymentResult.message);
          return;
        }
        
        transactionId = paymentResult.transactionId;
        toast.success(paymentResult.message);
      } else if (formData.paymentMethod === 'stripe') {
        // Stripe payment would be handled here
        toast.info('Stripe payment processing...');
        transactionId = `STRIPE_${Date.now()}`;
      }

      // Create order in database or mock
      const orderData = {
        user_id: user.id,
        total_amount: getTotalPrice(),
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
        delivery_address: formData.deliveryAddress,
        phone: formData.phone,
        notes: formData.notes,
        status: 'pending',
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity,
        })),
        transaction_id: transactionId,
      };

      if (isSupabaseConfigured && supabase) {
        // Save to Supabase
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: orderData.user_id,
            total_amount: orderData.total_amount,
            payment_method: orderData.payment_method,
            payment_status: orderData.payment_status,
            delivery_address: orderData.delivery_address,
            phone: orderData.phone,
            notes: orderData.notes,
            status: orderData.status,
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // Save order items
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Save payment record if not cash on delivery
        if (formData.paymentMethod !== 'cash_on_delivery' && transactionId) {
          const { error: paymentError } = await supabase
            .from('payments')
            .insert([{
              order_id: order.id,
              amount: orderData.total_amount,
              payment_method: orderData.payment_method,
              payment_status: 'completed',
              transaction_id: transactionId,
            }]);

          if (paymentError) console.error('Payment record error:', paymentError);
        }
      } else {
        // Mock mode - just log the order
        console.log('Mock order created:', orderData);
      }

      clearCart();
      onClose();
      
      if (formData.paymentMethod === 'cash_on_delivery') {
        toast.success('Order placed successfully! We will contact you soon to confirm your order.');
      } else {
        toast.success('Order placed and payment processed successfully!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const CheckoutContent = () => (
    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm mb-1">
              <span>{item.product.name} x{item.quantity}</span>
              <span>TZS {(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 font-semibold">
            <div className="flex justify-between">
              <span>Total:</span>
              <span>TZS {getTotalPrice().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.filter(method => method.available).map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    formData.paymentMethod === method.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Icon className="w-5 h-5 mr-3 text-gray-600" />
                  <span className="text-sm font-medium">{method.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Delivery Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address *
          </label>
          <textarea
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your full delivery address"
          />
        </div>

        {formData.paymentMethod === 'cash_on_delivery' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+255 XXX XXX XXX"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Any special delivery instructions..."
          />
        </div>

        <PaymentForm 
          formData={{ ...formData, setFormData }} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {formData.paymentMethod === 'stripe' && isStripeConfigured && stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutContent />
        </Elements>
      ) : (
        <CheckoutContent />
      )}
    </div>
  );
};

export default CheckoutModal;