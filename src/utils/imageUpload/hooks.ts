// src/utils/imageUpload/hooks.ts
import { useState } from 'react';
import { uploadProductImages } from './productOperations';

/**
 * Hook for managing product images
 */
export const useProductImages = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMultipleImages = async (
    productId: string,
    files: File[],
    variantId: string | null = null,
    primaryIndex: number = 0
  ) => {
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadProductImages(productId, files, variantId);
      setProgress(100);
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      return { 
        success: false, 
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
 * Hook for managing image upload progress
 */
export const useUploadProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startUpload = () => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  };

  const completeUpload = () => {
    setProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setProgress(0);
    }, 1000);
  };

  const failUpload = (errorMessage: string) => {
    setError(errorMessage);
    setIsUploading(false);
    setProgress(0);
  };

  const resetUpload = () => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  };

  return {
    progress,
    isUploading,
    error,
    startUpload,
    updateProgress,
    completeUpload,
    failUpload,
    resetUpload
  };
};

/**
 * Hook for managing file validation
 */
export const useFileValidation = () => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFiles = (
    files: File[],
    options: {
      maxSize?: number; // in MB
      allowedTypes?: string[];
      maxCount?: number;
    } = {}
  ) => {
    const {
      maxSize = 5,
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      maxCount = 10
    } = options;

    const errors: string[] = [];

    // Check file count
    if (files.length > maxCount) {
      errors.push(`Maximum ${maxCount} files allowed`);
    }

    // Check each file
    files.forEach((file, index) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Unsupported file type (${file.type})`);
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`File ${index + 1}: Size exceeds ${maxSize}MB limit`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const clearValidationErrors = () => {
    setValidationErrors([]);
  };

  return {
    validationErrors,
    validateFiles,
    clearValidationErrors
  };
};