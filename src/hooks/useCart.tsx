import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { triggerCartWebhook } from '@/utils/webhookService';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
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
      image_url: string;
    }>;
  };
}

export const useCart = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            brand,
            product_images (
              image_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user && !authLoading,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, size, quantity = 1 }: { productId: string; size: number; quantity?: number }) => {
      if (!user) throw new Error('User not authenticated');

      // Get product details for webhook
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, brand')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size)
        .single();

      let result;
      let finalQuantity = quantity;

      if (existingItem) {
        // Update quantity
        finalQuantity = existingItem.quantity + quantity;
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: finalQuantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            size,
            quantity,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Trigger webhook with product information
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
        },
        message: `Customer ${user.email} added ${quantity} x ${product.name} (Size: ${size}) to cart. Total quantity for this item: ${finalQuantity}. Product ID: ${product.id}, Brand: ${product.brand}, Price: ₹${product.price}`
      };

      // Trigger webhook (don't await to avoid blocking the UI)
      triggerCartWebhook(webhookPayload).catch(error => {
        console.error("Webhook trigger failed:", error);
      });

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
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    getTotalItems,
    getTotalPrice,
    toggleCart,
  };
};