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

export interface BannerUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Updated to include imcolus
export type SupportedBrand =  'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';

export interface BannerImageData {
  brand: SupportedBrand; // Updated to use SupportedBrand type
  file: File;
  title?: string;
  description?: string;
  sortOrder?: number;
  productId?: string;
  categoryId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
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
 * Upload a banner image to Supabase Storage
 */
export const uploadBannerImage = async (
  file: File, 
  brand: SupportedBrand, // Updated to use SupportedBrand type
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
    // Extract bucket and file path from the URL
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      throw new Error(`Invalid Supabase URL format: ${imageUrl}`);
    }
    
    const [bucket, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');
    
    console.log('Extracted bucket:', bucket, 'path:', filePath);
    
    // Delete from Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (storageError) {
      console.error('Banner storage deletion failed:', storageError);
      throw new Error(`Failed to delete from storage: ${storageError.message}`);
    }
    
    console.log('Banner storage deletion successful:', storageData);
    
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
 * Validate banner image file
 */
export const validateBannerImageFile = (file: File): ValidationResult => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Please select an image file (JPEG, PNG, WebP)'
    };
  }

  // Updated file size validation (increased to 15MB for higher quality)
  if (file.size > 15 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'Image size must be less than 15MB'
    };
  }

  // Validate specific image formats
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP formats are supported'
    };
  }

  return { isValid: true };
};

/**
 * Optimize banner image (banners often need different dimensions than products)
 */
export const optimizeBannerImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Updated max dimensions for higher quality banners
      const maxWidth = 2560;  // Increased from 1920
      const maxHeight = 1080; // Maintained aspect ratio
      
      let { width, height } = img;
      
      // Only resize if image is larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Enable high-quality rendering
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        'image/jpeg',
        0.95 // Increased quality from 0.85 to 0.95 for maximum quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get brand-specific configuration
 */
export const getBrandConfig = (brand: SupportedBrand) => {
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
/**
 * Delete an image from storage and database - FIXED VERSION
 */
/**
 * Debug version - Delete function with URL matching
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  console.log('Deleting image:', imageUrl);
  
  try {
    // Step 1: Check what URLs are actually in the database
    console.log('Checking all image URLs in database...');
    const { data: allImages, error: fetchAllError } = await supabase
      .from('product_images')
      .select('*');
    
    if (fetchAllError) {
      console.error('Error fetching all images:', fetchAllError);
    } else {
      console.log('All image URLs in database:', allImages?.map(img => img.image_url));
    }
    
    // Step 2: Try to find exact match first
    console.log('Looking for exact URL match...');
    const { data: exactMatch, error: exactError } = await supabase
      .from('product_images')
      .select('*')
      .eq('image_url', imageUrl);
    
    console.log('Exact match result:', { data: exactMatch, error: exactError });
    
    // Step 3: If no exact match, try to find by partial URL matching
    let recordToDelete = null;
    if (!exactMatch || exactMatch.length === 0) {
      console.log('No exact match found, trying partial matching...');
      
      // Extract filename from the URL
      const filename = imageUrl.split('/').pop();
      console.log('Extracted filename:', filename);
      
      if (filename && allImages) {
        // Look for any record that contains this filename
        recordToDelete = allImages.find(img => img.image_url.includes(filename));
        console.log('Found by filename:', recordToDelete);
      }
    } else {
      recordToDelete = exactMatch[0];
    }
    
    if (!recordToDelete) {
      throw new Error('Image record not found in database with exact or partial URL matching');
    }
    
    console.log('Record to delete:', recordToDelete);
    
    // Step 4: Delete from database using the found record
    console.log('Deleting from database using record ID...');
    const { data: dbData, error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', recordToDelete.id)
      .select();
    
    console.log('Database deletion result:', { data: dbData, error: dbError });
    
    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }
    
    if (!dbData || dbData.length === 0) {
      throw new Error('No database records were deleted');
    }
    
    console.log('Database deletion successful:', dbData);
    
    // Step 5: Extract file path and delete from storage
    let filePath: string;
    const urlToUse = recordToDelete.image_url; // Use the URL from database
    
    if (urlToUse.includes('/storage/v1/object/public/products/')) {
      const urlParts = urlToUse.split('/storage/v1/object/public/products/');
      filePath = urlParts[1];
    } else if (urlToUse.includes('/products/')) {
      const urlParts = urlToUse.split('/products/');
      filePath = urlParts[urlParts.length - 1];
    } else {
      // Fallback: try extracting from the passed imageUrl
      if (imageUrl.includes('/storage/v1/object/public/products/')) {
        const urlParts = imageUrl.split('/storage/v1/object/public/products/');
        filePath = urlParts[1];
      } else {
        throw new Error(`Cannot extract file path from URL: ${urlToUse}`);
      }
    }
    
    console.log('Extracted file path for storage deletion:', filePath);
    
    // Step 6: Delete from storage
    console.log('Deleting from storage...');
    const { data: storageData, error: storageError } = await supabase.storage
      .from('products')
      .remove([filePath]);
    
    console.log('Storage deletion result:', { data: storageData, error: storageError });
    
    if (storageError) {
      console.error('Storage deletion failed:', storageError);
      console.warn('Database was cleaned up but storage deletion failed');
    } else if (!storageData || storageData.length === 0) {
      console.warn('Storage deletion returned empty data - file might not have existed');
    } else {
      console.log('Storage deletion successful:', storageData);
    }
    
    console.log('Image deletion completed successfully');
    
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
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

/**
 * Parse image URLs from database
 */
export const parseImageUrlsFromDatabase = (imageData: string | null): string[] => {
  if (!imageData) return [];
  
  try {
    const parsed = JSON.parse(imageData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse image URLs:', error);
    return [];
  }
};

/**
 * Update image URLs in database format
 */
export const formatImageUrlsForDatabase = (urls: string[]): string => {
  return JSON.stringify(urls);
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File,
  options: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const {
    maxSize = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  } = options;

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported. Please use ${allowedTypes.join(', ')}.`
    };
  }

  if (file.size > maxSize * 1024 * 1024) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize}MB.`
    };
  }

  return { isValid: true };
};