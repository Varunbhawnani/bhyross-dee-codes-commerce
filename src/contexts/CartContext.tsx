import React, { createContext, useContext, ReactNode } from 'react';
import { useCart as useCartHook, CartItem, GuestCartItem } from '@/hooks/useCart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';

// Define the cart context type with variant support
interface CartContextType {
  cartItems: (CartItem | GuestCartItem)[];
  isLoading: boolean;
  isCartOpen: boolean;
  addToCart: (params: { productId: string; variantId?: string; size: number; quantity?: number }) => void;
  updateQuantity: (params: { id: string; quantity: number }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const cartMethods = useCartHook();
  const analytics = useAnalytics();
  const { user } = useAuth();

  // Enhanced cart methods with analytics
  const enhancedCartMethods = {
    ...cartMethods,
    
    addToCart: (params: { productId: string; variantId?: string; size: number; quantity?: number }) => {
  // Track the add to cart event with variant information
  const productForTracking = {
    id: params.productId,
    name: 'Product', // You'll need to get the actual product name
    price: 0, // You'll need to get the actual price
    brand: 'Unknown', // You'll need to get the actual brand
    category: 'Unknown', // You'll need to get the actual category
    size: params.size,
    variant_id: params.variantId // Include variant in tracking
  };
  
  analytics.trackAddToCart(productForTracking, params.quantity || 1);
  
  // Call the original addToCart method ONLY ONCE
  cartMethods.addToCart(params);
},
    updateQuantity: (params: { id: string; quantity: number }) => {
      // Find the current item to track the change
      const currentItem = cartMethods.cartItems.find(item => item.id === params.id);
      
      if (currentItem) {
        const quantityDiff = params.quantity - currentItem.quantity;
        
        if (quantityDiff > 0) {
          // Quantity increased - track as add to cart
          const productForTracking = {
            id: currentItem.products?.id || currentItem.product_id,
            name: currentItem.products?.name || 'Product',
            price: currentItem.products?.price || 0,
            brand: currentItem.products?.brand || 'Unknown',
            category: 'Unknown', // Add category if available in your product type
            size: currentItem.size,
            variant_id: currentItem.variant_id
          };
          
          analytics.trackAddToCart(productForTracking, quantityDiff);
        } else if (quantityDiff < 0) {
          // Quantity decreased - track as remove from cart
          const productForTracking = {
            id: currentItem.products?.id || currentItem.product_id,
            name: currentItem.products?.name || 'Product',
            price: currentItem.products?.price || 0,
            brand: currentItem.products?.brand || 'Unknown',
            category: 'Unknown', // Add category if available in your product type
            size: currentItem.size,
            variant_id: currentItem.variant_id
          };
          
          analytics.trackRemoveFromCart(productForTracking, Math.abs(quantityDiff));
        }
      }
      
      // Call the original updateQuantity method
      cartMethods.updateQuantity(params);
    },

    removeFromCart: (id: string) => {
      // Find the item being removed to track it
      const itemToRemove = cartMethods.cartItems.find(item => item.id === id);
      
      if (itemToRemove) {
        const productForTracking = {
          id: itemToRemove.products?.id || itemToRemove.product_id,
          name: itemToRemove.products?.name || 'Product',
          price: itemToRemove.products?.price || 0,
          brand: itemToRemove.products?.brand || 'Unknown',
          category: 'Unknown', // Add category if available in your product type
          size: itemToRemove.size,
          variant_id: itemToRemove.variant_id
        };
        
        analytics.trackRemoveFromCart(productForTracking, itemToRemove.quantity);
      }
      
      // Call the original removeFromCart method
      cartMethods.removeFromCart(id);
    },

    clearCart: () => {
      // Track cart clear event using custom event
      if (cartMethods.cartItems.length > 0) {
        analytics.trackCustomEvent('cart_cleared', {
          currency: 'INR',
          value: cartMethods.getTotalPrice(),
          items_count: cartMethods.cartItems.length,
          total_items: cartMethods.getTotalItems(),
          user_type: user ? 'authenticated' : 'guest'
        });
      }
      
      // Call the original clearCart method
      cartMethods.clearCart();
    },

    toggleCart: () => {
      // Track cart view when opened (using custom event since trackViewCart doesn't exist)
      if (!cartMethods.isCartOpen && cartMethods.cartItems.length > 0) {
        analytics.trackCustomEvent('view_cart', {
          currency: 'INR',
          value: cartMethods.getTotalPrice(),
          items_count: cartMethods.cartItems.length,
          total_items: cartMethods.getTotalItems(),
          user_type: user ? 'authenticated' : 'guest'
        });
      }
      
      // Call the original toggleCart method
      cartMethods.toggleCart();
    }
  };

  return (
    <CartContext.Provider value={enhancedCartMethods}>
      {children}
    </CartContext.Provider>
  );
};

// Export the hook for components to use
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Also export the CartItem types for other components
export type { CartItem, GuestCartItem } from '@/hooks/useCart';