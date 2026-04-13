import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { deleteProductImage } from '@/utils/imageUpload';
import { useToast } from '@/hooks/use-toast';

export interface ProductFormData {
  name: string;
  description: string;
  brand: 'bhyross' | 'deecodes' | 'imcolus';
  category: string;  // Changed from enum to string
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
      // Use a transaction to ensure both product and default variant are created together
      const { data, error } = await supabase.rpc('create_product_with_default_variant', {
        product_data: {
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          category: productData.category,
          price: productData.price,
          stock_quantity: productData.stock_quantity || 1,
          sizes: productData.sizes,
          is_active: true
        }
      });

      if (error) {
        console.error('RPC Error:', error);
        // Fallback to the new method that doesn't create default variant
        return await createProductFallback(productData);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
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

  // Fallback method that creates ONLY the product, no default variant
  const createProductFallback = async (productData: ProductFormData) => {
    // Don't include images in the product creation - they're managed separately
    const { images, ...dbData } = productData;
    
    // Create ONLY the product - let ColorVariantManager handle variants
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{...dbData, stock_quantity: dbData.stock_quantity || 1, default_variant_id: null}])
      .select()
      .single();

    if (productError) throw productError;

    return product;
  };

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
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
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
            images.map(img => deleteProductImage(img.image_url))
          );
        }

        // Delete the product from database (variants will be cascade deleted)
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
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
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