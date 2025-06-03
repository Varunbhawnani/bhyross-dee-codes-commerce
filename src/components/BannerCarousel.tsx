
import React, { useState, useEffect } from 'react';
import { useBannerImages } from '@/hooks/useBannerImages';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BannerCarouselProps {
  brand: 'bhyross' | 'deecodes';
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ brand }) => {
  const { data: banners = [], isLoading } = useBannerImages(brand);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (isLoading || banners.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-neutral-900 to-neutral-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 capitalize">
            {brand === 'bhyross' ? 'Bhyross' : 'Dee Codes'}
          </h1>
          <p className="text-xl md:text-2xl">Premium Footwear Collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={banner.image_url}
            alt={banner.title || `${brand} banner ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              {banner.title && (
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {banner.title}
                </h1>
              )}
              {banner.description && (
                <p className="text-xl md:text-2xl">
                  {banner.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
