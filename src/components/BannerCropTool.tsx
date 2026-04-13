import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Crop, RotateCcw, ZoomIn, ZoomOut, Move, Download } from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BannerCropToolProps {
  imageUrl: string;
  onCropChange: (desktopCrop: CropArea, mobileCrop: CropArea) => void;
  onCroppedImageGenerated?: (desktopUrl: string, mobileUrl: string) => void;
  initialDesktopCrop?: CropArea;
  initialMobileCrop?: CropArea;
}

// Fixed banner resolutions
const DESKTOP_RESOLUTION = { width: 1920, height: 800 }; // 2.4:1 aspect ratio
const MOBILE_RESOLUTION = { width: 375, height: 180 }; // 2.08:1 aspect ratio

const BannerCropTool: React.FC<BannerCropToolProps> = ({
  imageUrl,
  onCropChange,
  onCroppedImageGenerated,
  initialDesktopCrop,
  initialMobileCrop
}) => {
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentResolution = activeView === 'desktop' ? DESKTOP_RESOLUTION : MOBILE_RESOLUTION;
  const aspectRatio = currentResolution.width / currentResolution.height;

  // Calculate initial crop areas based on fixed resolutions and maintain aspect ratio
  const calculateInitialCrop = (resolution: typeof DESKTOP_RESOLUTION, imageWidth: number, imageHeight: number): CropArea => {
    const imageAspect = imageWidth / imageHeight;
    const targetAspect = resolution.width / resolution.height;

    let cropWidth, cropHeight;
    
    if (imageAspect > targetAspect) {
      // Image is wider than target - fit height, crop width
      cropHeight = imageHeight;
      cropWidth = cropHeight * targetAspect;
    } else {
      // Image is taller than target - fit width, crop height
      cropWidth = imageWidth;
      cropHeight = cropWidth / targetAspect;
    }

    // Ensure crop dimensions don't exceed image dimensions
    cropWidth = Math.min(cropWidth, imageWidth);
    cropHeight = Math.min(cropHeight, imageHeight);

    // Recalculate if we hit a limit to maintain aspect ratio
    if (cropWidth === imageWidth && cropHeight > imageHeight) {
      cropHeight = imageHeight;
      cropWidth = cropHeight * targetAspect;
    } else if (cropHeight === imageHeight && cropWidth > imageWidth) {
      cropWidth = imageWidth;
      cropHeight = cropWidth / targetAspect;
    }

    // Center the crop
    const x = (imageWidth - cropWidth) / 2;
    const y = (imageHeight - cropHeight) / 2;

    return {
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight)
    };
  };

  // FIXED: Initialize crops properly with saved data or defaults
  const [desktopCrop, setDesktopCrop] = useState<CropArea>(() => {
    if (initialDesktopCrop && initialDesktopCrop.width > 0 && initialDesktopCrop.height > 0) {
      console.log('Using provided desktop crop:', initialDesktopCrop);
      return initialDesktopCrop;
    }
    return { x: 0, y: 0, width: 1920, height: 800 };
  });

  const [mobileCrop, setMobileCrop] = useState<CropArea>(() => {
    if (initialMobileCrop && initialMobileCrop.width > 0 && initialMobileCrop.height > 0) {
      console.log('Using provided mobile crop:', initialMobileCrop);
      return initialMobileCrop;
    }
    return { x: 0, y: 0, width: 375, height: 180 };
  });

  const currentCrop = activeView === 'desktop' ? desktopCrop : mobileCrop;

  // FIXED: Handle image load and crop initialization
  useEffect(() => {
    if (isLoaded && imageRef.current) {
      const img = imageRef.current;
      console.log('Image loaded. Natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
      console.log('Initial crops provided:', { desktop: initialDesktopCrop, mobile: initialMobileCrop });
      
      // Only calculate default crops if no valid initial crops were provided
      let needsDesktopCropCalculation = true;
      let needsMobileCropCalculation = true;

      if (initialDesktopCrop && 
          initialDesktopCrop.width > 0 && 
          initialDesktopCrop.height > 0 && 
          initialDesktopCrop.x >= 0 && 
          initialDesktopCrop.y >= 0) {
        console.log('Using saved desktop crop');
        setDesktopCrop(initialDesktopCrop);
        needsDesktopCropCalculation = false;
      }

      if (initialMobileCrop && 
          initialMobileCrop.width > 0 && 
          initialMobileCrop.height > 0 && 
          initialMobileCrop.x >= 0 && 
          initialMobileCrop.y >= 0) {
        console.log('Using saved mobile crop');
        setMobileCrop(initialMobileCrop);
        needsMobileCropCalculation = false;
      }

      // Calculate default crops only if needed
      if (needsDesktopCropCalculation) {
        console.log('Calculating default desktop crop');
        const defaultDesktop = calculateInitialCrop(DESKTOP_RESOLUTION, img.naturalWidth, img.naturalHeight);
        setDesktopCrop(defaultDesktop);
      }

      if (needsMobileCropCalculation) {
        console.log('Calculating default mobile crop');
        const defaultMobile = calculateInitialCrop(MOBILE_RESOLUTION, img.naturalWidth, img.naturalHeight);
        setMobileCrop(defaultMobile);
      }

      drawCanvas();
    }
  }, [isLoaded, imageUrl]); // Removed initialDesktopCrop, initialMobileCrop from dependencies to avoid re-triggering

  // FIXED: Update crops when initial props change (for editing different banners)
  useEffect(() => {
    console.log('Initial crops changed:', { desktop: initialDesktopCrop, mobile: initialMobileCrop });
    
    if (initialDesktopCrop && 
        initialDesktopCrop.width > 0 && 
        initialDesktopCrop.height > 0) {
      console.log('Updating desktop crop from props');
      setDesktopCrop(initialDesktopCrop);
    }

    if (initialMobileCrop && 
        initialMobileCrop.width > 0 && 
        initialMobileCrop.height > 0) {
      console.log('Updating mobile crop from props');
      setMobileCrop(initialMobileCrop);
    }
  }, [initialDesktopCrop, initialMobileCrop, imageUrl]);

  useEffect(() => {
    if (isLoaded) {
      drawCanvas();
    }
  }, [currentCrop, activeView, zoom, isLoaded]);

  useEffect(() => {
    onCropChange(desktopCrop, mobileCrop);
  }, [desktopCrop, mobileCrop, onCropChange]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || imageLoadError) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = 800;
    const containerHeight = 600;
    
    // Calculate image display size maintaining aspect ratio
    const imageAspect = image.naturalWidth / image.naturalHeight;
    let displayWidth, displayHeight;
    
    if (imageAspect > containerWidth / containerHeight) {
      displayWidth = containerWidth * zoom;
      displayHeight = (containerWidth / imageAspect) * zoom;
    } else {
      displayHeight = containerHeight * zoom;
      displayWidth = (containerHeight * imageAspect) * zoom;
    }

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Center the image
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Draw image
    ctx.drawImage(image, offsetX, offsetY, displayWidth, displayHeight);

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    // Calculate crop rectangle in canvas coordinates
    const scaleX = displayWidth / image.naturalWidth;
    const scaleY = displayHeight / image.naturalHeight;
    
    const cropX = offsetX + (currentCrop.x * scaleX);
    const cropY = offsetY + (currentCrop.y * scaleY);
    const cropWidth = currentCrop.width * scaleX;
    const cropHeight = currentCrop.height * scaleY;

    // Clear crop area (remove overlay)
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
    
    // Redraw image in crop area
    ctx.drawImage(
      image,
      currentCrop.x,
      currentCrop.y,
      currentCrop.width,
      currentCrop.height,
      cropX,
      cropY,
      cropWidth,
      cropHeight
    );

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);

    // Draw corner handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    const handleSize = 12;
    
    const handles = [
      { x: cropX - handleSize/2, y: cropY - handleSize/2, cursor: 'nw-resize', name: 'nw' },
      { x: cropX + cropWidth - handleSize/2, y: cropY - handleSize/2, cursor: 'ne-resize', name: 'ne' },
      { x: cropX - handleSize/2, y: cropY + cropHeight - handleSize/2, cursor: 'sw-resize', name: 'sw' },
      { x: cropX + cropWidth - handleSize/2, y: cropY + cropHeight - handleSize/2, cursor: 'se-resize', name: 'se' }
    ];
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });

    // Draw center handle for moving
    const centerX = cropX + cropWidth/2 - handleSize/2;
    const centerY = cropY + cropHeight/2 - handleSize/2;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(centerX, centerY, handleSize, handleSize);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(centerX, centerY, handleSize, handleSize);

    // Draw resolution info
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(
      `Output: ${currentResolution.width} × ${currentResolution.height}px`,
      cropX,
      cropY - 10
    );

    // Draw grid lines for better precision
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(cropX + cropWidth/3, cropY);
    ctx.lineTo(cropX + cropWidth/3, cropY + cropHeight);
    ctx.moveTo(cropX + (cropWidth*2)/3, cropY);
    ctx.lineTo(cropX + (cropWidth*2)/3, cropY + cropHeight);
    ctx.stroke();
    
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + cropHeight/3);
    ctx.lineTo(cropX + cropWidth, cropY + cropHeight/3);
    ctx.moveTo(cropX, cropY + (cropHeight*2)/3);
    ctx.lineTo(cropX + cropWidth, cropY + (cropHeight*2)/3);
    ctx.stroke();
    
  }, [currentCrop, activeView, zoom, isLoaded, currentResolution, imageLoadError]);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setIsLoaded(true);
    setImageLoadError(false);
  };

  const handleImageError = () => {
    console.error('Image failed to load');
    setImageLoadError(true);
    setIsLoaded(false);
  };

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const getImageCoordinates = (canvasX: number, canvasY: number) => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return { x: 0, y: 0 };

    const containerWidth = canvas.width;
    const containerHeight = canvas.height;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    
    let displayWidth, displayHeight;
    if (imageAspect > containerWidth / containerHeight) {
      displayWidth = containerWidth * zoom;
      displayHeight = (containerWidth / imageAspect) * zoom;
    } else {
      displayHeight = containerHeight * zoom;
      displayWidth = (containerHeight * imageAspect) * zoom;
    }

    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;

    const scaleX = image.naturalWidth / displayWidth;
    const scaleY = image.naturalHeight / displayHeight;

    return {
      x: (canvasX - offsetX) * scaleX,
      y: (canvasY - offsetY) * scaleY
    };
  };

  const constrainCropToImage = (crop: CropArea, imageWidth: number, imageHeight: number): CropArea => {
    let { x, y, width, height } = crop;
    
    // Maintain exact aspect ratio
    const targetAspect = currentResolution.width / currentResolution.height;
    
    // Adjust width based on height to maintain aspect ratio
    const adjustedWidth = height * targetAspect;
    if (adjustedWidth <= imageWidth - x) {
      width = adjustedWidth;
    } else {
      // Adjust height based on available width
      width = imageWidth - x;
      height = width / targetAspect;
    }
    
    // Ensure crop stays within image bounds
    width = Math.min(width, imageWidth - x);
    height = Math.min(height, imageHeight - y);
    x = Math.max(0, Math.min(x, imageWidth - width));
    y = Math.max(0, Math.min(y, imageHeight - height));
    
    // Final aspect ratio correction
    const finalAspect = width / height;
    if (Math.abs(finalAspect - targetAspect) > 0.01) {
      if (width / targetAspect <= imageHeight - y) {
        height = width / targetAspect;
      } else {
        width = height * targetAspect;
      }
    }
    
    return { 
      x: Math.round(x), 
      y: Math.round(y), 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    const imageCoords = getImageCoordinates(x, y);
    
    // Check if click is within crop area for dragging
    if (imageCoords.x >= currentCrop.x && 
        imageCoords.x <= currentCrop.x + currentCrop.width &&
        imageCoords.y >= currentCrop.y && 
        imageCoords.y <= currentCrop.y + currentCrop.height) {
      setIsDragging(true);
      setDragStart({ x: imageCoords.x - currentCrop.x, y: imageCoords.y - currentCrop.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    const imageCoords = getImageCoordinates(x, y);
    
    const newX = Math.max(0, Math.min(imageCoords.x - dragStart.x, imageRef.current.naturalWidth - currentCrop.width));
    const newY = Math.max(0, Math.min(imageCoords.y - dragStart.y, imageRef.current.naturalHeight - currentCrop.height));
    
    const newCrop = constrainCropToImage(
      { ...currentCrop, x: newX, y: newY },
      imageRef.current.naturalWidth,
      imageRef.current.naturalHeight
    );
    
    if (activeView === 'desktop') {
      setDesktopCrop(newCrop);
    } else {
      setMobileCrop(newCrop);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const resetCrop = () => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    if (activeView === 'desktop') {
      const newCrop = calculateInitialCrop(DESKTOP_RESOLUTION, img.naturalWidth, img.naturalHeight);
      setDesktopCrop(newCrop);
    } else {
      const newCrop = calculateInitialCrop(MOBILE_RESOLUTION, img.naturalWidth, img.naturalHeight);
      setMobileCrop(newCrop);
    }
  };

  const generateCroppedImages = async () => {
    if (!imageRef.current || !onCroppedImageGenerated) return;
    
    setIsGenerating(true);
    
    try {
      const img = imageRef.current;
      
      // Create canvases for both crops
      const desktopCanvas = document.createElement('canvas');
      const mobileCanvas = document.createElement('canvas');
      
      desktopCanvas.width = DESKTOP_RESOLUTION.width;
      desktopCanvas.height = DESKTOP_RESOLUTION.height;
      mobileCanvas.width = MOBILE_RESOLUTION.width;
      mobileCanvas.height = MOBILE_RESOLUTION.height;
      
      const desktopCtx = desktopCanvas.getContext('2d');
      const mobileCtx = mobileCanvas.getContext('2d');
      
      if (!desktopCtx || !mobileCtx) return;
      
      // Draw cropped portions - this ensures exact output resolution
      desktopCtx.drawImage(
        img,
        desktopCrop.x, desktopCrop.y, desktopCrop.width, desktopCrop.height,
        0, 0, DESKTOP_RESOLUTION.width, DESKTOP_RESOLUTION.height
      );
      
      mobileCtx.drawImage(
        img,
        mobileCrop.x, mobileCrop.y, mobileCrop.width, mobileCrop.height,
        0, 0, MOBILE_RESOLUTION.width, MOBILE_RESOLUTION.height
      );
      
      // Convert to blobs and create URLs
      const desktopBlob = await new Promise<Blob>((resolve) => {
        desktopCanvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      });
      
      const mobileBlob = await new Promise<Blob>((resolve) => {
        mobileCanvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      });
      
      const desktopUrl = URL.createObjectURL(desktopBlob);
      const mobileUrl = URL.createObjectURL(mobileBlob);
      
      onCroppedImageGenerated(desktopUrl, mobileUrl);
      
    } catch (error) {
      console.error('Error generating cropped images:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (imageLoadError) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-red-500">
          <p>Failed to load image. Please check the image URL.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Banner Crop Tool - Fixed Resolution</Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={activeView === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('desktop')}
            >
              Desktop ({DESKTOP_RESOLUTION.width}×{DESKTOP_RESOLUTION.height})
            </Button>
            <Button
              type="button"
              variant={activeView === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('mobile')}
            >
              Mobile ({MOBILE_RESOLUTION.width}×{MOBILE_RESOLUTION.height})
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Badge variant="outline">
            {activeView === 'desktop' 
              ? `Desktop: ${DESKTOP_RESOLUTION.width}×${DESKTOP_RESOLUTION.height}px` 
              : `Mobile: ${MOBILE_RESOLUTION.width}×${MOBILE_RESOLUTION.height}px`
            }
          </Badge>
          <span>•</span>
          <span>Drag to move crop area</span>
          <span>•</span>
          <span>Fixed aspect ratio maintained</span>
          <span>•</span>
          <span>Exact output resolution guaranteed</span>
        </div>

        {/* Debug info for crop persistence */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            <div>Current Crop: {JSON.stringify(currentCrop)}</div>
            <div>Initial Desktop: {JSON.stringify(initialDesktopCrop)}</div>
            <div>Initial Mobile: {JSON.stringify(initialMobileCrop)}</div>
          </div>
        )}

        <div 
          ref={containerRef}
          className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100"
          style={{ width: '800px', height: '600px', margin: '0 auto' }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-move"
          />
          
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="hidden"
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="border-l border-gray-300 mx-2 h-6"></div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetCrop}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset to Center
          </Button>

          {onCroppedImageGenerated && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={generateCroppedImages}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Generate Cropped Images
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>
            Current crop: {Math.round(currentCrop.x)}, {Math.round(currentCrop.y)} - 
            {Math.round(currentCrop.width)}×{Math.round(currentCrop.height)}px
          </div>
          <div>
            Output resolution: {currentResolution.width}×{currentResolution.height}px 
            (Aspect ratio: {aspectRatio.toFixed(2)}:1)
          </div>
          <div className="text-blue-600 font-medium">
            ✓ What you see in the crop area is exactly what will be displayed as the banner
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BannerCropTool;