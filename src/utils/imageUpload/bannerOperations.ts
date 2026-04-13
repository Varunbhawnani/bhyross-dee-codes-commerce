// src/utils/imageUpload/bannerOperations.ts
import { supabase } from '@/integrations/supabase/client';
import { BannerImageData, SupportedBrand, BrandConfig } from './types';
import { uploadBannerImage, deleteFromStorage, extractFilePathFromUrl } from './storage';

/**
 * Upload and create banner in one operation
 */
export const uploadAndCreateBanner = async (
  bannerData: BannerImageData
): Promise<{ success: boolean; bannerId?: string; error?: string }> => {
  try {
    console.log('Starting banner upload and create:', bannerData.brand);

    // First, upload the image
    const uploadResult = await uploadBannerImage(
      bannerData.file, 
      bannerData.brand
    );

    if (!uploadResult.success || !uploadResult.url) {
      return { 
        success: false, 
        error: uploadResult.error || 'Failed to upload image' 
      };
    }

    console.log('Banner image uploaded, saving to database...');

    // Then create the banner record
    const { data, error: dbError } = await (supabase as any)
      .from('banner_images')
      .insert({
        brand: bannerData.brand,
        image_url: uploadResult.url,
        title: bannerData.title,
        description: bannerData.description,
        sort_order: bannerData.sortOrder || 0,
        product_id: bannerData.productId || null,
        category_id: bannerData.categoryId || null,
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('Banner database error:', dbError);
      
      // Try to clean up the uploaded file
      try {
        await deleteBannerImage(uploadResult.url);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
      
      return { success: false, error: dbError.message };
    }

    console.log('Banner created successfully:', data);
    return { success: true, bannerId: data.id };

  } catch (error) {
    console.error('Error in uploadAndCreateBanner:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Delete a banner image from storage and database
 */
export const deleteBannerImage = async (imageUrl: string): Promise<void> => {
  console.log('Deleting banner image:', imageUrl);
  
  try {
    const filePath = extractFilePathFromUrl(imageUrl, 'products');
    console.log('Extracted file path:', filePath);
    
    // Delete from Supabase Storage
    const storageResult = await deleteFromStorage('products', filePath);
    
    if (!storageResult.success) {
      console.error('Banner storage deletion failed:', storageResult.error);
      throw new Error(`Failed to delete from storage: ${storageResult.error}`);
    }
    
    console.log('Banner storage deletion successful');
    
    // Delete from database
    const { error: dbError } = await (supabase as any) 
      .from('banner_images')
      .delete()
      .eq('image_url', imageUrl);
    
    if (dbError) {
      console.error('Banner database deletion failed:', dbError);
      throw new Error(`Failed to delete from database: ${dbError.message}`);
    }
    
    console.log('Banner deletion completed successfully');
    
  } catch (error) {
    console.error('Error in deleteBannerImage:', error);
    throw error;
  }
};

/**
 * Get brand-specific configuration
 */
export const getBrandConfig = (brand: SupportedBrand): BrandConfig => {
  const configs = {
    bhyross: {
      maxFileSize: 15 * 1024 * 1024, // Increased to 15MB for higher quality
      recommendedDimensions: '2560x1080', // Updated to wider format
      storageFolder: 'banners/bhyross'
    },
    deecodes: {
      maxFileSize: 15 * 1024 * 1024, // Increased to 15MB
      recommendedDimensions: '2560x1080', // Updated to wider format
      storageFolder: 'banners/deecodes'
    },
    imcolus: {
      maxFileSize: 15 * 1024 * 1024, // Increased to 15MB
      recommendedDimensions: '2560x1080', // Updated to wider format
      storageFolder: 'banners/imcolus'
    },
    home: {
      maxFileSize: 15 * 1024 * 1024, // Increased to 15MB
      recommendedDimensions: '2560x1080', // Updated to wider format
      storageFolder: 'banners/home'
    },
    collections: {
      maxFileSize: 15 * 1024 * 1024, // Increased to 15MB
      recommendedDimensions: '2560x1080', // Updated to wider format
      storageFolder: 'banners/collections'
    }
  };

  return configs[brand];
};