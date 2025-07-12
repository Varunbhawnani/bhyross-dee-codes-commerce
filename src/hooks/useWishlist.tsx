import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string | null;
  products?: {
    id: string;
    name: string;
    price: number;
    brand: string;
    category: string;
    description: string | null;
    images: string[] | null;
    sizes: number[] | null;
    stock_quantity: number;
    is_active: boolean | null;
    sku: string | null;
    created_at: string | null;
    updated_at: string | null;
    // Updated product_images relation - removed display_order
    product_images?: {
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean | null;
    }[];
  } | null;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch wishlist items
  const fetchWishlistItems = async () => {
    if (!user) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Debug: Log the user ID being used
      console.log('🔍 Fetching wishlist for user:', user.id);
      
      // Query with both products and product_images joined - removed display_order
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          products (
            id,
            name,
            price,
            brand,
            category,
            description,
            images,
            sizes,
            stock_quantity,
            is_active,
            sku,
            created_at,
            updated_at,
            product_images (
              id,
              image_url,
              alt_text,
              is_primary
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('🔍 Full wishlist query result:', { data, error });

      if (error) {
        console.error('❌ Full query failed:', error);
        toast({
          title: "Error",
          description: `Failed to load wishlist items: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setWishlistItems(data || []);
      console.log('✅ Wishlist items loaded:', data?.length || 0);
    } catch (error) {
      console.error('❌ Catch block error:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('🔍 Adding to wishlist:', { userId: user.id, productId });

      // First, check if the product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();

      console.log('🔍 Product check result:', { product, productError });

      if (productError || !product) {
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive",
        });
        return false;
      }

      // Check if item already exists in wishlist
      const { data: existingItem, error: existingError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      console.log('🔍 Existing item check:', { existingItem, existingError });

      if (existingItem) {
        toast({
          title: "Already in wishlist",
          description: "Item is already in your wishlist",
        });
        return false;
      }

      // Insert new wishlist item
      const { data: insertData, error: insertError } = await supabase
        .from('wishlist')
        .insert([
          {
            user_id: user.id,
            product_id: productId,
          }
        ])
        .select();

      console.log('🔍 Insert result:', { insertData, insertError });

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        toast({
          title: "Error",
          description: `Failed to add item to wishlist: ${insertError.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Refresh wishlist
      await fetchWishlistItems();
      
      toast({
        title: "Added to wishlist",
        description: "Item added to your wishlist",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Add to wishlist error:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🔍 Removing from wishlist:', { userId: user.id, productId });

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('❌ Remove error:', error);
        toast({
          title: "Error",
          description: `Failed to remove item from wishlist: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Refresh wishlist
      await fetchWishlistItems();
      
      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Remove from wishlist error:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle wishlist item
  const toggleWishlistItem = async (productId: string): Promise<boolean> => {
    const isInWishlist = wishlistItems.some(item => item.product_id === productId);
    
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  // Get wishlist count
  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  // Clear entire wishlist
  const clearWishlist = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Clear wishlist error:', error);
        toast({
          title: "Error",
          description: `Failed to clear wishlist: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      setWishlistItems([]);
      toast({
        title: "Wishlist cleared",
        description: "All items removed from your wishlist",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Clear wishlist error:', error);
      toast({
        title: "Error",
        description: "Failed to clear wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  // Load wishlist on mount and when user changes
  useEffect(() => {
    fetchWishlistItems();
  }, [user]);

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    refreshWishlist: fetchWishlistItems,
  };
};