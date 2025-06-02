import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: 'bhyross' | 'deecodes';
  category: 'oxford' | 'derby' | 'monk-strap' | 'loafer';
  price: number;
  stock_quantity: number;
  sizes: number[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  product_images: ProductImage[];
}

// Helper function to safely parse JSON arrays from database (for sizes)
const parseJsonArray = (jsonString: any): number[] => {
  if (Array.isArray(jsonString)) {
    return jsonString;
  }
  
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error, jsonString);
      return [];
    }
  }
  
  return [];
};

// Original hook for public use (only active products)
export const useProducts = (brand?: 'bhyross' | 'deecodes', category?: 'oxford' | 'derby' | 'monk-strap' | 'loafer') => {
  return useQuery({
    queryKey: ['products', brand, category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
        `)
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

      // Parse sizes and sort product images
      const parsedData = data?.map(product => ({
        ...product,
        sizes: parseJsonArray(product.sizes) as number[],
        product_images: (product.product_images || []).sort((a: ProductImage, b: ProductImage) => {
          // Primary images first, then by sort_order
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
      })) || [];

      return parsedData;;
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
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
        `);

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

      // Parse sizes and sort product images
      const parsedData = data?.map(product => ({
        ...product,
        sizes: parseJsonArray(product.sizes) as number[],
        product_images: (product.product_images || []).sort((a: ProductImage, b: ProductImage) => {
          // Primary images first, then by sort_order
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
      })) || [];

      return parsedData;;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Parse sizes and sort product images
      const parsedData = {
        ...data,
        sizes: parseJsonArray(data.sizes) as number[],
        product_images: (data.product_images || []).sort((a: ProductImage, b: ProductImage) => {
          // Primary images first, then by sort_order
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
      };

      return parsedData;;
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
