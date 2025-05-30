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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

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
  const results = await Promise.all(
    files.map(async (file, index) => {
      const uploadResult = await uploadImage(file);
      
      if (uploadResult.success && uploadResult.url) {
        // Save image info to database
        const { error: dbError } = await supabase
          .from('product_images' as any)
          .insert({
            product_id: productId,
            image_url: uploadResult.url,
            alt_text: `${file.name} - Product Image`,
            is_primary: index === primaryImageIndex,
            sort_order: index + 1
          });

        if (dbError) {
          console.error('Database error:', dbError);
          return { success: false, error: dbError.message };
        }
        
        return { success: true };
      }
      
      return uploadResult;
    })
  );

  const successCount = results.filter(r => r.success).length;
  const errors = results
    .filter(r => !r.success)
    .map(r => r.error || 'Unknown error');

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
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucket = pathParts[pathParts.length - 3]; // Assuming structure /storage/v1/object/public/bucket/folder/file
    const filePath = pathParts.slice(-2).join('/'); // folder/file

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('product_images' as any)
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return { success: false, error: dbError.message };
    }

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
    const updates = imageUpdates.map(update => 
      supabase
        .from('product_images' as any)
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
      return { success: false, error: errors };
    }

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