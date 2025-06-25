
import React, { useState, useEffect } from 'react';
import { useBannerImages } from '@/hooks/useBannerImages';

interface BannerCarouselProps {
  brand: 'bhyross' | 'deecodes';
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

  if (isLoading || banners.length === 0) {
    return (
      <div className="relative h-[400px] bg-neutral-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-neutral-400">Loading banners...</div>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-[400px] overflow-hidden">
      <img
        src={currentBanner.image_url}
        alt={currentBanner.title || `${brand} banner`}
        className="w-full h-full object-cover transition-opacity duration-1000"
      />
      
      {/* Overlay with content if title or description exists */}
      {(currentBanner.title || currentBanner.description) && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white px-4">
            {currentBanner.title && (
              <h2 className="text-4xl font-bold mb-2">{currentBanner.title}</h2>
            )}
            {currentBanner.description && (
              <p className="text-xl">{currentBanner.description}</p>
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
