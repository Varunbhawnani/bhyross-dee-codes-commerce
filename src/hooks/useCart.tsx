import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { triggerCartWebhook } from '@/utils/webhookService';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  size: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    brand: string;
    product_images: Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean | null;
      sort_order: number | null;
      product_id: string;
      variant_id: string | null;
      created_at: string | null;
    }>;
  };
  product_variants?: {
    id: string;
    color_name: string | null;
    product_id: string;
    is_active: boolean | null;
    is_default_color: boolean | null;
    sku: string | null;
    stock_quantity: number | null;
    created_at: string | null;
    product_images: Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean | null;
      sort_order: number | null;
      product_id: string;
      variant_id: string | null;
      created_at: string | null;
    }>;
  };
}

export interface GuestCartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  size: number;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    brand: string;
    product_images: Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean | null;
      sort_order: number | null;
      product_id: string;
      variant_id: string | null;
      created_at: string | null;
    }>;
  };
  product_variants?: {
    id: string;
    color_name: string | null;
    product_id: string;
    is_active: boolean | null;
    is_default_color: boolean | null;
    sku: string | null;
    stock_quantity: number | null;
    created_at: string | null;
    product_images: Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean | null;
      sort_order: number | null;
      product_id: string;
      variant_id: string | null;
      created_at: string | null;
    }>;
  };
}

const GUEST_CART_KEY = 'guest_cart';

export const useCart = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);

  // Load guest cart from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      if (savedCart) {
        try {
          setGuestCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error parsing guest cart:', error);
          setGuestCart([]);
        }
      }
    }
  }, [user]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!user) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    }
  }, [guestCart, user]);

  // Fetch authenticated user's cart
  const { data: userCartItems = [], isLoading: userCartLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          product_id,
          variant_id,
          quantity,
          size,
          created_at,
          updated_at,
          products (
            id,
            name,
            price,
            brand,
            product_images (
              *
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch variant data separately for items that have variant_id
      const cartItemsWithVariants = await Promise.all(
        (data || []).map(async (item) => {
          let variantData = null;
          
          if (item.variant_id) {
            const { data: variant, error: variantError } = await supabase
              .from('product_variants')
              .select(`
                *,
                product_images (
                  *
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

      return cartItemsWithVariants as CartItem[];
    },
    enabled: !!user && !authLoading,
  });

  // Merge guest cart with user cart when user logs in
  useEffect(() => {
    const mergeGuestCartWithUserCart = async () => {
      if (user && guestCart.length > 0 && !userCartLoading) {
        console.log('Merging guest cart with user cart...');
        
        for (const guestItem of guestCart) {
          try {
            // Check if item already exists in user cart
            const existingUserItem = userCartItems.find(
              item => item.product_id === guestItem.product_id && 
                     item.variant_id === guestItem.variant_id && 
                     item.size === guestItem.size
            );

            if (existingUserItem) {
              // Update quantity
              await supabase
                .from('cart_items')
                .update({ quantity: existingUserItem.quantity + guestItem.quantity })
                .eq('id', existingUserItem.id);
            } else {
              // Insert new item
              await supabase
                .from('cart_items')
                .insert({
                  user_id: user.id,
                  product_id: guestItem.product_id,
                  variant_id: guestItem.variant_id,
                  size: guestItem.size,
                  quantity: guestItem.quantity,
                });
            }
          } catch (error) {
            console.error('Error merging guest cart item:', error);
          }
        }

        // Clear guest cart
        setGuestCart([]);
        localStorage.removeItem(GUEST_CART_KEY);
        
        // Refresh user cart
        queryClient.invalidateQueries({ queryKey: ['cart', user.id] });
        
        toast({
          title: "Cart merged",
          description: "Your guest cart items have been added to your account.",
        });
      }
    };

    mergeGuestCartWithUserCart();
  }, [user, guestCart, userCartItems, userCartLoading, queryClient, toast]);

  // Get current cart items (guest or user)
  const cartItems = user ? userCartItems : guestCart;
  const isLoading = user ? userCartLoading : false;

  // Guest cart functions
  const addToGuestCart = async (params: { productId: string; variantId?: string; size: number; quantity?: number }) => {
    try {
      // Fetch product details
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          brand,
          product_images (
            *
          )
        `)
        .eq('id', params.productId)
        .single();

      // Fetch variant data if variantId is provided
      let variantData = null;
      if (params.variantId) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select(`
            *,
            product_images (
              *
            )
          `)
          .eq('id', params.variantId)
          .single();
        
        if (!variantError) {
          variantData = variant;
        }
      }

      if (error) throw error;

      const itemId = `${params.productId}-${params.variantId || 'default'}-${params.size}`;
      const existingItemIndex = guestCart.findIndex(item => 
        item.product_id === params.productId && 
        item.variant_id === (params.variantId || null) && 
        item.size === params.size
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        const updatedCart = [...guestCart];
        updatedCart[existingItemIndex].quantity += params.quantity || 1;
        setGuestCart(updatedCart);
      } else {
        // Add new item
        const newItem: GuestCartItem = {
          id: itemId,
          product_id: params.productId,
          variant_id: params.variantId || null,
          quantity: params.quantity || 1,
          size: params.size,
          created_at: new Date().toISOString(),
          products: {
            id: product.id,
            name: product.name,
            price: product.price,
            brand: product.brand,
            product_images: product.product_images,
          },
          product_variants: variantData,
        };
        setGuestCart([...guestCart, newItem]);
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateGuestCartQuantity = (params: { id: string; quantity: number }) => {
    if (params.quantity <= 0) {
      // Remove item
      setGuestCart(guestCart.filter(item => item.id !== params.id));
    } else {
      // Update quantity
      setGuestCart(guestCart.map(item => 
        item.id === params.id ? { ...item, quantity: params.quantity } : item
      ));
    }
  };

  const removeFromGuestCart = (id: string) => {
    setGuestCart(guestCart.filter(item => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const clearGuestCart = () => {
    setGuestCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  // Authenticated user cart mutations
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, variantId, size, quantity = 1 }: { productId: string; variantId?: string; size: number; quantity?: number }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('=== ADD TO CART DEBUG ===');
      console.log('1. Input params:', { productId, variantId, size, quantity });
      console.log('2. User ID:', user.id);

      // Get product details for webhook
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, brand')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Check if item already exists - CRITICAL: proper NULL handling
      let existingItemsQuery = supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size);

      // CRITICAL: Use .is() for null, .eq() for actual values
      if (variantId) {
        console.log('3. Checking for existing item WITH variant_id:', variantId);
        existingItemsQuery = existingItemsQuery.eq('variant_id', variantId);
      } else {
        console.log('3. Checking for existing item WITHOUT variant_id (NULL)');
        existingItemsQuery = existingItemsQuery.is('variant_id', null);
      }

      const { data: existingItems, error: queryError } = await existingItemsQuery;
      
      console.log('4. Query error:', queryError);
      console.log('5. Existing items found:', existingItems);
      console.log('6. Number of existing items:', existingItems?.length || 0);

      if (queryError) {
        console.error('Query error details:', queryError);
        throw queryError;
      }

      const existingItem = existingItems?.[0];
      let result;
      let finalQuantity = quantity;

      if (existingItem) {
        // UPDATE existing item
        finalQuantity = existingItem.quantity + quantity;
        console.log('7. UPDATING existing item. New quantity:', finalQuantity);
        
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: finalQuantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) {
          console.error('8. UPDATE error:', error);
          throw error;
        }
        console.log('9. UPDATE success:', data);
        result = data;
      } else {
        // INSERT new item
        console.log('7. INSERTING new item');
        
        const insertData = {
          user_id: user.id,
          product_id: productId,
          variant_id: variantId || null,
          size,
          quantity,
        };

        console.log('8. Insert data:', insertData);

        const { data, error } = await supabase
          .from('cart_items')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('9. INSERT error:', error);
          throw error;
        }
        console.log('10. INSERT success:', data);
        result = data;
      }

      console.log('=== END DEBUG ===');

      // Trigger webhook
      try {
        const webhookPayload = {
          event: "item_added_to_cart",
          timestamp: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email || "",
          },
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
          },
          cartItem: {
            quantity: finalQuantity,
            size: size,
            variantId: variantId || null,
          },
          message: `Customer ${user.email} added ${quantity} x ${product.name} (Size: ${size}) to cart. Total quantity: ${finalQuantity}`
        };

        triggerCartWebhook(webhookPayload).catch(error => {
          console.error("Webhook trigger failed:", error);
        });
      } catch (error) {
        console.error("Failed to trigger webhook:", error);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: any) => {
      console.error('Add to cart error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
  });

  // Unified functions that work for both guest and authenticated users
  const addToCart = (params: { productId: string; variantId?: string; size: number; quantity?: number }) => {
    // Normalize variantId: convert empty string or null to undefined
    const normalizedParams = {
      ...params,
      variantId: params.variantId || undefined
    };
    
    if (user) {
      addToCartMutation.mutate(normalizedParams);
    } else {
      addToGuestCart(normalizedParams);
    }
  };

  const updateQuantity = (params: { id: string; quantity: number }) => {
    if (user) {
      updateQuantityMutation.mutate(params);
    } else {
      updateGuestCartQuantity(params);
    }
  };

  const removeFromCart = (id: string) => {
    if (user) {
      removeFromCartMutation.mutate(id);
    } else {
      removeFromGuestCart(id);
    }
  };

  const clearCart = () => {
    if (user) {
      clearCartMutation.mutate();
    } else {
      clearGuestCart();
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return {
    cartItems,
    isLoading,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    toggleCart,
  };
};