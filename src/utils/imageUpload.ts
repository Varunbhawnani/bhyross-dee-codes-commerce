// src/utils/imageUpload.ts
// Main file that exports all functions from modular files

// Export all types
export * from './imageUpload/types';

// Export validation functions
export {
  validateBannerImageFile,
  validateImageFile
} from './imageUpload/validation';

// Export optimization functions
export {
  optimizeBannerImage,
  optimizeImage,
  generateImageSizes
} from './imageUpload/optimization';

// Export storage functions
export {
  uploadImage,
  uploadBannerImage,
  deleteFromStorage,
  extractFilePathFromUrl
} from './imageUpload/storage';

// Export banner operations
export {
  uploadAndCreateBanner,
  deleteBannerImage,
  getBrandConfig
} from './imageUpload/bannerOperations';

// Export product operations
export {
  uploadProductImages,
  deleteProductImage,
  updateImageOrder,
  getProductImages
} from './imageUpload/productOperations';

// Export utility functions
export {
  parseImageUrlsFromDatabase,
  formatImageUrlsForDatabase,
  generateUniqueFilename,
  extractFilenameFromUrl,
  formatFileSize,
  isImageFile,
  getFileExtension,
  createPreviewUrl,
  revokePreviewUrl
} from './imageUpload/utils';

// Export hooks
export {
  useProductImages,
  useUploadProgress,
  useFileValidation
} from './imageUpload/hooks';

// Maintain backward compatibility - re-export commonly used functions
export { uploadImage as default } from './imageUpload/storage';