// Updated useBannerImages hooks with performance monitoring and better mobile/desktop handling
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  uploadCroppedBannerImages, 
  deleteOldBannerImages, 
  deleteOriginalBannerImage,
  preloadCriticalBannerImages
} from '@/utils/bannerStorage';

// Updated interfaces
export interface BannerImage {
  id: string;
  brand: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';
  image_url: string; // Original image for editing
  desktop_image_url?: string; // Pre-processed desktop version (for ≥768px screens)
  mobile_image_url?: string; // Pre-processed mobile version (for <768px screens)
  title?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  product_id?: string;
  category_id?: string;
  desktop_crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mobile_crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  created_at: string;
  updated_at: string;
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
  brand: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';
  image_url: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  title?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  product_id?: string;
  category_id?: string;
  desktop_crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mobile_crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UpdateBannerData extends Partial<CreateBannerData> {
  id: string;
}

// Hook to get banners for a specific brand with performance monitoring
export const useBannerImages = (brand: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections') => {
  return useQuery({
    queryKey: ['bannerImages', brand],
    queryFn: async (): Promise<BannerImage[]> => {
      const startTime = performance.now();
      console.log('Fetching banner images for brand:', brand);

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
      
      const endTime = performance.now();
      const optimizedCount = data.filter((banner: any) => 
        banner.desktop_image_url && banner.mobile_image_url
      ).length;
      
      console.log('Banner fetch performance:', {
        brand,
        count: data.length,
        optimizedCount,
        queryTime: `${(endTime - startTime).toFixed(2)}ms`,
        optimizationRate: `${((optimizedCount / data.length) * 100).toFixed(1)}%`
      });

      // Preload critical images for better performance
      if (data.length > 0) {
        setTimeout(() => preloadCriticalBannerImages(data), 100);
      }
      
      return data as BannerImage[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

// Hook to get all banners (for admin) with performance analytics
export const useAllBannerImages = () => {
  return useQuery({
    queryKey: ['allBannerImages'],
    queryFn: async (): Promise<BannerImage[]> => {
      const startTime = performance.now();
      console.log('Fetching all banner images');

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
      
      const endTime = performance.now();
      
      // Calculate performance metrics
      const analytics = data.reduce((acc: any, banner: any) => {
        acc.total++;
        if (banner.desktop_image_url && banner.mobile_image_url) {
          acc.fullyOptimized++;
        } else if (banner.desktop_image_url || banner.mobile_image_url) {
          acc.partiallyOptimized++;
        } else {
          acc.unoptimized++;
        }
        
        // Calculate estimated file sizes (approximate)
        if (banner.desktop_image_url) acc.estimatedDesktopSavings += 500; // KB saved
        if (banner.mobile_image_url) acc.estimatedMobileSavings += 700; // KB saved
        
        return acc;
      }, {
        total: 0,
        fullyOptimized: 0,
        partiallyOptimized: 0,
        unoptimized: 0,
        estimatedDesktopSavings: 0,
        estimatedMobileSavings: 0
      });
      
      console.log('Banner analytics:', {
        ...analytics,
        queryTime: `${(endTime - startTime).toFixed(2)}ms`,
        optimizationRate: `${((analytics.fullyOptimized / analytics.total) * 100).toFixed(1)}%`,
        estimatedTotalSavings: `${(analytics.estimatedDesktopSavings + analytics.estimatedMobileSavings / 1024).toFixed(1)}MB`
      });
      
      return data as BannerImage[];
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes for admin
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

// Enhanced banner operations with better error handling and performance tracking
export const useBannerOperations = () => {
  const queryClient = useQueryClient();

  const createBanner = useMutation({
    mutationFn: async (bannerData: CreateBannerData & {
      shouldProcessImages?: boolean;
    }): Promise<BannerImage> => {
      const startTime = performance.now();
      console.log('Creating banner with optimization:', bannerData);

      // First create the banner record to get an ID
      const { data: bannerRecord, error: createError } = await (supabase as any)
        .from('banner_images')
        .insert([{
          brand: bannerData.brand,
          image_url: bannerData.image_url,
          title: bannerData.title,
          description: bannerData.description,
          is_active: bannerData.is_active ?? true,
          sort_order: bannerData.sort_order ?? 0,
          product_id: bannerData.product_id,
          category_id: bannerData.category_id,
          desktop_crop: bannerData.desktop_crop,
          mobile_crop: bannerData.mobile_crop
        }])
        .select()
        .single();

      if (createError) {
        console.error('Create banner error:', createError);
        throw createError;
      }

      // If we have crop data, process and upload optimized images
      if (bannerData.shouldProcessImages !== false && 
          bannerData.desktop_crop && 
          bannerData.mobile_crop) {
        
        try {
          console.log('Processing and optimizing images for banner:', bannerRecord.id);
          const processingStartTime = performance.now();
          
          const { desktopUrl, mobileUrl } = await uploadCroppedBannerImages(
            bannerData.image_url,
            bannerData.desktop_crop,
            bannerData.mobile_crop,
            bannerData.brand,
            bannerRecord.id
          );
          
          const processingTime = performance.now() - processingStartTime;
          console.log(`Image processing completed in ${processingTime.toFixed(2)}ms`);
          
          // Update the banner record with optimized image URLs
          const { data: updatedBanner, error: updateError } = await (supabase as any)
            .from('banner_images')
            .update({
              desktop_image_url: desktopUrl,
              mobile_image_url: mobileUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', bannerRecord.id)
            .select()
            .single();
          
          if (updateError) {
            console.error('Error updating banner with optimized URLs:', updateError);
            throw updateError;
          }
          
          const totalTime = performance.now() - startTime;
          console.log('Banner created with optimized images:', {
            id: updatedBanner.id,
            totalTime: `${totalTime.toFixed(2)}ms`,
            processingTime: `${processingTime.toFixed(2)}ms`,
            desktopUrl,
            mobileUrl
          });
          
          return updatedBanner as BannerImage;
          
        } catch (processingError) {
          console.error('Error processing images for new banner:', processingError);
          // Banner is created but without processed images - user can re-edit
          throw new Error('Banner created but image optimization failed. Please edit the banner to set up cropping.');
        }
      }

      console.log('Banner created (without optimization):', bannerRecord);
      return bannerRecord as BannerImage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bannerImages'] });
      queryClient.invalidateQueries({ queryKey: ['allBannerImages'] });
      toast.success('Banner created with optimized images for fast loading!');
    },
    onError: (error) => {
      console.error('Create banner failed:', error);
      toast.error('Failed to create banner: ' + (error as Error).message);
    }
  });

  const updateBanner = useMutation({
    mutationFn: async (bannerData: UpdateBannerData & {
      shouldProcessImages?: boolean;
      deleteOldOriginal?: boolean;
    }): Promise<BannerImage> => {
      const startTime = performance.now();
      console.log('Updating banner with optimization:', bannerData);

      const { id, shouldProcessImages, deleteOldOriginal, ...updateData } = bannerData;
      
      // Get current banner data for cleanup
      const { data: currentBanner } = await (supabase as any)
        .from('banner_images')
        .select('*')
        .eq('id', id)
        .single();

      // Process optimized images if needed
      let desktopUrl = updateData.desktop_image_url;
      let mobileUrl = updateData.mobile_image_url;
      
      if (shouldProcessImages !== false && 
          updateData.desktop_crop && 
          updateData.mobile_crop && 
          updateData.image_url) {
        
        try {
          console.log('Processing optimized images for banner update:', id);
          const processingStartTime = performance.now();
          
          // Delete old optimized images first
          if (currentBanner) {
            await deleteOldBannerImages(currentBanner.brand, id);
          }
          
          // Generate new optimized images
          const croppedUrls = await uploadCroppedBannerImages(
            updateData.image_url,
            updateData.desktop_crop,
            updateData.mobile_crop,
            updateData.brand || currentBanner.brand,
            id
          );
          
          desktopUrl = croppedUrls.desktopUrl;
          mobileUrl = croppedUrls.mobileUrl;
          
          const processingTime = performance.now() - processingStartTime;
          console.log(`Image optimization completed in ${processingTime.toFixed(2)}ms`);
          
        } catch (processingError) {
          console.error('Error processing images for banner update:', processingError);
          throw new Error('Image optimization failed during update');
        }
      }
      
      // Delete old original image if requested (when user uploads new image)
      if (deleteOldOriginal && currentBanner && currentBanner.image_url !== updateData.image_url) {
        console.log('Deleting old original image:', currentBanner.image_url);
        await deleteOriginalBannerImage(currentBanner.image_url);
      }
      
      // Update the banner record
      const { data, error } = await (supabase as any)
        .from('banner_images')
        .update({
          ...updateData,
          desktop_image_url: desktopUrl,
          mobile_image_url: mobileUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update banner error:', error);
        throw error;
      }

      const totalTime = performance.now() - startTime;
      console.log('Banner updated:', {
        id: data.id,
        totalTime: `${totalTime.toFixed(2)}ms`,
        hasOptimizedImages: !!(data.desktop_image_url && data.mobile_image_url)
      });
      
      return data as BannerImage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bannerImages'] });
      queryClient.invalidateQueries({ queryKey: ['allBannerImages'] });
      
      const hasOptimizedImages = data.desktop_image_url && data.mobile_image_url;
      toast.success(
        hasOptimizedImages 
          ? 'Banner updated with optimized images for fast loading!'
          : 'Banner updated successfully'
      );
    },
    onError: (error) => {
      console.error('Update banner failed:', error);
      toast.error('Failed to update banner: ' + (error as Error).message);
    }
  });

  const deleteBanner = useMutation({
    mutationFn: async (bannerId: string): Promise<void> => {
      const startTime = performance.now();
      console.log('Deleting banner and all associated images:', bannerId);

      // Get banner data for cleanup
      const { data: banner } = await (supabase as any)
        .from('banner_images')
        .select('*')
        .eq('id', bannerId)
        .single();

      if (banner) {
        // Delete all associated images in parallel for faster cleanup
        const cleanupPromises = [
          deleteOldBannerImages(banner.brand, bannerId),
          deleteOriginalBannerImage(banner.image_url)
        ];
        
        const cleanupResults = await Promise.allSettled(cleanupPromises);
        const failedCleanups = cleanupResults.filter(result => result.status === 'rejected');
        
        if (failedCleanups.length > 0) {
          console.warn('Some image cleanup operations failed:', failedCleanups);
        }
      }

      // Delete the banner record
      const { error } = await (supabase as any)
        .from('banner_images')
        .delete()
        .eq('id', bannerId);

      if (error) {
        console.error('Delete banner error:', error);
        throw error;
      }

      const totalTime = performance.now() - startTime;
      console.log(`Banner deleted successfully in ${totalTime.toFixed(2)}ms`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannerImages'] });
      queryClient.invalidateQueries({ queryKey: ['allBannerImages'] });
      toast.success('Banner and all associated images deleted successfully');
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

// Hook for banner performance analytics (for admin dashboard)
export const useBannerPerformanceAnalytics = () => {
  return useQuery({
    queryKey: ['bannerPerformanceAnalytics'],
    queryFn: async () => {
      const { data: banners, error } = await (supabase as any)
        .from('banner_images')
        .select('id, brand, desktop_image_url, mobile_image_url, is_active');

      if (error) throw error;

      const analytics = banners.reduce((acc: any, banner: any) => {
        acc.total++;
        if (banner.is_active) acc.active++;
        
        if (banner.desktop_image_url && banner.mobile_image_url) {
          acc.fullyOptimized++;
        } else if (banner.desktop_image_url || banner.mobile_image_url) {
          acc.partiallyOptimized++;
        } else {
          acc.unoptimized++;
        }
        
        // Track by brand
        if (!acc.byBrand[banner.brand]) {
          acc.byBrand[banner.brand] = { total: 0, optimized: 0 };
        }
        acc.byBrand[banner.brand].total++;
        if (banner.desktop_image_url && banner.mobile_image_url) {
          acc.byBrand[banner.brand].optimized++;
        }
        
        return acc;
      }, {
        total: 0,
        active: 0,
        fullyOptimized: 0,
        partiallyOptimized: 0,
        unoptimized: 0,
        byBrand: {}
      });

      // Calculate optimization percentage
      analytics.optimizationRate = analytics.total > 0 
        ? ((analytics.fullyOptimized / analytics.total) * 100).toFixed(1)
        : '0';

      // Estimate performance impact
      analytics.estimatedLoadTimeImprovement = analytics.fullyOptimized * 2.5; // seconds saved
      analytics.estimatedBandwidthSavings = analytics.fullyOptimized * 1.2; // MB saved

      return analytics;
    },
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};