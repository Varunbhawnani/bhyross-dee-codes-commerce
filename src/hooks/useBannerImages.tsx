import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BannerImage {
  id: string;
  brand: 'bhyross' | 'deecodes';
  image_url: string;
  title?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  product_id?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  // Optional joined data
  products?: {
    id: string;
    name: string;
    price: number;
    brand: string;
  };
  categories?: {
    id: string;
    name: string;
    path: string;
  };
}

export interface CreateBannerData {
  brand: 'bhyross' | 'deecodes';
  image_url: string;
  title?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  product_id?: string;
  category_id?: string;
}

export interface UpdateBannerData extends Partial<CreateBannerData> {
  id: string;
}

// Hook to get banners for a specific brand
export const useBannerImages = (brand: 'bhyross' | 'deecodes') => {
  return useQuery({
    queryKey: ['bannerImages', brand],
    queryFn: async (): Promise<BannerImage[]> => {
      console.log('Fetching banner images for brand:', brand);

      // Fixed query - use left joins to handle nullable foreign keys
      const { data, error } = await (supabase as any)
        .from('banner_images')
        .select(`
          *,
          products!left (
            id,
            name,
            price,
            brand
          ),
          categories!left (
            id,
            name,
            path
          )
        `)
        .eq('brand', brand)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Banner images query error:', error);
        throw error;
      }
      
      console.log('Fetched banner images:', data);
      return data as BannerImage[];
    },
  });
};

// Hook to get all banners (for admin)
export const useAllBannerImages = () => {
  return useQuery({
    queryKey: ['allBannerImages'],
    queryFn: async (): Promise<BannerImage[]> => {
      console.log('Fetching all banner images');

      // Fixed query with left joins
      const { data, error } = await (supabase as any)
        .from('banner_images')
        .select(`
          *,
          products!left (
            id,
            name,
            price,
            brand
          ),
          categories!left (
            id,
            name,
            path
          )
        `)
        .order('brand')
        .order('sort_order');

      if (error) {
        console.error('All banner images query error:', error);
        throw error;
      }
      
      console.log('Fetched all banner images:', data);
      return data as BannerImage[];
    },
  });
};

// Hook for banner CRUD operations
export const useBannerOperations = () => {
  const queryClient = useQueryClient();

  const createBanner = useMutation({
    mutationFn: async (bannerData: CreateBannerData): Promise<BannerImage> => {
      console.log('Creating banner:', bannerData);

      const { data, error } = await (supabase as any)
        .from('banner_images')
        .insert([{
          ...bannerData,
          is_active: bannerData.is_active ?? true,
          sort_order: bannerData.sort_order ?? 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Create banner error:', error);
        throw error;
      }

      console.log('Banner created:', data);
      return data as BannerImage;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bannerImages'] });
      queryClient.invalidateQueries({ queryKey: ['allBannerImages'] });
      toast.success('Banner created successfully');
    },
    onError: (error) => {
      console.error('Create banner failed:', error);
      toast.error('Failed to create banner: ' + (error as Error).message);
    }
  });

  const updateBanner = useMutation({
    mutationFn: async (bannerData: UpdateBannerData): Promise<BannerImage> => {
      console.log('Updating banner:', bannerData);

      const { id, ...updateData } = bannerData;
      
      const { data, error } = await (supabase as any)
        .from('banner_images')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update banner error:', error);
        throw error;
      }

      console.log('Banner updated:', data);
      return data as BannerImage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bannerImages'] });
      queryClient.invalidateQueries({ queryKey: ['allBannerImages'] });
      toast.success('Banner updated successfully');
    },
    onError: (error) => {
      console.error('Update banner failed:', error);
      toast.error('Failed to update banner: ' + (error as Error).message);
    }
  });

  const deleteBanner = useMutation({
    mutationFn: async (bannerId: string): Promise<void> => {
      console.log('Deleting banner:', bannerId);

      const { error } = await (supabase as any)
        .from('banner_images')
        .delete()
        .eq('id', bannerId);

      if (error) {
        console.error('Delete banner error:', error);
        throw error;
      }

      console.log('Banner deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannerImages'] });
      queryClient.invalidateQueries({ queryKey: ['allBannerImages'] });
      toast.success('Banner deleted successfully');
    },
    onError: (error) => {
      console.error('Delete banner failed:', error);
      toast.error('Failed to delete banner: ' + (error as Error).message);
    }
  });

  return {
    createBanner: createBanner.mutate,
    updateBanner: updateBanner.mutate,
    deleteBanner: deleteBanner.mutate,
    isCreatingBanner: createBanner.isPending,
    isUpdatingBanner: updateBanner.isPending,
    isDeletingBanner: deleteBanner.isPending
  };
};
