import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
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
    product_images?: {
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean | null;
      sort_order: number | null;
      product_id: string;
      variant_id: string | null;
      created_at: string | null;
    }[];
  } | null;
  product_variants?: {
    id: string;
    color_name: string | null;
    product_id: string;
    is_active: boolean | null;
    is_default_color: boolean | null;
    sku: string | null;
    stock_quantity: number | null;
    created_at: string | null;
    product_images: {
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean | null;
      sort_order: number | null;
      product_id: string;
      variant_id: string | null;
      created_at: string | null;
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
      
      console.log('🔍 Fetching wishlist for user:', user.id);
      
      // Query with both products and product_images joined, including variant support
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
              is_primary,
              sort_order,
              product_id,
              variant_id,
              created_at
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

      // Fetch variant data separately for items that have variant_id
      const wishlistItemsWithVariants = await Promise.all(
        (data || []).map(async (item) => {
          let variantData = null;
          
          if (item.variant_id) {
            const { data: variant, error: variantError } = await supabase
              .from('product_variants')
              .select(`
                *,
                product_images (
                  id,
                  image_url,
                  alt_text,
                  is_primary,
                  sort_order,
                  product_id,
                  variant_id,
                  created_at
                )
              `)
              .eq('id', item.variant_id)
              .single();
              
            if (!variantError && variant) {
              variantData = variant;
            }
          }
          
          return {
            ...item,
            product_variants: variantData
          };
        })
      );

      setWishlistItems(wishlistItemsWithVariants as WishlistItem[]);
      console.log('✅ Wishlist items loaded:', wishlistItemsWithVariants?.length || 0);
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

  // Add item to wishlist with variant support
  const addToWishlist = async (productId: string, variantId?: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('🔍 Adding to wishlist:', { userId: user.id, productId, variantId });

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

      // If variantId is provided, validate it
      if (variantId) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('id')
          .eq('id', variantId)
          .eq('product_id', productId)
          .single();

        if (variantError || !variant) {
          toast({
            title: "Error",
            description: "Product variant not found",
            variant: "destructive",
          });
          return false;
        }
      }

      // Check if item already exists in wishlist (considering variant)
      let existingQuery = supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId);

      // Handle variant_id properly - check for null vs actual value
      if (variantId) {
        existingQuery = existingQuery.eq('variant_id', variantId);
      } else {
        existingQuery = existingQuery.is('variant_id', null);
      }

      const { data: existingItem, error: existingError } = await existingQuery.single();

      console.log('🔍 Existing item check:', { existingItem, existingError });

      if (existingItem) {
        toast({
          title: "Already in wishlist",
          description: "Item is already in your wishlist",
        });
        return false;
      }

      // Insert new wishlist item
      const insertData = {
        user_id: user.id,
        product_id: productId,
        variant_id: variantId || null,
      };

      const { data: insertData_result, error: insertError } = await supabase
        .from('wishlist')
        .insert([insertData])
        .select();

      console.log('🔍 Insert result:', { insertData_result, insertError });

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
      // Refresh wishlist
      await fetchWishlistItems();
      
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

  // Remove item from wishlist with variant support
  const removeFromWishlist = async (productId: string, variantId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🔍 Removing from wishlist:', { userId: user.id, productId, variantId });

      let deleteQuery = supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      // Handle variant_id properly
      if (variantId) {
        deleteQuery = deleteQuery.eq('variant_id', variantId);
      } else {
        deleteQuery = deleteQuery.is('variant_id', null);
      }

      const { error } = await deleteQuery;

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
      // Refresh wishlist
      await fetchWishlistItems();
      
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

  // Toggle wishlist item with variant support
  const toggleWishlistItem = async (productId: string, variantId?: string): Promise<boolean> => {
  // Check if product exists in wishlist (any variant)
  const existingItem = wishlistItems.find(item => item.product_id === productId);
  
  if (existingItem) {
    // If product exists but with different variant, update the variant
    if (existingItem.variant_id !== (variantId || null)) {
      // Remove existing item and add new one with different variant
      await removeFromWishlist(productId, existingItem.variant_id || undefined);
      return await addToWishlist(productId, variantId);
    } else {
      // Same variant, just remove it
      return await removeFromWishlist(productId, variantId);
    }
  } else {
    // Product not in wishlist, add it
    return await addToWishlist(productId, variantId);
  }
};

  // Check if item is in wishlist with variant support
  const isInWishlist = (productId: string, variantId?: string): boolean => {
  // If no variantId provided, check if product exists with any variant
  if (variantId === undefined) {
    return wishlistItems.some(item => item.product_id === productId);
  }
  
  // If variantId provided, check for specific variant
  return wishlistItems.some(item => 
    item.product_id === productId && 
    item.variant_id === (variantId || null)
  );
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