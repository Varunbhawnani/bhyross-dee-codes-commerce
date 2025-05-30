import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: 'bhyross' | 'deecodes';
  category: 'oxford' | 'derby' | 'monk-strap' | 'loafer';
  price: number;
  stock_quantity: number;
  images: string[];
  sizes: number[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Original hook for public use (only active products)
export const useProducts = (brand?: 'bhyross' | 'deecodes', category?: 'oxford' | 'derby' | 'monk-strap' | 'loafer') => {
  return useQuery({
    queryKey: ['products', brand, category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (brand && (brand === 'bhyross' || brand === 'deecodes')) {
        query = query.eq('brand', brand);
      }

      if (category && ['oxford', 'derby', 'monk-strap', 'loafer'].includes(category)) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Product[];
    },
  });
};

// New hook for admin use (all products including inactive)
export const useAllProducts = (brand?: 'bhyross' | 'deecodes', category?: 'oxford' | 'derby' | 'monk-strap' | 'loafer') => {
  return useQuery({
    queryKey: ['admin-products', brand, category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');

      if (brand && (brand === 'bhyross' || brand === 'deecodes')) {
        query = query.eq('brand', brand);
      }

      if (category && ['oxford', 'derby', 'monk-strap', 'loafer'].includes(category)) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as Product;
    },
    enabled: !!id,
  });
};

// Hook to get product statistics for admin dashboard
export const useProductStats = () => {
  return useQuery({
    queryKey: ['product-stats'],
    queryFn: async () => {
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, is_active, stock_quantity, created_at');

      if (allError) throw allError;

      const totalProducts = allProducts.length;
      const activeProducts = allProducts.filter(p => p.is_active).length;
      const inactiveProducts = totalProducts - activeProducts;
      const lowStockProducts = allProducts.filter(p => p.stock_quantity <= 10 && p.is_active).length;
      
      // Calculate new products this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newProductsThisWeek = allProducts.filter(p => 
        new Date(p.created_at) >= oneWeekAgo
      ).length;

      return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        lowStockProducts,
        newProductsThisWeek,
      };
    },
  });
};