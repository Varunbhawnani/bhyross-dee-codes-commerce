
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeaturedProduct {
  id: string;
  product_id: string;
  brand: 'bhyross' | 'deecodes';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  products?: any;
}

export const useFeaturedProducts = (brand: 'bhyross' | 'deecodes') => {
  return useQuery({
    queryKey: ['featured-products', brand],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_products')
        .select(`
          *,
          products (
            id,
            name,
            price,
            product_images (
              id,
              image_url,
              is_primary,
              sort_order
            )
          )
        `)
        .eq('brand', brand)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as FeaturedProduct[];
    },
  });
};

export const useAllFeaturedProducts = () => {
  return useQuery({
    queryKey: ['all-featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_products')
        .select(`
          *,
          products (
            id,
            name,
            price,
            brand,
            category,
            product_images (
              id,
              image_url,
              is_primary,
              sort_order
            )
          )
        `)
        .order('brand')
        .order('sort_order');

      if (error) throw error;
      return data as FeaturedProduct[];
    },
  });
};

export const useFeaturedProductOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addFeaturedProduct = useMutation({
    mutationFn: async (data: { product_id: string; brand: 'bhyross' | 'deecodes'; sort_order?: number }) => {
      const { data: result, error } = await supabase
        .from('featured_products')
        .insert([{ ...data, sort_order: data.sort_order || 0 }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-featured-products'] });
      toast({
        title: "Success",
        description: "Product added to featured collection",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to featured collection",
        variant: "destructive",
      });
    },
  });

  const removeFeaturedProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('featured_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-featured-products'] });
      toast({
        title: "Success",
        description: "Product removed from featured collection",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove product from featured collection",
        variant: "destructive",
      });
    },
  });

  return {
    addFeaturedProduct: addFeaturedProduct.mutate,
    removeFeaturedProduct: removeFeaturedProduct.mutate,
    isAdding: addFeaturedProduct.isPending,
    isRemoving: removeFeaturedProduct.isPending,
  };
};
