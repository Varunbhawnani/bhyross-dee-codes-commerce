import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  path: string;
  description: string | null;
  brand: string | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useCategories = (brand?: 'bhyross' | 'deecodes' | 'imcolus') => {
  return useQuery({
    queryKey: ['categories', brand],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (brand) {
        query = query.or(`brand.eq.${brand},brand.is.null`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Category;
    },
    enabled: !!id,
  });
};