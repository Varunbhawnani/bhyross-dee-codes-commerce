import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import Footer from "@/components/Footer";
import { useProduct } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Star, Truck, Shield, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, Heart, Minus, Plus } from 'lucide-react';

const ProductPage = () => {
  const { category, productId } = useParams();
  const brand = location.pathname.includes('/bhyross/') ? 'bhyross' : 
               location.pathname.includes('/deecodes/') ? 'deecodes' : 'imcolus';
  const { addToCart } = useCart();
  const { toast } = useToast();
  const analytics = useAnalytics();
  const [selectedSize, setSelectedSize] = useState<number>(9);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageTransition, setImageTransition] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading } = useProduct(productId || '');

  // Track page view when component mounts
  useEffect(() => {
    if (product && !hasTrackedView) {
      analytics.trackCustomEvent('page_view', { page: `/product/${productId}`, title: `Product: ${product.name}` });
      setHasTrackedView(true);
    }
  }, [product, productId, analytics, hasTrackedView]);

  // Track view_item event when product loads
  useEffect(() => {
    if (product && !hasTrackedView) {
      analytics.trackCustomEvent('view_item', {
        currency: 'INR',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category || 'Unknown',
          item_brand: product.brand || brand,
          price: product.price,
          quantity: 1,
          item_variant: selectedColor || 'default'
        }]
      });
    }
  }, [product, brand, selectedColor, analytics, hasTrackedView]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Track add_to_cart event
    analytics.trackCustomEvent('add_to_cart', {
      currency: 'INR',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Unknown',
        item_brand: product.brand || brand,
        price: product.price,
        quantity: quantity,
        item_variant: `${selectedColor || 'default'} - Size ${selectedSize}`
      }]
    });

    // Pass the quantity directly instead of calling addToCart multiple times
    addToCart({
      productId: product.id,
      size: selectedSize,
      quantity: quantity, // Pass the quantity here
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} item(s) added successfully`,
    });
  };

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    
    // Track size selection
    analytics.trackCustomEvent('select_item', {
      item_list_id: 'product_sizes',
      item_list_name: 'Product Sizes',
      items: [{
        item_id: product?.id || '',
        item_name: product?.name || '',
        item_category: product?.category || 'Unknown',
        item_brand: product?.brand || brand,
        price: product?.price || 0,
        quantity: 1,
        item_variant: `Size ${size}`
      }]
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Track color selection
    analytics.trackCustomEvent('select_item', {
      item_list_id: 'product_colors',
      item_list_name: 'Product Colors',
      items: [{
        item_id: product?.id || '',
        item_name: product?.name || '',
        item_category: product?.category || 'Unknown',
        item_brand: product?.brand || brand,
        price: product?.price || 0,
        quantity: 1,
        item_variant: color
      }]
    });
  };

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
    
    // Track image view
    analytics.trackCustomEvent('view_item_image', {
      item_id: product?.id || '',
      item_name: product?.name || '',
      image_index: index,
      total_images: images.length
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    
    // Track zoom interaction
    analytics.trackCustomEvent('product_interaction', {
      interaction_type: isZoomed ? 'zoom_out' : 'zoom_in',
      item_id: product?.id || '',
      item_name: product?.name || ''
    });
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    
    // Track favorite toggle
    analytics.trackCustomEvent('add_to_wishlist', {
      currency: 'INR',
      value: product?.price || 0,
      items: [{
        item_id: product?.id || '',
        item_name: product?.name || '',
        item_category: product?.category || 'Unknown',
        item_brand: product?.brand || brand,
        price: product?.price || 0,
        quantity: 1,
        item_variant: `${selectedColor || 'default'} - Size ${selectedSize}`
      }]
    });
    
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Item removed from your wishlist" : "Item added to your wishlist",
    });
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

  // Initialize selected color if not set and colors are available
  if (!selectedColor && product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    setSelectedColor(product.colors[0] as string);
  }

  const images = product.product_images?.length > 0
    ? product.product_images.map(img => img.image_url)
    : [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop&crop=center'
    ];

  const features = brand === 'bhyross' 
    ? [
        'Premium Italian leather upper',
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

  // Handle colors - ensure it's an array of strings
  const colors = product.colors && Array.isArray(product.colors) 
    ? product.colors.filter(color => typeof color === 'string') as string[]
    : [];

  // Sort sizes in ascending order
  const sortedSizes = [...product.sizes].sort((a, b) => a - b);

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQuantity);
    
    // Track quantity change
    analytics.trackCustomEvent('quantity_change', {
      item_id: product.id,
      item_name: product.name,
      previous_quantity: quantity,
      new_quantity: newQuantity
    });
  };

  return (
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
              className="aspect-square bg-neutral-100 rounded-lg overflow-hidden relative group cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-150 ${
                  imageTransition ? 'opacity-0' : 'opacity-100'
                } ${isZoomed ? 'scale-125' : 'scale-100'}`}
                style={isZoomed ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transition: 'transform 0.1s ease-out'
                } : {}}
              />
              
              {/* Zoom indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-2 shadow-lg">
                  <ZoomIn className="h-4 w-4 text-neutral-700" />
                </div>
              </div>
              
              {/* Navigation Arrows - Only show if multiple images */}
              {images.length > 1 && !isZoomed && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all bg-white/90 hover:bg-white shadow-lg"
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all bg-white/90 hover:bg-white shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
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
                      alt={`${product.name} view ${index + 1}`}
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
                <h1 className="text-2xl font-bold text-neutral-900">
                  {product.name}
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className="p-2"
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
                </Button>
              </div>
              
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-2xl font-bold text-neutral-900">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-sm text-neutral-500">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <p className="text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-3">
                  Color: <span className="font-normal capitalize text-neutral-600">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                        selectedColor === color
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-3">
                Size: <span className="font-normal text-neutral-600">{selectedSize}</span>
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

            {/* Quantity Selection */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-3">Quantity</h3>
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
                disabled={product.stock_quantity === 0}
              >
                {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="bg-neutral-100 rounded-full p-2">
                    <Truck className="h-4 w-4 text-neutral-700" />
                  </div>
                  <span className="font-medium text-xs">Free Shipping</span>
                  <span className="text-neutral-500 text-xs">On orders over ₹2,000</span>
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
                  <span className="text-neutral-500 text-xs">30-day return policy</span>
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
  );
};

export default ProductPage;