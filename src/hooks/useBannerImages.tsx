
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BannerImage {
  id: string;
  brand: 'bhyross' | 'deecodes';
  image_url: string;
  title: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useBannerImages = (brand?: 'bhyross' | 'deecodes') => {
  return useQuery({
    queryKey: ['banner-images', brand],
    queryFn: async () => {
      let query = supabase
        .from('banner_images')
        .select('*')
        .eq('is_active', true);

      if (brand) {
        query = query.eq('brand', brand);
      }

      const { data, error } = await query.order('sort_order');

      if (error) throw error;
      return data as BannerImage[];
    },
  });
};

export const useAllBannerImages = () => {
  return useQuery({
    queryKey: ['all-banner-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner_images')
        .select('*')
        .order('brand', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as BannerImage[];
    },
  });
};

export const useBannerOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBanner = useMutation({
    mutationFn: async (bannerData: Omit<BannerImage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('banner_images')
        .insert([bannerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-images'] });
      queryClient.invalidateQueries({ queryKey: ['all-banner-images'] });
      toast({
        title: "Success",
        description: "Banner image created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create banner image",
        variant: "destructive",
      });
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<BannerImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('banner_images')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-images'] });
      queryClient.invalidateQueries({ queryKey: ['all-banner-images'] });
      toast({
        title: "Success",
        description: "Banner image updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update banner image",
        variant: "destructive",
      });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banner_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-images'] });
      queryClient.invalidateQueries({ queryKey: ['all-banner-images'] });
      toast({
        title: "Success",
        description: "Banner image deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete banner image",
        variant: "destructive",
      });
    },
  });

  return {
    createBanner: createBanner.mutate,
    updateBanner: updateBanner.mutate,
    deleteBanner: deleteBanner.mutate,
    isCreating: createBanner.isPending,
    isUpdating: updateBanner.isPending,
    isDeleting: deleteBanner.isPending,
  };
};
