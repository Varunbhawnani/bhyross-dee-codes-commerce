import React, { createContext, useContext, ReactNode } from 'react';
import { useWishlist as useWishlistHook, WishlistItem } from '@/hooks/useWishlist';
import { useAnalytics } from '@/hooks/useAnalytics';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  toggleWishlistItem: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const wishlistMethods = useWishlistHook();
  const analytics = useAnalytics();

  // Enhanced wishlist methods with analytics
  const enhancedWishlistMethods: WishlistContextType = {
    ...wishlistMethods,
    
    addToWishlist: async (productId: string): Promise<boolean> => {
      const result = await wishlistMethods.addToWishlist(productId);
      
      if (result) {
        // After adding, refresh to get the updated wishlist with product details
        await wishlistMethods.refreshWishlist();
        
        // Find the product in wishlist to track it
        const wishlistItem = wishlistMethods.wishlistItems.find(item => item.product_id === productId);
        
        if (wishlistItem?.products) {
          analytics.trackCustomEvent('add_to_wishlist', {
            currency: 'INR',
            value: wishlistItem.products.price || 0,
            items: [{
              item_id: wishlistItem.products.id,
              item_name: wishlistItem.products.name,
              item_category: wishlistItem.products.category || 'Unknown',
              item_brand: wishlistItem.products.brand || 'Unknown',
              price: wishlistItem.products.price || 0,
              quantity: 1,
            }]
          });
        }
      }
      
      return result;
    },

    removeFromWishlist: async (productId: string): Promise<boolean> => {
      // Find the product before removing to track it
      const wishlistItem = wishlistMethods.wishlistItems.find(item => item.product_id === productId);
      
      const result = await wishlistMethods.removeFromWishlist(productId);
      
      if (result && wishlistItem?.products) {
        analytics.trackCustomEvent('remove_from_wishlist', {
          currency: 'INR',
          value: wishlistItem.products.price || 0,
          items: [{
            item_id: wishlistItem.products.id,
            item_name: wishlistItem.products.name,
            item_category: wishlistItem.products.category || 'Unknown',
            item_brand: wishlistItem.products.brand || 'Unknown',
            price: wishlistItem.products.price || 0,
            quantity: 1,
          }]
        });
      }
      
      return result;
    },

    toggleWishlistItem: async (productId: string): Promise<boolean> => {
      const wasInWishlist = wishlistMethods.isInWishlist(productId);
      
      if (wasInWishlist) {
        return await enhancedWishlistMethods.removeFromWishlist(productId);
      } else {
        return await enhancedWishlistMethods.addToWishlist(productId);
      }
    },

    clearWishlist: async (): Promise<boolean> => {
      // Track wishlist clear event
      if (wishlistMethods.wishlistItems.length > 0) {
        analytics.trackCustomEvent('wishlist_cleared', {
          currency: 'INR',
          items_count: wishlistMethods.wishlistItems.length,
        });
      }
      
      return await wishlistMethods.clearWishlist();
    },
  };

  return (
    <WishlistContext.Provider value={enhancedWishlistMethods}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Export types
export type { WishlistItem } from '@/hooks/useWishlist';