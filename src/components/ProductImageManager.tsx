import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Star, StarOff, ImageIcon, AlertCircle } from 'lucide-react';
import { uploadProductImages, deleteProductImage, updateImageOrder } from '@/utils/imageUpload';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  variant_id?: string | null; // Make this optional
}

interface ProductImageManagerProps {
  productId: string;
  variantId?: string | null;
  images: ProductImage[];
  onImagesUpdate: () => void;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  productId,
  variantId = null, // Default to null
  images,
  onImagesUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Handle file selection with validation
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        return false;
      }
      
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        console.warn(`Skipping large file: ${file.name} (${file.size} bytes)`);
        return false;
      }
      
      return true;
    });
    
    if (imageFiles.length !== files.length) {
      alert(`Some files were skipped. Only image files under 5MB are allowed.`);
    }
    
    setSelectedFiles(imageFiles);
    
    // Clean up previous preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create new preview URLs
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  }, [previewUrls]);

  // Upload selected images with better error handling
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (variantId === undefined) {
  console.error('variantId is undefined - this will cause images not to be linked to variants');
}

    setUploading(true);
    try {
      console.log('Uploading images:', {
        productId,
        variantId,
        filesCount: selectedFiles.length
      });

      console.log('Uploading with variantId:', variantId); // Debug log
const result = await uploadProductImages(productId, selectedFiles, variantId);
      
      if (result.success) {
        console.log('Upload successful:', result);
        
        // Clean up preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        // Refresh the images
        onImagesUpdate();
        
        alert(`Successfully uploaded ${selectedFiles.length} images`);
      } else {
        console.error('Upload failed:', result.errors);
        alert(`Upload failed: ${result.errors.join(', ')}`);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.error('Upload errors:', result.errors);
        alert(`Some uploads failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Delete an image with better error handling
  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      console.log('Deleting image:', { imageId, imageUrl });
      
      // Try to delete by image URL (as per your current implementation)
      await deleteProductImage(imageUrl);
      
      // Refresh the images
      onImagesUpdate();
      
      alert('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Set primary image
  const handleSetPrimary = async (imageId: string) => {
    try {
      const updates = images.map(img => ({
        id: img.id,
        sortOrder: img.sort_order,
        isPrimary: img.id === imageId
      }));

      console.log('Setting primary image:', { imageId, updates });

      const result = await updateImageOrder(updates);
      if (result.success) {
        onImagesUpdate();
        alert('Primary image updated successfully');
      } else {
        console.error('Failed to update primary image:', result.error);
        alert(`Failed to update primary image: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to set primary image:', error);
      alert(`Failed to set primary image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Drag and drop for reordering
  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent, targetImageId: string) => {
    event.preventDefault();
    
    if (!draggedImage || draggedImage === targetImageId) {
      setDraggedImage(null);
      return;
    }

    try {
      const draggedIndex = images.findIndex(img => img.id === draggedImage);
      const targetIndex = images.findIndex(img => img.id === targetImageId);

      if (draggedIndex === -1 || targetIndex === -1) {
        console.error('Could not find images for reordering');
        return;
      }

      // Create new order
      const reorderedImages = [...images];
      const [draggedItem] = reorderedImages.splice(draggedIndex, 1);
      reorderedImages.splice(targetIndex, 0, draggedItem);

      // Update sort orders
      const updates = reorderedImages.map((img, index) => ({
        id: img.id,
        sortOrder: index + 1,
        isPrimary: img.is_primary
      }));

      console.log('Reordering images:', updates);

      const result = await updateImageOrder(updates);
      if (result.success) {
        onImagesUpdate();
      } else {
        console.error('Failed to reorder images:', result.error);
        alert(`Failed to reorder images: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to reorder images:', error);
      alert(`Failed to reorder images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setDraggedImage(null);
  };

  // Clear selected files
  const handleClearSelection = useCallback(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
  }, [previewUrls]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const sortedImages = [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {variantId ? `Variant Images Manager` : 'Product Images Manager'}
          {images.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({images.length} {images.length === 1 ? 'image' : 'images'})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor={`image-upload-${productId}-${variantId || 'general'}`} className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Select images to upload
                </span>
                <input
                  id={`image-upload-${productId}-${variantId || 'general'}`}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Preview selected files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative">
                    <img
  src={previewUrls[index]}
  alt={file.name}
  className="w-full h-24 object-cover rounded border"
  loading="lazy"
  decoding="async"
  width="200"
  height="96"
/>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length === 1 ? '' : 's'}`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearSelection}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Current Images */}
        <div>
          <h3 className="text-lg font-medium mb-4">
  Current Images ({images.length})
  {variantId && (
    <span className="text-sm font-normal text-gray-500 ml-2">
      (Variant-specific)
    </span>
  )}
</h3>
          
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No images uploaded yet</p>
              <p className="text-sm text-gray-400">
                Upload images using the section above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative border rounded-lg overflow-hidden cursor-move ${
                    image.is_primary ? 'ring-2 ring-blue-500' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(image.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, image.id)}
                >
                  <img
  src={image.image_url}
  alt={image.alt_text || 'Product image'}
  className="w-full h-48 object-cover"
  loading="lazy"
  decoding="async"
  width="400"
  height="192"
  onError={(e) => {
                      console.error('Failed to load image:', image.image_url);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  
                  {/* Image Controls */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant={image.is_primary ? "default" : "outline"}
                      onClick={() => handleSetPrimary(image.id)}
                      className="p-1 h-8 w-8"
                      title={image.is_primary ? "Currently primary" : "Set as primary"}
                    >
                      {image.is_primary ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id, image.image_url)}
                      className="p-1 h-8 w-8"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Primary badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    </div>
                  )}

                  {/* Sort order */}
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      #{image.sort_order || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Drag and drop images to reorder them</li>
                <li>Click the star icon to set a primary image</li>
                <li>Primary image will be shown first in product listings</li>
                <li>Recommended image size: 1200x1200 pixels</li>
                <li>Supported formats: JPG, PNG, WebP (max 5MB each)</li>
                {variantId && (
                  <li>These images are specific to this color variant</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImageManager;