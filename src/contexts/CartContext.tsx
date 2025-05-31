
import React, { createContext, useContext, ReactNode } from 'react';
import { useCart as useCartHook, CartItem } from '@/hooks/useCart';

// Define the cart context type based on your actual useCart hook
interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  isCartOpen: boolean;
  addToCart: (params: { productId: string; size: number; quantity?: number }) => void;
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
  
  return (
    <CartContext.Provider value={cartMethods}>
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

// Also export the CartItem type for other components
export type { CartItem } from '@/hooks/useCart';
