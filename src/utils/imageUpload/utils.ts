// src/utils/imageUpload/utils.ts

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
 * Generate unique filename with timestamp and random string
 */
export const generateUniqueFilename = (originalName: string, prefix?: string): string => {
  const fileExt = originalName.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  
  if (prefix) {
    return `${prefix}_${timestamp}_${randomString}.${fileExt}`;
  }
  
  return `${timestamp}_${randomString}.${fileExt}`;
};

/**
 * Extract filename from URL
 */
export const extractFilenameFromUrl = (url: string): string | null => {
  try {
    const parts = url.split('/');
    return parts[parts.length - 1] || null;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Create a preview URL for a file
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke a preview URL to free memory
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};