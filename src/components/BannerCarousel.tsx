import React, { useState, useEffect, useRef } from 'react';
import { useBannerImages } from '@/hooks/useBannerImages';
import { motion, AnimatePresence } from 'framer-motion';

interface BannerCarouselProps {
  brand: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';
}

// Fixed banner resolutions for aspect ratio
const DESKTOP_RESOLUTION = { width: 1920, height: 800 }; // 2.4:1 aspect ratio
const MOBILE_RESOLUTION = { width: 375, height: 180 }; // 2.08:1 aspect ratio

const BannerCarousel = ({ brand }: BannerCarouselProps) => {
  const { data: banners = [], isLoading } = useBannerImages(brand);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const preloadedImages = useRef<Map<string, HTMLImageElement>>(new Map());

  // Detect screen size changes
  useEffect(() => {
    const checkMobile = () => {
      // Use 768px as breakpoint (md in Tailwind) for more accurate mobile detection
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload all banner images for faster transitions
  useEffect(() => {
    if (banners.length === 0) return;

    const preloadImages = async () => {
      const imagePromises = banners.map(banner => {
        return new Promise<void>((resolve) => {
          // Determine which images to preload based on screen size
          const desktopUrl = banner.desktop_image_url || banner.image_url;
          const mobileUrl = banner.mobile_image_url || banner.image_url;

          // Preload both desktop and mobile images
          const preloadDesktop = new Image();
          const preloadMobile = new Image();

          let desktopLoaded = false;
          let mobileLoaded = false;

          const checkComplete = () => {
            if (desktopLoaded && mobileLoaded) {
              preloadedImages.current.set(`${banner.id}-desktop`, preloadDesktop);
              preloadedImages.current.set(`${banner.id}-mobile`, preloadMobile);
              setLoadedImages(prev => new Set([...prev, banner.id]));
              resolve();
            }
          };

          preloadDesktop.onload = () => {
            desktopLoaded = true;
            checkComplete();
          };

          preloadDesktop.onerror = () => {
            console.warn('Failed to preload desktop image:', desktopUrl);
            desktopLoaded = true;
            checkComplete();
          };

          preloadMobile.onload = () => {
            mobileLoaded = true;
            checkComplete();
          };

          preloadMobile.onerror = () => {
            console.warn('Failed to preload mobile image:', mobileUrl);
            mobileLoaded = true;
            checkComplete();
          };

          // Start preloading
          preloadDesktop.src = desktopUrl;
          preloadMobile.src = mobileUrl;
        });
      });

      try {
        await Promise.all(imagePromises);
        console.log('All banner images preloaded');
      } catch (error) {
        console.error('Error preloading banner images:', error);
      }
    };

    preloadImages();
  }, [banners]);

  // Carousel auto-advance
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Get the appropriate image URL based on screen size and optimization
  const getCurrentImageUrl = (): string => {
    if (banners.length === 0) return '';
    
    const currentBanner = banners[currentIndex];
    
    if (isMobile) {
      // STRICT: Use mobile image only on mobile screens
      return currentBanner.mobile_image_url || currentBanner.image_url;
    } else {
      // STRICT: Use desktop image only on desktop screens
      return currentBanner.desktop_image_url || currentBanner.image_url;
    }
  };

  // If loading or no banners, return null
  if (isLoading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const currentImageUrl = getCurrentImageUrl();
  const isImageLoaded = loadedImages.has(currentBanner.id);

  return (
    <div className="relative w-full bg-gray-100 overflow-hidden">
      {/* Single container that adapts based on screen size */}
      <div 
        className="relative w-full"
        style={{ 
          aspectRatio: isMobile 
            ? `${MOBILE_RESOLUTION.width}/${MOBILE_RESOLUTION.height}` 
            : `${DESKTOP_RESOLUTION.width}/${DESKTOP_RESOLUTION.height}` 
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${isMobile ? 'mobile' : 'desktop'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageLoaded ? 1 : 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Loading placeholder */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-500 text-sm">Loading...</div>
              </div>
            )}
            
            {/* Main banner image */}
            <img
              src={currentImageUrl}
              alt={currentBanner.title || `${brand} banner`}
              className="w-full h-full"
              style={{
                objectFit: (isMobile ? currentBanner.mobile_image_url : currentBanner.desktop_image_url) 
                  ? 'fill'  // Pre-processed images use 'fill' for exact fit
                  : 'cover', // Fallback images use 'cover' for cropping
                objectPosition: 'center'
              }}
              loading="eager" // Load immediately for better UX
              fetchPriority="high" // Prioritize loading
              onLoad={() => {
                // Mark as loaded when image loads
                setLoadedImages(prev => new Set([...prev, currentBanner.id]));
              }}
              onError={(e) => {
                console.error('Banner image failed to load:', currentImageUrl);
                // Fallback to original image
                const target = e.target as HTMLImageElement;
                if (target.src !== currentBanner.image_url) {
                  target.src = currentBanner.image_url;
                }
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
            
      {/* Overlay with content if title or description exists */}
      {(currentBanner.title || currentBanner.description) && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white px-4 font-serif [text-shadow:_2px_2px_4px_rgb(0_0_0_/_0.8)]">
            {currentBanner.title && (
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-sans mb-1 sm:mb-2 drop-shadow-lg">
                {currentBanner.title}
              </h2>
            )}
            {currentBanner.description && (
              <p className="text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-md">
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
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;