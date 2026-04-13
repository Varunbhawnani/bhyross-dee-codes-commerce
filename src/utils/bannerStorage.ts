// src/utils/bannerStorage.ts
import { supabase } from '@/integrations/supabase/client';

// Fixed banner resolutions
export const DESKTOP_RESOLUTION = { width: 1920, height: 800 };
export const MOBILE_RESOLUTION = { width: 375, height: 180 };

/**
 * Compress and optimize image
 */
export const compressImage = (
  canvas: HTMLCanvasElement,
  quality: number = 0.8,
  maxFileSize: number = 500 * 1024 // 500KB default
): Promise<Blob> => {
  return new Promise((resolve) => {
    // Try different quality levels to meet file size requirement
    const tryCompression = (currentQuality: number) => {
      canvas.toBlob((blob) => {
        if (blob) {
          if (blob.size <= maxFileSize || currentQuality <= 0.3) {
            resolve(blob);
          } else {
            // Reduce quality and try again
            tryCompression(currentQuality - 0.1);
          }
        } else {
          // Fallback if blob creation fails
          canvas.toBlob((fallbackBlob) => {
            resolve(fallbackBlob!);
          }, 'image/jpeg', 0.5);
        }
      }, 'image/jpeg', currentQuality);
    };

    tryCompression(quality);
  });
};

/**
 * Generate optimized cropped image from canvas and convert to File
 */
export const generateCroppedImageFile = async (
  originalImageUrl: string,
  crop: { x: number; y: number; width: number; height: number },
  resolution: { width: number; height: number },
  filename: string,
  isMobile: boolean = false
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas to exact resolution
        canvas.width = resolution.width;
        canvas.height = resolution.height;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the cropped portion scaled to exact resolution
        ctx.drawImage(
          img,
          crop.x, crop.y, crop.width, crop.height,
          0, 0, resolution.width, resolution.height
        );
        
        // Apply different compression based on device type
        const quality = isMobile ? 0.75 : 0.85; // Lower quality for mobile for faster loading
        const maxFileSize = isMobile ? 300 * 1024 : 800 * 1024; // 300KB for mobile, 800KB for desktop
        
        // Compress the image
        const compressedBlob = await compressImage(canvas, quality, maxFileSize);
        const file = new File([compressedBlob], filename, { type: 'image/jpeg' });
        
        console.log(`Generated ${isMobile ? 'mobile' : 'desktop'} image:`, {
          filename,
          size: `${(file.size / 1024).toFixed(1)}KB`,
          resolution: `${resolution.width}x${resolution.height}`,
          quality
        });
        
        resolve(file);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = originalImageUrl;
  });
};

/**
 * Upload cropped banner images to Supabase storage with optimization
 */
export const uploadCroppedBannerImages = async (
  originalImageUrl: string,
  desktopCrop: { x: number; y: number; width: number; height: number },
  mobileCrop: { x: number; y: number; width: number; height: number },
  brand: string,
  bannerId: string
): Promise<{ desktopUrl: string; mobileUrl: string }> => {
  try {
    console.log('Starting optimized cropped banner upload for banner:', bannerId);
    
    // Generate optimized desktop cropped image
    const desktopFile = await generateCroppedImageFile(
      originalImageUrl,
      desktopCrop,
      DESKTOP_RESOLUTION,
      `desktop-${bannerId}.jpg`,
      false
    );
    
    // Generate optimized mobile cropped image  
    const mobileFile = await generateCroppedImageFile(
      originalImageUrl,
      mobileCrop,
      MOBILE_RESOLUTION,
      `mobile-${bannerId}.jpg`,
      true
    );
    
    // Upload both images in parallel for faster processing
    const [desktopUpload, mobileUpload] = await Promise.all([
      // Upload desktop image
      supabase.storage
        .from('products')
        .upload(`banners/${brand}/desktop-${bannerId}.jpg`, desktopFile, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '31536000' // Cache for 1 year
        }),
      
      // Upload mobile image
      supabase.storage
        .from('products')
        .upload(`banners/${brand}/mobile-${bannerId}.jpg`, mobileFile, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '31536000' // Cache for 1 year
        })
    ]);
    
    if (desktopUpload.error) {
      throw new Error(`Desktop upload failed: ${desktopUpload.error.message}`);
    }
    
    if (mobileUpload.error) {
      throw new Error(`Mobile upload failed: ${mobileUpload.error.message}`);
    }
    
    // Get public URLs
    const { data: desktopUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(`banners/${brand}/desktop-${bannerId}.jpg`);
    
    const { data: mobileUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(`banners/${brand}/mobile-${bannerId}.jpg`);
    
    console.log('Optimized cropped banner upload successful:', {
      desktop: {
        url: desktopUrlData.publicUrl,
        size: `${(desktopFile.size / 1024).toFixed(1)}KB`
      },
      mobile: {
        url: mobileUrlData.publicUrl,
        size: `${(mobileFile.size / 1024).toFixed(1)}KB`
      }
    });
    
    return {
      desktopUrl: desktopUrlData.publicUrl,
      mobileUrl: mobileUrlData.publicUrl
    };
    
  } catch (error) {
    console.error('Error uploading optimized cropped banner images:', error);
    throw error;
  }
};

/**
 * Delete old banner images from storage
 */
export const deleteOldBannerImages = async (
  brand: string,
  bannerId: string
): Promise<void> => {
  try {
    const desktopPath = `banners/${brand}/desktop-${bannerId}.jpg`;
    const mobilePath = `banners/${brand}/mobile-${bannerId}.jpg`;
    
    // Delete both images in parallel
    const [desktopResult, mobileResult] = await Promise.allSettled([
      supabase.storage.from('products').remove([desktopPath]),
      supabase.storage.from('products').remove([mobilePath])
    ]);
    
    console.log('Old banner images deletion results:', {
      desktop: desktopResult.status,
      mobile: mobileResult.status
    });
    
  } catch (error) {
    console.error('Error deleting old banner images:', error);
    // Don't throw error here as it's cleanup operation
  }
};

/**
 * Extract file path from Supabase URL for deletion
 */
export const extractFilePathFromSupabaseUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    // Remove '/storage/v1/object/public/products/' to get just the file path
    const bucketIndex = pathSegments.indexOf('products');
    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      return pathSegments.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch (error) {
    console.error('Error extracting file path from URL:', url, error);
    return null;
  }
};

/**
 * Delete original banner image from storage
 */
export const deleteOriginalBannerImage = async (imageUrl: string): Promise<void> => {
  try {
    const filePath = extractFilePathFromSupabaseUrl(imageUrl);
    if (filePath) {
      const { error } = await supabase.storage
        .from('products')
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting original banner image:', error);
      } else {
        console.log('Original banner image deleted:', filePath);
      }
    }
  } catch (error) {
    console.error('Error in deleteOriginalBannerImage:', error);
  }
};

/**
 * Preload critical banner images for faster initial page loads
 */
export const preloadCriticalBannerImages = (banners: any[]) => {
  if (typeof window === 'undefined' || banners.length === 0) return;

  // Preload the first banner's images as they're most likely to be seen
  const firstBanner = banners[0];
  if (firstBanner) {
    const isMobile = window.innerWidth < 768;
    const criticalImageUrl = isMobile 
      ? (firstBanner.mobile_image_url || firstBanner.image_url)
      : (firstBanner.desktop_image_url || firstBanner.image_url);

    // Create link element for preloading
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = criticalImageUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    console.log('Preloading critical banner image:', criticalImageUrl);
  }
};