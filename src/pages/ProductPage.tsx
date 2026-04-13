import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import Footer from "@/components/Footer";
import { useProduct } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SEO, generateProductSchema, generateBreadcrumbSchema } from '@/components/SEO';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/hooks/useAuth';
import { Star, Truck, Shield, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, Heart, Minus, Plus, X } from 'lucide-react';

  const ProductPage = () => {

  const { category, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const brand = location.pathname.includes('/bhyross/') ? 'bhyross' : 
               location.pathname.includes('/deecodes/') ? 'deecodes' : 'imcolus';
  const { addToCart } = useCart();
  const { toggleWishlistItem, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const analytics = useAnalytics();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageTransition, setImageTransition] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [mobileZoomed, setMobileZoomed] = useState(false);

  const { data: product, isLoading } = useProduct(productId || '');

  // Get the currently selected variant
  const selectedVariant = product?.product_variants?.find(variant => variant.id === selectedVariantId);

  // Get images for the selected variant - ONLY variant images exist
  const getCurrentImages = () => {
    if (selectedVariant && selectedVariant.product_images && selectedVariant.product_images.length > 0) {
      return selectedVariant.product_images.map(img => img.image_url);
    }
    
    // Fallback to default images if no variant images (shouldn't happen in proper setup)
    return [
    ];
  };

  

  const images = getCurrentImages();

// Set loading priority for main image
const getImageLoading = (index: number) => {
  return index === selectedImage && selectedImage === 0 ? "eager" : "lazy";
};

  // Initialize selected variant when product loads - prioritize default variant
  useEffect(() => {
    if (product?.product_variants && product.product_variants.length > 0 && selectedVariantId === null) {
      // Find default variant first, otherwise use first available
      const defaultVariant = product.product_variants.find(variant => variant.is_default_color) 
                          || product.product_variants[0];
      
      if (defaultVariant) {
        setSelectedVariantId(defaultVariant.id);
        setSelectedImage(0); // Reset to first image when variant changes
      }
    }
  }, [product, selectedVariantId]);

  // Handle pending wishlist add after login
  useEffect(() => {
    const handlePendingWishlistAdd = async () => {
      if (user) {
        const pendingAdd = sessionStorage.getItem('pendingWishlistAdd');
        if (pendingAdd) {
          try {
            const { productId, variantId, productName } = JSON.parse(pendingAdd);
            
            // Clear the pending add
            sessionStorage.removeItem('pendingWishlistAdd');
            
            // Add to wishlist
            const success = await toggleWishlistItem(productId, variantId);
            
            if (success) {
              toast({
                title: "Added to wishlist",
                description: `${productName} has been added to your wishlist`,
              });
            }
          } catch (error) {
            console.error('Error handling pending wishlist add:', error);
            sessionStorage.removeItem('pendingWishlistAdd');
          }
        }
      }
    };

    handlePendingWishlistAdd();
  }, [user, toggleWishlistItem]);

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariantId]);

  // Track view_item event when product loads
  useEffect(() => {
    if (product && !hasTrackedView) {
      analytics.trackProductView(product);
      setHasTrackedView(true);
    }
  }, [product, analytics, hasTrackedView]);

  const handleAddToCart = () => {
    if (!product || !selectedVariantId || selectedSize === null) {
      toast({
        title: "Error",
        description: "Please select a color and size first",
        variant: "destructive",
      });
      return;
    }
    
    // Track add_to_cart event
    analytics.trackProductView(product);

    // Pass the quantity and variant info - updated interface
    addToCart({
      productId: product.id,
      variantId: selectedVariantId || undefined, // Pass undefined instead of null/empty string
      size: selectedSize,
      quantity: quantity,
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} item(s) added successfully`,
    });
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    
    // Track size selection
    analytics.trackCustomEvent('select_size', {
      product_id: product?.id,
      size: size,
      variant_id: selectedVariantId
    });
  };

  const handleVariantChange = (variantId: string) => {
    const variant = product?.product_variants?.find(v => v.id === variantId);
    if (!variant) return;

    setSelectedVariantId(variantId);
    setSelectedImage(0); // Reset to first image
    
    // Track color selection
    analytics.trackCustomEvent('select_color', {
      product_id: product?.id,
      variant_id: variantId,
      color: variant.color_name
    });
  };

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
    
    // Track image view
    analytics.trackCustomEvent('image_view', {
      product_id: product?.id,
      image_index: index,
      variant_id: selectedVariantId
    });
  };

  // Desktop zoom functionality
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || window.innerWidth <= 768) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const toggleDesktopZoom = (e: React.MouseEvent) => {
    if (window.innerWidth <= 768) return;
    
    // Check if click is on arrow button or its children
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    setIsZoomed(!isZoomed);
    
    // Track zoom interaction
    analytics.trackCustomEvent('zoom_zoom_toggle', {
      product_id: product?.id,
      action: isZoomed ? 'zoom_out' : 'zoom_in',
      variant_id: selectedVariantId
    });
  };

  

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    
    // Calculate if this is a horizontal swipe
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    if (deltaX > deltaY && deltaX > 10 && images.length > 1) {
      setIsSwiping(true);
      e.preventDefault(); // Prevent scrolling when swiping horizontally
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) {
      // This was a tap, not a swipe - toggle zoom on mobile
      if (window.innerWidth <= 768) {
        setMobileZoomed(!mobileZoomed);
        analytics.trackCustomEvent('mobile_zoom_toggle', {
          product_id: product?.id,
          action: mobileZoomed ? 'zoom_out' : 'zoom_in',
          variant_id: selectedVariantId
        });
      }
      return;
    }
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    
    // Minimum swipe distance
    const minSwipeDistance = 50;
    
    // Ensure it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance && images.length > 1) {
      if (deltaX > 0) {
        // Swipe left - next image
        nextImage();
      } else {
        // Swipe right - previous image
        prevImage();
      }
    }
    
    setIsSwiping(false);
  };

  

  const toggleFavorite = async () => {
    if (!product?.id || !selectedVariantId) return;
    
    // Check if user is logged in first
    if (!user) {
      // Store the intent to add to wishlist in session storage
      sessionStorage.setItem('pendingWishlistAdd', JSON.stringify({
        productId: product.id,
        variantId: selectedVariantId,
        productName: product.name
      }));
      
      // Redirect to auth page if not logged in
      navigate('/auth', { state: { from: location } });
      return;
    }
    
    try {
      // Toggle wishlist item with the currently selected variant ID (the one user is viewing when they click)
      const success = await toggleWishlistItem(product.id, selectedVariantId);
      
      if (success) {
        console.log('Wishlist item toggled successfully');
      } else {
        console.error('Failed to toggle wishlist item');
      }
    } catch (error) {
      console.error('Error toggling wishlist item:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Product not found</h1>
        </div>
      </div>
    );
  }

  // Check if product has variants
  if (!product.product_variants || product.product_variants.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Product variants not available</h1>
        </div>
      </div>
    );
  }

  const features = brand === 'bhyross' 
    ? [
        'Premium leather upper',
        'Goodyear welted construction',
        'Hand-stitched detailing',
        'Leather-lined interior',
        'Blake-stitched sole',
        'Premium packaging included'
      ]
    : [
        'Durable synthetic upper',
        'Cushioned footbed',
        'Slip-resistant sole',
        'Moisture-wicking lining',
        'Reinforced stitching',
        'Easy care materials'
      ];

  const nextImage = () => {
  setImageTransition(true);
  setTimeout(() => {
    const newIndex = (selectedImage + 1) % images.length;
    setSelectedImage(newIndex);
    handleImageChange(newIndex);
    setImageTransition(false);
  }, 150);
};

  const prevImage = () => {
  setImageTransition(true);
  setTimeout(() => {
    const newIndex = (selectedImage - 1 + images.length) % images.length;
    setSelectedImage(newIndex);
    handleImageChange(newIndex);
    setImageTransition(false);
  }, 150);
};

  // Get color for swatch display
  const getColorStyle = (colorName: string) => {
    const color = colorName?.toLowerCase() || '';
    const colorMap: { [key: string]: string } = {
      'black': '#000000',
      'brown': '#8B4513',
      'tan': '#D2B48C',
      'navy': '#000080',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'gray': '#808080',
      'grey': '#808080',
      'beige': '#F5F5DC',
      'cream': '#FFFDD0',
      'burgundy': '#800020',
      'olive': '#808000',
    };

    for (const [key, value] of Object.entries(colorMap)) {
      if (color.includes(key)) {
        return {
          backgroundColor: value,
          borderColor: color.includes('white') || color.includes('cream') ? '#D1D5DB' : 'transparent'
        };
      }
    }
    
    return { backgroundColor: '#9CA3AF' }; // Default gray
  };

  // Sort sizes in ascending order - handle null case
  const sortedSizes = product.sizes ? [...product.sizes].sort((a, b) => a - b) : [];

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQuantity);
    
    // Track quantity change
    analytics.trackCustomEvent('quantity_change', {
      product_id: product.id,
      new_quantity: newQuantity,
      variant_id: selectedVariantId
    });
  };

  // Get current stock (variant stock if available, otherwise product stock)
  const getCurrentStock = () => {
    if (selectedVariant && selectedVariant.stock_quantity !== null) {
      return selectedVariant.stock_quantity;
    }
    return product.stock_quantity;
  };

  const currentStock = getCurrentStock();
  
  const productImages = getCurrentImages();
  const mainImage = productImages[0] || 'https://lovable.dev/opengraph-image-p98pqg.png';

  // Generate SEO-friendly title and description
  const productTitle = product 
    ? `${product.name} - ${selectedVariant?.color_name || ''} | ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
    : 'Product';

  const productDescription = product
    ? `Buy ${product.name} online. ${product.description.substring(0, 120)}... Available in multiple colors and sizes. ₹${product.price}. Free shipping across India.`
    : 'Premium formal shoes';

  const productKeywords = product
    ? `${product.name}, ${brand} shoes, ${category.replace('-', ' ')}, formal shoes, buy ${product.name} online, mens formal shoes, leather shoes`
    : 'formal shoes';

  // Generate structured data
  const productSchema = product ? generateProductSchema(product, brand, category || '', currentStock) : null;
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: brand.charAt(0).toUpperCase() + brand.slice(1), url: `/${brand}` },
    { name: category?.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '', url: `/${brand}` },
    { name: product?.name || 'Product', url: `/${brand}/${category}/${productId}` }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema]
  };

  return (
    <>
      {product && (
        <SEO
          title={productTitle}
          description={productDescription}
          keywords={productKeywords}
          image={mainImage}
          type="product"
          schema={combinedSchema}
          canonical={`https://imcolus.in/${brand}/${category}/${productId}`}
        />
      )}
      
      <div className="min-h-screen bg-white">
        <Navigation />
      
      {/* Breadcrumb */}
      <div className="pt-20 pb-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-neutral-600 flex items-center">
            <Link to={`/`} className="flex items-center hover:text-neutral-900 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Collections
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div 
  ref={imageRef}
  className="aspect-square bg-neutral-100 rounded-lg overflow-hidden relative group cursor-pointer select-none"
  onMouseMove={handleMouseMove}
  onMouseEnter={() => window.innerWidth > 768 && setIsZoomed(true)}
  onMouseLeave={() => window.innerWidth > 768 && setIsZoomed(false)}
  onClick={toggleDesktopZoom}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
              <img
  src={images[selectedImage]}
  alt={`${product.name} - ${selectedVariant?.color_name}`}
  loading={getImageLoading(selectedImage)}
  className={`w-full h-full object-cover transition-all duration-300 ease-in-out ${
    imageTransition ? 'opacity-0' : 'opacity-100'
  } ${
    window.innerWidth > 768 
      ? (isZoomed ? 'scale-125' : 'scale-100')
      : (mobileZoomed ? 'scale-150' : 'scale-100')
  }`}
  style={
    window.innerWidth > 768 
      ? (isZoomed ? {
          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          transition: 'transform 0.1s ease-out, opacity 0.3s ease-in-out'
        } : {
          transition: 'opacity 0.3s ease-in-out'
        })
      : {
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-in-out'
        }
  }
  draggable={false}
/>
              
              {/* Desktop zoom indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                <div className="bg-white/90 rounded-full p-2 shadow-lg">
                  <ZoomIn className="h-4 w-4 text-neutral-700" />
                </div>
              </div>

              {/* Mobile zoom indicator */}
              <div className={`absolute top-4 right-4 transition-opacity md:hidden ${mobileZoomed ? 'opacity-100' : 'opacity-60'}`}>
                <div className="bg-white/90 rounded-full p-2 shadow-lg">
                  <ZoomIn className={`h-4 w-4 ${mobileZoomed ? 'text-blue-600' : 'text-neutral-700'}`} />
                </div>
              </div>

             
              
              {/* Desktop Navigation Arrows - Always visible on desktop */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg hidden md:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg hidden md:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Mobile swipe indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-xs md:hidden">
                
                </div>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Strip - Only show if multiple images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      handleImageChange(index);
                    }}
                    className={`aspect-square bg-neutral-100 rounded-md overflow-hidden border-2 transition-all hover:shadow-md ${
                      selectedImage === index 
                        ? 'border-neutral-900 shadow-md' 
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img
  src={image}
  alt={`${product.name} ${selectedVariant?.color_name} view ${index + 1}`}
  loading="lazy"
  className="w-full h-full object-cover"
/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl font-bold text-neutral-900" itemProp="name">
                  {product.name}
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className="p-2"
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product?.id || '') ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
                </Button>
              </div>
              
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-2xl font-bold text-neutral-900">
                  ₹{product.price.toLocaleString()}
                </span>
                {currentStock > 0 && currentStock <= 10 && (
                  <span className="text-sm text-red-600 font-medium">
                    {currentStock} left in stock
                  </span>
                )}
                {currentStock === 0 && (
                  <span className="text-sm text-red-600 font-medium">
                    Out of stock
                  </span>
                )}
              </div>

              <p className="text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection - Always show as we need variants */}
            {/* Color Selection - Always show as we need variants */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-3">
                Color:
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.product_variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedVariantId === variant.id
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border"
                      style={getColorStyle(variant.color_name || '')}
                    />
                    <span className="capitalize text-sm font-medium">
                      {variant.color_name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection - Only show if sizes exist */}
            {sortedSizes.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-3">
                  Size: <span className="font-normal text-neutral-600">{selectedSize || ''}</span>
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {sortedSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`py-2 text-center border-2 rounded-lg transition-all ${
                        selectedSize === size
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-3">Quantity:</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-base font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity(1)}
                  disabled={quantity >= 10}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-12"
                disabled={currentStock === 0}
              >
                {currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="bg-neutral-100 rounded-full p-2">
                    <Truck className="h-4 w-4 text-neutral-700" />
                  </div>
                  <span className="font-medium text-xs">Express Shipping</span>
                  <span className="text-neutral-500 text-xs">Available</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="bg-neutral-100 rounded-full p-2">
                    <Shield className="h-4 w-4 text-neutral-700" />
                  </div>
                  <span className="font-medium text-xs">Quality Guarantee</span>
                  <span className="text-neutral-500 text-xs">Authentic products only</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="bg-neutral-100 rounded-full p-2">
                    <ArrowLeft className="h-4 w-4 text-neutral-700" />
                  </div>
                  <span className="font-medium text-xs">Easy Returns</span>
                  <span className="text-neutral-500 text-xs">T&C applied</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <Card className="p-5 border border-neutral-200">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">Product Features</h3>
              <div className="grid grid-cols-1 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-neutral-700">
                    <div className="w-2 h-2 rounded-full mr-3 bg-neutral-900 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer brand='bhyross'/>
    </div>
    </>
  );
};

export default ProductPage;