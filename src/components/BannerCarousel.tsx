import React, { useState, useEffect } from 'react';
import { useBannerImages } from '@/hooks/useBannerImages';

interface BannerCarouselProps {
  brand: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';
}

const BannerCarousel = ({ brand }: BannerCarouselProps) => {
  const { data: banners = [], isLoading } = useBannerImages(brand);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Get dimensions based on brand/page type
  const getBannerDimensions = () => {
    switch (brand) {
      case 'bhyross':
        return 'h-[250px] md:h-[350px] lg:h-[450px]';
      case 'deecodes':
        return 'h-[280px] md:h-[380px] lg:h-[480px]';
      case 'imcolus':
        return 'h-[320px] md:h-[420px] lg:h-[520px]';
      case 'home':
        return 'h-[300px] md:h-[400px] lg:h-[500px]';
      case 'collections':
        return 'h-[200px] md:h-[300px] lg:h-[400px]';
      default:
        return 'h-[300px] md:h-[400px] lg:h-[500px]';
    }
  };

  // If loading or no banners, return null (no banner section)
  if (isLoading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const dimensions = getBannerDimensions();

  return (
    <div className={`relative ${dimensions} overflow-hidden bg-gray-100`}>
      <img
        src={currentBanner.image_url}
        alt={currentBanner.title || `${brand} banner`}
        className="w-full h-full object-cover object-center transition-opacity duration-1000"
        style={{ objectPosition: 'center center' }}
      />
      
      {/* Overlay with content if title or description exists */}
      {(currentBanner.title || currentBanner.description) && (
  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="text-center text-white px-4 font-serif [text-shadow:_2px_2px_4px_rgb(0_0_0_/_0.8)]">
      {currentBanner.title && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans mb-1 sm:mb-2 drop-shadow-lg">
          {currentBanner.title}
        </h2>
      )}
      {currentBanner.description && (
        <p className="text-sm sm:text-base md:text-lg lg:text-2xl drop-shadow-md">
          {currentBanner.description}
        </p>
      )}
    </div>
  </div>
)}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;