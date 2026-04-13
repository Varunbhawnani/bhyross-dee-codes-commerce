import React, { createContext, useContext, ReactNode } from 'react';
import { useWishlist as useWishlistHook, WishlistItem } from '@/hooks/useWishlist';
import { useAnalytics } from '@/hooks/useAnalytics';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string, variantId?: string) => Promise<boolean>;
  removeFromWishlist: (productId: string, variantId?: string) => Promise<boolean>;
  toggleWishlistItem: (productId: string, variantId?: string) => Promise<boolean>;
  isInWishlist: (productId: string, variantId?: string) => boolean;
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
    
    addToWishlist: async (productId: string, variantId?: string): Promise<boolean> => {
      const result = await wishlistMethods.addToWishlist(productId, variantId);
      
      if (result) {
        // After adding, refresh to get the updated wishlist with product details
        await wishlistMethods.refreshWishlist();
        
        // Find the product in wishlist to track it
        const wishlistItem = wishlistMethods.wishlistItems.find(item => 
          item.product_id === productId && 
          item.variant_id === (variantId || null)
        );
        
        if (wishlistItem?.products) {
          // Get variant info for tracking
          const variantInfo = variantId && wishlistItem.product_variants ? {
            variant_id: variantId,
            color_name: wishlistItem.product_variants.color_name,
          } : {};

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
              ...variantInfo,
            }]
          });
        }
      }
      
      return result;
    },

    removeFromWishlist: async (productId: string, variantId?: string): Promise<boolean> => {
      // Find the product before removing to track it
      const wishlistItem = wishlistMethods.wishlistItems.find(item => 
        item.product_id === productId && 
        item.variant_id === (variantId || null)
      );
      
      const result = await wishlistMethods.removeFromWishlist(productId, variantId);
      
      if (result && wishlistItem?.products) {
        // Get variant info for tracking
        const variantInfo = variantId && wishlistItem.product_variants ? {
          variant_id: variantId,
          color_name: wishlistItem.product_variants.color_name,
        } : {};

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
            ...variantInfo,
          }]
        });
      }
      
      return result;
    },

    toggleWishlistItem: async (productId: string, variantId?: string): Promise<boolean> => {
  // Use the updated toggleWishlistItem from the hook directly
  return await wishlistMethods.toggleWishlistItem(productId, variantId);
},

    isInWishlist: (productId: string, variantId?: string): boolean => {
      return wishlistMethods.isInWishlist(productId, variantId);
    },

    clearWishlist: async (): Promise<boolean> => {
      // Track wishlist clear event
      if (wishlistMethods.wishlistItems.length > 0) {
        const wishlistValue = wishlistMethods.wishlistItems.reduce((total, item) => {
          return total + (item.products?.price || 0);
        }, 0);

        analytics.trackCustomEvent('wishlist_cleared', {
          currency: 'INR',
          value: wishlistValue,
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