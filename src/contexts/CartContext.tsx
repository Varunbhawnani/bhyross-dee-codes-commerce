
import React, { createContext, useContext } from 'react';
import { useCart } from '@/hooks/useCart';

// Re-export the cart functionality through context for backward compatibility
const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export { useCart };
