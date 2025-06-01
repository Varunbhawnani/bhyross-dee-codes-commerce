import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseImageUrlsFromDatabase } from '@/utils/imageUploadUtils';

interface ProductImageGalleryProps {
  images: string | string[]; // Can accept both database format or array
  productName: string;
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  className = ""
}) => {
  // Parse images to array format
  const imageUrls = typeof images === 'string' 
    ? parseImageUrlsFromDatabase(images) 
    : images || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Handle case where there are no images
  if (imageUrls.length === 0) {
    return (
      <Card className={`aspect-square flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p>No image available</p>
        </div>
      </Card>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Display */}
      <Card className="relative aspect-square overflow-hidden group">
        <img
          src={imageUrls[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Navigation Arrows - Only show if multiple images */}
        {imageUrls.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Zoom Indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black bg-opacity-50 text-white p-2 rounded-full">
            <ZoomIn className="h-4 w-4" />
          </div>
        </div>

        {/* Image Counter */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}
      </Card>

      {/* Thumbnail Strip - Only show if multiple images */}
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imageUrls.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`flex-shrink-0 relative ${
                index === currentIndex 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:ring-2 hover:ring-gray-300'
              } rounded-lg overflow-hidden transition-all`}
            >
              <img
                src={imageUrl}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-16 h-16 md:w-20 md:h-20 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Information */}
      <div className="text-center text-sm text-gray-600">
        {imageUrls.length === 1 
          ? "1 image" 
          : `${imageUrls.length} images available`
        }
      </div>
    </div>
  );
};

export default ProductImageGallery;