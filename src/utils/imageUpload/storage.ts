// src/utils/imageUpload/storage.ts
import { supabase } from '@/integrations/supabase/client';
import { ImageUploadResult, BannerUploadResult, SupportedBrand } from './types';
/**
 * Upload a single image to Supabase Storage
 */
export const uploadImage = async (
  file: File, 
  bucket: string = 'products',
  folder: string = 'images'
): Promise<ImageUploadResult> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Uploading to:', bucket, filePath); // Debug log

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    console.log('Upload successful:', data); // Debug log

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl); // Debug log

    return { 
      success: true, 
      url: urlData.publicUrl 
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Upload a banner image to Supabase Storage
 */
export const uploadBannerImage = async (
  file: File, 
  brand: SupportedBrand,
  bucket: string = 'products',
  folder: string = 'banners'
): Promise<BannerUploadResult> => {
  try {
    // Generate unique filename with brand prefix
    const fileExt = file.name.split('.').pop();
    const fileName = `${brand}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Uploading banner to:', bucket, filePath);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Banner upload error:', error);
      return { success: false, error: error.message };
    }

    console.log('Banner upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('Banner public URL:', urlData.publicUrl);

    return { 
      success: true, 
      url: urlData.publicUrl 
    };
  } catch (error) {
    console.error('Banner upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Delete a file from Supabase storage
 */
export const deleteFromStorage = async (
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Storage deletion failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Storage deletion successful:', data);
    return { success: true };
  } catch (error) {
    console.error('Error in deleteFromStorage:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Extract file path from Supabase URL - UPDATED VERSION
 */
export const extractFilePathFromUrl = (url: string, bucket: string): string => {
  console.log('Extracting file path from URL:', url);
  console.log('Looking for bucket:', bucket);
  
  if (url.includes(`/storage/v1/object/public/${bucket}/`)) {
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
    const filePath = urlParts[1];
    
    // Handle double slashes (files stored in root) - clean up the path
    const cleanFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    console.log('Extracted file path:', cleanFilePath);
    return cleanFilePath;
  } else if (url.includes(`/${bucket}/`)) {
    const urlParts = url.split(`/${bucket}/`);
    const filePath = urlParts[urlParts.length - 1];
    
    // Handle double slashes (files stored in root) - clean up the path
    const cleanFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    console.log('Extracted file path (fallback):', cleanFilePath);
    return cleanFilePath;
  } else {
    throw new Error(`Cannot extract file path from URL: ${url}`);
  }
};