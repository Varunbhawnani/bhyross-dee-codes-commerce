import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from './useCart';

interface CheckoutData {
  cartItems: CartItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const useRazorpayCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const initiatePayment = async (checkoutData: CheckoutData) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: checkoutData.totalAmount,
          status: 'pending',
          shipping_address: checkoutData.shippingAddress,
          billing_address: checkoutData.billingAddress || checkoutData.shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 2: Create order items
      const orderItems = checkoutData.cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.products?.id || item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: item.products?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Step 3: Create Razorpay order
      const { data: razorpayOrder, error: razorpayError } = await supabase.functions
        .invoke('create-razorpay-order', {
          body: {
            amount: checkoutData.totalAmount,
            currency: 'INR',
            receipt: `order_${orderData.id}`,
          },
        });

      if (razorpayError) throw razorpayError;

      // Step 4: Update order with Razorpay order ID
      await supabase
        .from('orders')
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq('id', orderData.id);

      // Step 5: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your .env file
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Your Store Name',
        description: 'Purchase from Your Store',
        order_id: razorpayOrder.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Step 6: Verify payment
            const { error: verifyError } = await supabase.functions
              .invoke('verify-razorpay-payment', {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderData.id,
                },
              });

            if (verifyError) throw verifyError;

            // Payment successful - redirect or show success message
            window.location.href = `/order-success/${orderData.id}`;
          } catch (error) {
            console.error('Payment verification failed:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: checkoutData.shippingAddress.name,
          email: checkoutData.shippingAddress.email,
          contact: checkoutData.shippingAddress.phone,
        },
        notes: {
          order_id: orderData.id,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setError('Payment was cancelled');
          },
        },
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        };
        document.head.appendChild(script);
      } else {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};

// Add this to your global types (create a types.d.ts file in src folder)
declare global {
  interface Window {
    Razorpay: any;
  }
}