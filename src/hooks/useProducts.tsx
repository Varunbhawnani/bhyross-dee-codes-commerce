import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
  created_at: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color_name: string | null;
  is_default_color: boolean | null;
  is_active: boolean | null;
  sku: string | null;
  stock_quantity: number | null;
  created_at: string | null;
  product_images: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: 'bhyross' | 'deecodes' | 'imcolus';
  category: string;  // Changed from enum to string
  price: number;
  stock_quantity: number;
  sizes: number[] | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
  default_variant_id: string | null;
  product_variants: ProductVariant[];
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

// Helper function to sort product images
const sortProductImages = (images: ProductImage[]): ProductImage[] => {
  return images.sort((a, b) => {
    // Primary images first, then by sort_order
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
};

// Helper function to process product variants
const processProductVariants = (variants: any, filterInactive: boolean = true): ProductVariant[] => {
  if (!Array.isArray(variants)) return [];
  
  let processedVariants = variants;
  
  if (filterInactive) {
    processedVariants = variants.filter(variant => variant.is_active !== false);
  }
  
  return processedVariants
    .sort((a, b) => {
      // Default variant first, then alphabetical
      if (a.is_default_color && !b.is_default_color) return -1;
      if (!a.is_default_color && b.is_default_color) return 1;
      return (a.color_name || '').localeCompare(b.color_name || '');
    })
    .map(variant => ({
      ...variant,
      product_images: sortProductImages(variant.product_images || [])
    }));
};

// Public hook for customer-facing products (with variants)
export const useProducts = (brand?: 'bhyross' | 'deecodes' | 'imcolus', category?: string) => {
  return useQuery({
    queryKey: ['products', brand, category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_variants!product_variants_product_id_fkey (
            id,
            color_name,
            is_default_color,
            is_active,
            sku,
            stock_quantity,
            product_images (
              id,
              image_url,
              alt_text,
              is_primary,
              sort_order,
              variant_id,
              product_id,
              created_at
            )
          )
        `)
        .eq('is_active', true);

      if (brand && ['bhyross', 'deecodes', 'imcolus'].includes(brand)) {
        query = query.eq('brand', brand);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Parse sizes and process variants - ONLY show products that have active variants
      const parsedData = data?.map(product => ({
        ...product,
        sizes: parseJsonArray(product.sizes),
        product_variants: processProductVariants(product.product_variants)
      })).filter(product => product.product_variants.length > 0) || [];

      return parsedData as Product[];
    },
  });
};

// Admin hook for all products (including those without variants)
export const useAllProducts = (brand?: 'bhyross' | 'deecodes' | 'imcolus', category?: string) => {
  return useQuery({
    queryKey: ['admin-products', brand, category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_variants!product_variants_product_id_fkey (
            id,
            color_name,
            is_default_color,
            is_active,
            sku,
            stock_quantity,
            product_images (
              id,
              image_url,
              alt_text,
              is_primary,
              sort_order,
              variant_id,
              product_id,
              created_at
            )
          )
        `);

      if (brand && ['bhyross', 'deecodes', 'imcolus'].includes(brand)) {
        query = query.eq('brand', brand);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin products:', error);
        throw error;
      }

      console.log('Raw admin products data:', data);

      // Parse sizes and process variants (including inactive ones for admin)
      const parsedData = data?.map(product => ({
        ...product,
        sizes: parseJsonArray(product.sizes),
        product_variants: processProductVariants(product.product_variants || [], false)
      })) || [];

      console.log('Parsed admin products data:', parsedData);

      return parsedData as Product[];
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
          product_variants!product_variants_product_id_fkey (
            id,
            color_name,
            is_default_color,
            is_active,
            sku,
            stock_quantity,
            product_images (
              id,
              image_url,
              alt_text,
              is_primary,
              sort_order,
              variant_id,
              product_id,
              created_at
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Parse sizes and process variants
      const parsedData = {
        ...data,
        sizes: parseJsonArray(data.sizes),
        product_variants: processProductVariants(data.product_variants || [])
      };

      return parsedData as Product;
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