// src/utils/imageUpload/types.ts

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
export type SupportedBrand = 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';

export interface BannerImageData {
  brand: SupportedBrand;
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

export interface ImageUpdateData {
  id: string;
  sortOrder: number;
  isPrimary?: boolean;
}

export interface ProductImagesResponse {
  success: boolean;
  images?: any[];
  error?: string;
}

export interface MultipleUploadResult {
  success: boolean;
  errors: string[];
}

export interface BrandConfig {
  maxFileSize: number;
  recommendedDimensions: string;
  storageFolder: string;
}

export interface ImageSizes {
  thumbnail: File;
  medium: File;
  large: File;
}

export interface ValidationOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}