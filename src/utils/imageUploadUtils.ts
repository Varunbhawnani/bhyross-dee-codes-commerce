// utils/imageUploadUtils.ts
import { supabase } from '@/integrations/supabase/client';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compress and resize image
 */
export const processImage = (
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

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
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image processing failed'));
            return;
          }
          
          const processedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now(),
          });
          
          resolve(processedFile);
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate unique filename
 */
export const generateUniqueFileName = (originalName: string, productId?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  if (productId) {
    return `${productId}/${timestamp}-${randomString}.${extension}`;
  }
  
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload single image to Supabase Storage
 */
export const uploadImageToSupabase = async (
  file: File, 
  fileName: string,
  bucketName: string = 'products'
): Promise<string> => {
  try {
    // Process the image first
    const processedFile = await processImage(file);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, processedFile);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: File[], 
  productId?: string,
  bucketName: string = 'products',
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const fileName = generateUniqueFileName(file.name, productId);
      const url = await uploadImageToSupabase(file, fileName, bucketName);
      
      // Update progress
      if (onProgress) {
        const progress = ((index + 1) / files.length) * 100;
        onProgress(progress);
      }
      
      return url;
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}`);
    }
  });

  return Promise.all(uploadPromises);
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImageFromSupabase = async (
  imageUrl: string,
  bucketName: string = 'products'
): Promise<void> => {
  try {
    // Extract filename from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-2).join('/'); // Get folder/filename.ext
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    // Don't throw here as we don't want to block product deletion
    // if image deletion fails
  }
};

/**
 * Update image URLs in database format
 */
export const formatImageUrlsForDatabase = (urls: string[]): string => {
  return JSON.stringify(urls);
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