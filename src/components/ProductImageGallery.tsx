import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseImageUrlsFromDatabase } from '@/utils/imageUpload';

interface ProductImageGalleryProps {
  images: string | string[];
  productName: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean; // For LCP images
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  className = "",
  loading = "lazy",
  priority = false
}) => {
  const imageUrls = typeof images === 'string' 
    ? parseImageUrlsFromDatabase(images) 
    : images || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<{[key: number]: boolean}>({});

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

  // Generate Supabase image transformations
  const getOptimizedImageUrl = (url: string, width: number, quality: number = 80) => {
    return url;
  };

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
        {/* Low quality placeholder while loading */}
        {!imageLoaded[currentIndex] && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <img
          src={getOptimizedImageUrl(imageUrls[currentIndex], 800)}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          } ${!imageLoaded[currentIndex] ? 'opacity-0' : 'opacity-100'}`}
          loading={priority ? "eager" : loading}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onClick={() => setIsZoomed(!isZoomed)}
          onLoad={() => setImageLoaded(prev => ({...prev, [currentIndex]: true}))}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
          // Responsive images with srcset
          srcSet={`
            ${getOptimizedImageUrl(imageUrls[currentIndex], 400)} 400w,
            ${getOptimizedImageUrl(imageUrls[currentIndex], 600)} 600w,
            ${getOptimizedImageUrl(imageUrls[currentIndex], 800)} 800w,
            ${getOptimizedImageUrl(imageUrls[currentIndex], 1200)} 1200w
          `}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
        />
        
        {/* Preload next/prev images */}
        {imageUrls.length > 1 && (
          <>
            <link
              rel="prefetch"
              as="image"
              href={getOptimizedImageUrl(imageUrls[(currentIndex + 1) % imageUrls.length], 800)}
            />
            {currentIndex > 0 && (
              <link
                rel="prefetch"
                as="image"
                href={getOptimizedImageUrl(imageUrls[currentIndex - 1], 800)}
              />
            )}
          </>
        )}
        
        {/* Navigation Arrows */}
        {imageUrls.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black bg-opacity-50 text-white p-2 rounded-full">
            <ZoomIn className="h-4 w-4" />
          </div>
        </div>

        {imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}
      </Card>

      {/* Thumbnail Strip */}
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
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={getOptimizedImageUrl(imageUrl, 100, 70)}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-16 h-16 md:w-20 md:h-20 object-cover"
                loading="lazy"
                decoding="async"
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