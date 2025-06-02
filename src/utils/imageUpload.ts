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
// Enhanced deleteProductImage function with detailed error handling
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  console.log('Deleting image:', imageUrl);
  
  try {
    // Extract bucket and file path from the URL
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      throw new Error(`Invalid Supabase URL format: ${imageUrl}`);
    }
    
    const [bucket, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');
    
    console.log('Extracted bucket:', bucket, 'path:', filePath);
    
    // Step 1: Delete from Supabase Storage
    console.log('Attempting to delete from storage...');
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    console.log('Storage deletion result:', { data: storageData, error: storageError });
    
    if (storageError) {
      console.error('Storage deletion failed:', storageError);
      throw new Error(`Failed to delete from storage: ${storageError.message}`);
    }
    
    // Check if file was actually deleted
    if (!storageData || storageData.length === 0) {
      console.warn('Storage deletion returned empty data - file might not have existed');
    } else {
      console.log('Storage deletion successful:', storageData);
    }
    
    // Step 2: Delete from database
    console.log('Attempting to delete from database...');
    const { data: dbData, error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('image_url', imageUrl);
    
    console.log('Database deletion result:', { data: dbData, error: dbError });
    
    if (dbError) {
      console.error('Database deletion failed:', dbError);
      throw new Error(`Failed to delete from database: ${dbError.message}`);
    }
    
    console.log('Image deletion completed successfully');
    
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    throw error;
  }
};

// Alternative approach: Check if the image exists first
export const deleteProductImageWithCheck = async (imageUrl: string): Promise<void> => {
  console.log('Deleting image with existence check:', imageUrl);
  
  try {
    // Extract bucket and file path
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      throw new Error(`Invalid Supabase URL format: ${imageUrl}`);
    }
    
    const [bucket, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');
    
    console.log('Extracted bucket:', bucket, 'path:', filePath);
    
    // Check if file exists in storage first
    console.log('Checking if file exists in storage...');
    const { data: listData, error: listError } = await supabase.storage
      .from(bucket)
      .list('images', { search: filePath.split('/').pop() });
    
    console.log('File existence check:', { data: listData, error: listError });
    
    // Check if record exists in database
    console.log('Checking if record exists in database...');
    const { data: existingRecord, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('image_url', imageUrl)
      .single();
    
    console.log('Database record check:', { data: existingRecord, error: fetchError });
    
    // Proceed with deletion
    if (!listError && listData && listData.length > 0) {
      console.log('File exists in storage, proceeding with storage deletion...');
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      console.log('Storage deletion result:', { data: storageData, error: storageError });
      
      if (storageError) {
        throw new Error(`Storage deletion failed: ${storageError.message}`);
      }
    } else {
      console.log('File not found in storage or error checking existence');
    }
    
    if (!fetchError && existingRecord) {
      console.log('Record exists in database, proceeding with database deletion...');
      const { data: dbData, error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('image_url', imageUrl);
      
      console.log('Database deletion result:', { data: dbData, error: dbError });
      
      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
    } else {
      console.log('Record not found in database or error checking existence');
    }
    
    console.log('Image deletion process completed');
    
  } catch (error) {
    console.error('Error in deleteProductImageWithCheck:', error);
    throw error;
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
