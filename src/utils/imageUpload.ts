// src/utils/imageUpload.ts
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ProductImageData {
  productId: string;
  file: File;
  isPrimary?: boolean;
  altText?: string;
  sortOrder?: number;
}

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
 * Upload multiple images for a product
 */
export const uploadProductImages = async (
  productId: string,
  files: File[],
  primaryImageIndex: number = 0
): Promise<{ success: boolean; uploadedCount: number; errors: string[] }> => {
  console.log('Starting upload for product:', productId, 'Files:', files.length); // Debug log

  const results = await Promise.all(
    files.map(async (file, index) => {
      const uploadResult = await uploadImage(file);
      
      if (uploadResult.success && uploadResult.url) {
        console.log('Saving to database:', {
          product_id: productId,
          image_url: uploadResult.url,
          alt_text: `${file.name} - Product Image`,
          is_primary: index === primaryImageIndex,
          sort_order: index + 1
        }); // Debug log

        // Save image info to database - FIXED: Removed type assertion
        const { data, error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: uploadResult.url,
            alt_text: `${file.name} - Product Image`,
            is_primary: index === primaryImageIndex,
            sort_order: index + 1
          })
          .select(); // Add select to get the inserted data

        if (dbError) {
          console.error('Database error:', dbError);
          return { success: false, error: dbError.message };
        }
        
        console.log('Database insert successful:', data); // Debug log
        return { success: true };
      }
      
      return uploadResult;
    })
  );

  const successCount = results.filter(r => r.success).length;
  const errors = results
    .filter(r => !r.success)
    .map(r => r.error || 'Unknown error');

  console.log('Upload results:', { successCount, errors }); // Debug log

  return {
    success: successCount > 0,
    uploadedCount: successCount,
    errors
  };
};

/**
 * Delete an image from storage and database
 */
export const deleteProductImage = async (
  imageId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Deleting image:', imageId, imageUrl); // Debug log

    // Extract file path from URL - FIXED: Better URL parsing
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    
    // Find the bucket and path from Supabase URL structure
    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const publicIndex = pathSegments.indexOf('public');
    if (publicIndex === -1 || publicIndex >= pathSegments.length - 2) {
      console.error('Invalid Supabase storage URL format');
      return { success: false, error: 'Invalid image URL format' };
    }
    
    const bucket = pathSegments[publicIndex + 1];
    const filePath = pathSegments.slice(publicIndex + 2).join('/');

    console.log('Extracted bucket:', bucket, 'path:', filePath); // Debug log

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Don't return error here, continue with database deletion
    }

    // Delete from database - FIXED: Removed type assertion
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return { success: false, error: dbError.message };
    }

    console.log('Image deleted successfully'); // Debug log
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Update image order for a product
 */
export const updateImageOrder = async (
  imageUpdates: { id: string; sortOrder: number; isPrimary?: boolean }[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Updating image order:', imageUpdates); // Debug log

    const updates = imageUpdates.map(update => 
      supabase
        .from('product_images') // FIXED: Removed type assertion
        .update({ 
          sort_order: update.sortOrder,
          is_primary: update.isPrimary || false
        })
        .eq('id', update.id)
    );

    const results = await Promise.all(updates);
    
    const hasError = results.some(result => result.error);
    if (hasError) {
      const errors = results
        .filter(result => result.error)
        .map(result => result.error?.message)
        .join(', ');
      console.error('Update errors:', errors);
      return { success: false, error: errors };
    }

    console.log('Image order updated successfully'); // Debug log
    return { success: true };
  } catch (error) {
    console.error('Update order error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Get product images from database
 */
export const getProductImages = async (productId: string): Promise<{
  success: boolean;
  images?: any[];
  error?: string;
}> => {
  try {
    console.log('Fetching images for product:', productId); // Debug log

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching product images:', error);
      return { success: false, error: error.message };
    }

    console.log('Fetched images:', data); // Debug log
    return { success: true, images: data || [] };
  } catch (error) {
    console.error('Error fetching product images:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Optimize image before upload (resize, compress)
 */
export const optimizeImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            resolve(file); // Return original if optimization fails
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate multiple image sizes (thumbnail, medium, large)
 */
export const generateImageSizes = async (
  file: File
): Promise<{ thumbnail: File; medium: File; large: File }> => {
  const [thumbnail, medium, large] = await Promise.all([
    optimizeImage(file, 200, 200, 0.7),  // Thumbnail
    optimizeImage(file, 600, 600, 0.8),  // Medium
    optimizeImage(file, 1200, 1200, 0.9) // Large
  ]);

  return { thumbnail, medium, large };
};

/**
 * Hook for managing product images
 */
export const useProductImages = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMultipleImages = async (
    productId: string,
    files: File[],
    primaryIndex: number = 0
  ) => {
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadProductImages(productId, files, primaryIndex);
      setProgress(100);
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      return { 
        success: false, 
        uploadedCount: 0, 
        errors: [error instanceof Error ? error.message : 'Upload failed'] 
      };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    uploading,
    progress,
    uploadMultipleImages
  };
};