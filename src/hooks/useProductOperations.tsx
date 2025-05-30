import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

export interface ProductFormData {
  name: string;
  description: string;
  brand: 'bhyross' | 'deecodes';
  category: 'oxford' | 'derby' | 'monk-strap' | 'loafer';
  price: number;
  stock_quantity: number;
  sizes: number[];
  images: string[];
  is_active?: boolean;
}

export const useProductOperations = () => {
  const queryClient = useQueryClient();

  // Create Product
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const insertData: TablesInsert<'products'> = {
        name: productData.name,
        description: productData.description,
        brand: productData.brand,
        category: productData.category,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        sizes: productData.sizes,
        images: productData.images,
        is_active: productData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update Product
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: string; productData: Partial<ProductFormData> }) => {
      const updateData: TablesUpdate<'products'> = {
        ...productData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete Product (Soft delete by setting is_active to false)
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Hard Delete Product (permanent deletion)
  const hardDeleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product permanently deleted!",
      });
    },
    onError: (error) => {
      console.error('Error permanently deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to permanently delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    hardDeleteProduct: hardDeleteProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isHardDeleting: hardDeleteProductMutation.isPending,
  };
};