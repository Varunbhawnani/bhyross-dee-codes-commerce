// src/utils/imageUpload/validation.ts
import { ValidationResult, ValidationOptions } from './types';

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
 * Validate image file with custom options
 */
export const validateImageFile = (
  file: File,
  options: ValidationOptions = {}
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