import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { deleteProductImage } from '@/utils/imageUpload';
import { useToast } from '@/hooks/use-toast';

export interface ProductFormData {
  name: string;
  description: string;
  brand: 'bhyross' | 'deecodes';
  category: 'oxford' | 'derby' | 'monk-strap' | 'loafer';
  price: number;
  stock_quantity: number;
  sizes: number[];
  images: string; // This field is ignored now - images are managed separately
}

export const useProductOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      // Don't include images in the product creation - they're managed separately
      const { images, ...dbData } = productData;
      
      const { data, error } = await supabase
        .from('products')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error) => {
      console.error('Create product error:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, productData }: { id: string; productData: ProductFormData }) => {
      // Don't include images in the product update - they're managed separately
      const { images, ...dbData } = productData;
      
      const { data, error } = await supabase
        .from('products')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update product error:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      try {
        // First, get all product images from the product_images table
        const { data: images, error: fetchError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id);

        if (fetchError) throw fetchError;

        // Delete all associated images from storage and database
        if (images && images.length > 0) {
          await Promise.allSettled(
            images.map(img => deleteProductImage(img.id, img.image_url))
          );
        }

        // Delete the product from database
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('Delete product error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete product error:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  return {
    createProduct: createProduct.mutate,
    updateProduct: updateProduct.mutate,
    deleteProduct: deleteProduct.mutate,
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
    isDeleting: deleteProduct.isPending,
  };
};