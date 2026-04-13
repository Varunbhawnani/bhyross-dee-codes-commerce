// File: src/hooks/useRazorpayCheckout.tsx
// Fixed version with proper TypeScript types and enhanced cart item validation

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from './useCart';
import { ShippingAddress } from '@/types/shipping';
import { RazorpayResponse, PaymentVerificationData } from '@/types/payment';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type OrderStatus = Database['public']['Enums']['order_status'];
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type ShippingStatus = 'not_shipped' | 'processing' | 'shipped' | 'delivered' | 'pending_shipment' | 'cancelled';

interface CheckoutData {
  cartItems: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: 'Prepaid' | 'COD';
  shippingCharges: number;
  codCharges: number;
}

interface PaymentState {
  isProcessing: boolean;
  isCreatingShipment: boolean;
  error: string | null;
  currentStep: 'payment' | 'verification' | 'shipment' | 'complete' | 'refund';
  orderId?: string;
}

// Enhanced CartItem interface for internal use
interface NormalizedCartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  size: number;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    price: number;
    brand: string;
    sku?: string;
    weight?: number;
    product_images: any[];
  };
}

// Type guard to check if a value is a string
const isString = (value: unknown): value is string => {
  return typeof value === 'string';
}

// Type guard to check if a value is a number
const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
}

// Extend window object to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpayCheckout = (clearCart?: () => void) => {
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    isCreatingShipment: false,
    error: null,
    currentStep: 'payment'
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const updateState = (updates: Partial<PaymentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Enhanced cart item validation and normalization with proper type handling
  const normalizeCartItems = (cartItems: CartItem[]): NormalizedCartItem[] => {
    return cartItems.map((item, index) => {
      console.log(`🔍 Normalizing cart item ${index + 1}:`, item);

      // Ensure we have a valid product ID
      const productId = item.product_id || (item as any).id;
      if (!productId || !isString(productId)) {
        throw new Error(`Cart item ${index + 1} is missing valid product ID`);
      }

      // Normalize size to number with completely safe type handling
      let normalizedSize: number = 7; // Default size
      
      // Use any type to bypass TypeScript inference issues
      const sizeValue: any = item.size;
      
      if (sizeValue !== undefined && sizeValue !== null) {
        // Check if it's already a number
        if (typeof sizeValue === 'number' && !isNaN(sizeValue)) {
          normalizedSize = sizeValue;
        } else {
          // Convert to string safely and process
          let sizeStr = '';
          try {
            sizeStr = String(sizeValue);
            if (sizeStr && typeof sizeStr === 'string') {
              sizeStr = sizeStr.replace(/\s+/g, ''); // Remove all whitespace instead of trim
              
              if (sizeStr.match(/^\d+$/)) {
                normalizedSize = parseInt(sizeStr, 10);
              } else {
                // Handle size names
                const sizeMap: Record<string, number> = {
                  'XS': 6, 'S': 7, 'M': 8, 'L': 9, 'XL': 10, 'XXL': 11
                };
                normalizedSize = sizeMap[sizeStr.toUpperCase()] || 7;
              }
            }
          } catch (e) {
            console.warn(`⚠️ Could not parse size for item ${index + 1}, using default`);
          }
        }
      }

      // Handle products data with type safety
      let products = item.products;
      
      // If products is missing, create a minimal structure
      // If products is missing, create a minimal structure
// If products is missing, create a minimal structure
if (!products) {
  products = {
    id: productId,
    name: 'Product',
    price: 0,
    brand: 'Unknown',
    product_images: []
  };
}

      // Ensure we have a valid price with type checking
      let itemPrice = 0;
      
      // First try to get price from products
      if (products.price && isNumber(products.price) && products.price > 0) {
        itemPrice = products.price;
      } 
      // Then try from item.price if it exists
      else if ((item as any).price && isNumber((item as any).price) && (item as any).price > 0) {
        itemPrice = (item as any).price;
        console.warn(`⚠️ Cart item ${index + 1} using fallback price from item.price`);
      }
      
      if (itemPrice <= 0) {
        throw new Error(`Cart item ${index + 1} has no valid price`);
      }

      // Normalize quantity with completely safe type handling
      let normalizedQuantity = 1;
      const quantityValue: any = item.quantity;
      
      if (quantityValue !== undefined && quantityValue !== null) {
        if (typeof quantityValue === 'number' && !isNaN(quantityValue)) {
          normalizedQuantity = Math.max(1, Math.floor(quantityValue));
        } else {
          // Convert to string safely and process
          try {
            const stringValue = String(quantityValue);
            const parsedQuantity = parseInt(stringValue, 10);
            if (!isNaN(parsedQuantity)) {
              normalizedQuantity = Math.max(1, parsedQuantity);
            }
          } catch (e) {
            console.warn(`⚠️ Could not parse quantity for item ${index + 1}, using default`);
          }
        }
      }

      const normalizedItem: NormalizedCartItem = {
        id: item.id || `temp_${Date.now()}_${Math.random()}`,
        product_id: productId,
        variant_id: item.variant_id || null,
        size: normalizedSize,
        quantity: normalizedQuantity,
        price: itemPrice,
        products: {
          id: products.id || productId,
          name: products.name || 'Product',
          price: itemPrice,
          brand: products.brand || 'Unknown',
          sku: (products as any).sku || `ITEM_${productId}`,
          weight: (products as any).weight || 0.9,
          product_images: products.product_images || []
        }
      };

      console.log(`✅ Normalized cart item ${index + 1}:`, normalizedItem);
      return normalizedItem;
    });
  };
  
  const handlePaymentSuccess = async (response: any, checkoutData: CheckoutData) => {
    try {
      updateState({ currentStep: 'verification', isProcessing: true });
      
      console.log('🎉 Payment successful, verifying:', response);

      // Normalize cart items before sending
      const normalizedCartItems = normalizeCartItems(checkoutData.cartItems);
      
      console.log('🔍 Sending verification request with normalized data:', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        userId: user?.id,
        cartItemsCount: normalizedCartItems.length,
        totalAmount: checkoutData.totalAmount,
        paymentMethod: checkoutData.paymentMethod
      });

      // Verify payment with backend
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          checkoutData: {
            ...checkoutData,
            userId: user?.id,
            cartItems: normalizedCartItems // Use normalized cart items
          }
        }
      });
      
      console.log('📨 Verification response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase function error:', error);
        
        // Enhanced error logging
        if (error.message) {
          console.error('❌ Error message:', error.message);
        }
        
        if (error.context) {
          console.error('❌ Error context:', error.context);
        }
        
        throw new Error(error.message || 'Payment verification failed');
      }

      // Check if payment was successful or refunded
      if (data?.success === false) {
        // Payment was refunded due to shipping failure
        updateState({ 
          currentStep: 'refund', 
          error: data.error,
          orderId: data.orderId,
          isProcessing: false 
        });
        
        navigate(`/order-refund/${data.orderId}`, { 
          state: { 
            refundReason: data.error,
            refundId: data.refund_id,
            paymentId: response.razorpay_payment_id 
          } 
        });
        return;
      }
      
      // Payment successful and shipping initiated
      // Payment successful and shipping initiated
updateState({ currentStep: 'complete', isProcessing: false });

// Clear cart only after successful payment confirmation
if (clearCart) {
  clearCart();
}

navigate(`/order-success/${data?.orderId}`, { 
  state: { 
    paymentId: response.razorpay_payment_id,
    paymentMethod: 'Prepaid'
  } 
});
      
    } catch (error) {
      console.error('💥 Payment verification failed:', error);
      
      let errorMessage = 'Payment verification failed. Please contact support.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific errors
        if (error.message.includes('Cart item') && error.message.includes('missing')) {
          errorMessage = 'There was an issue with your cart items. Please refresh and try again.';
        } else if (error.message.includes('signature verification failed')) {
          errorMessage = 'Payment verification failed. Your payment may have been processed - please check with support.';
        } else if (error.message.includes('environment variable')) {
          errorMessage = 'Payment service temporarily unavailable. Please try again later.';
        }
      }
      
      updateState({ 
        error: errorMessage,
        isProcessing: false,
        currentStep: 'payment'
      });
    }
  };

  const handlePaymentFailure = (response: any) => {
    console.error('❌ Payment failed:', response);
    
    let errorMessage = 'Payment failed. Please try again.';
    
    // Handle specific Razorpay error codes
    if (response.error) {
      switch (response.error.code) {
        case 'PAYMENT_CANCELLED':
          errorMessage = 'Payment was cancelled. You can try again.';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network error occurred. Please check your connection and try again.';
          break;
        case 'INVALID_CARD':
          errorMessage = 'Invalid card details. Please check and try again.';
          break;
        case 'INSUFFICIENT_FUNDS':
          errorMessage = 'Insufficient funds. Please try with a different payment method.';
          break;
        default:
          errorMessage = response.error.description || errorMessage;
      }
    }
    
    updateState({ 
      error: errorMessage,
      isProcessing: false,
      currentStep: 'payment'
    });
  };
  
  const initiatePayment = async (checkoutData: CheckoutData) => {
    updateState({ 
      isProcessing: true, 
      error: null, 
      currentStep: 'payment' 
    });
    
    try {
      // Validate cart items first
      if (!checkoutData.cartItems || checkoutData.cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Pre-validate cart items
      try {
        normalizeCartItems(checkoutData.cartItems);
        console.log('✅ Cart items pre-validation passed');
      } catch (validationError) {
        console.error('❌ Cart items pre-validation failed:', validationError);
        throw validationError;
      }

      // Handle COD orders
      if (checkoutData.paymentMethod === 'COD') {
        console.log('🔍 Processing COD order. User:', user?.id);
        
        // Normalize cart items for COD order
        const normalizedCartItems = normalizeCartItems(checkoutData.cartItems);
        
        const formattedCheckoutData = {
          ...checkoutData,
          userId: user?.id,
          cartItems: normalizedCartItems
        };
        
        console.log('🔍 Final formatted checkout data for COD:', {
          userId: formattedCheckoutData.userId,
          cartItemsCount: formattedCheckoutData.cartItems.length,
          totalAmount: formattedCheckoutData.totalAmount,
          paymentMethod: formattedCheckoutData.paymentMethod
        });
        
        try {
          const { data, error } = await supabase.functions.invoke('create-cod-order', {
            body: {
              checkoutData: formattedCheckoutData
            }
          });

          console.log('📨 COD order response:', { data, error });

          if (error) {
            console.error('❌ COD order error:', error);
            throw new Error(error.message || 'Order creation failed');
          }

          if (data?.success === false) {
            console.error('❌ COD order failed:', data);
            updateState({ 
              error: data.error || 'Order creation failed',
              isProcessing: false 
            });
            return;
          }

          console.log('🎉 COD order created successfully:', data);
updateState({ currentStep: 'complete', isProcessing: false });

// Clear cart only after successful COD order creation
if (clearCart) {
  clearCart();
}

navigate(`/order-success/${data?.orderId}`, { 
  state: { 
    paymentMethod: 'COD'
  } 
});
return;
          
        } catch (functionError) {
          console.error('💥 COD order function error:', functionError);
          throw functionError;
        }
      }
      
      // Continue with existing Razorpay flow for prepaid orders
      console.log('💳 Creating Razorpay order for amount:', checkoutData.totalAmount);
      
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          amount: checkoutData.totalAmount,
          currency: 'INR',
          receipt: `order_${Date.now()}`
        }
      });
      
      if (error) {
        console.error('❌ Razorpay order creation error:', error);
        throw new Error(error.message || 'Failed to create payment order');
      }
      
      console.log('✅ Razorpay order created:', data);
      
      // Check if Razorpay is loaded
      // Check if Razorpay is loaded, if not load it first
      if (!window.Razorpay) {
        console.log('📦 Razorpay not loaded, loading now...');
        
        // Dynamically load Razorpay
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            console.log('✅ Razorpay loaded successfully');
            resolve();
          };
          
          script.onerror = () => {
            reject(new Error('Failed to load Razorpay. Please refresh and try again.'));
          };
          
          document.body.appendChild(script);
        });
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: import.meta.env.VITE_STORE_NAME || 'Imcolus',
        description: 'Order Payment',
        order_id: data.id,
        handler: (response: any) => handlePaymentSuccess(response, checkoutData),
        prefill: {
          name: checkoutData.shippingAddress.name,
          email: checkoutData.shippingAddress.email,
          contact: checkoutData.shippingAddress.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            updateState({ 
              isProcessing: false,
              error: 'Payment was cancelled. You can try again.'
            });
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };
      
      const rzp = new window.Razorpay(options);
      
      // Handle payment failures
      rzp.on('payment.failed', handlePaymentFailure);
      
      rzp.open();
      
    } catch (error) {
      console.error('💥 Payment initiation failed:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      updateState({ 
        error: errorMessage,
        isProcessing: false,
        currentStep: 'payment'
      });
    }
  };
  
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, []);
  
  const retryPayment = useCallback((checkoutData: CheckoutData) => {
    updateState({ error: null });
    initiatePayment(checkoutData);
  }, []);
  
  return {
    initiatePayment,
    retryPayment,
    isProcessing: state.isProcessing,
    isCreatingShipment: state.isCreatingShipment,
    error: state.error,
    currentStep: state.currentStep,
    orderId: state.orderId,
    clearError,
  };
};