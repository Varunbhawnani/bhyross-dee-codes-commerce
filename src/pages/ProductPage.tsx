
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Star, Truck, Shield, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductPage = () => {
  const { category, productId } = useParams();
  const brand = location.pathname.includes('/bhyross/') ? 'bhyross' : 'deecodes';
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<number>(9);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useProduct(productId || '');

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      productId: product.id,
      size: selectedSize,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand={brand} />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand={brand} />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Product not found</h1>
        </div>
      </div>
    );
  }

  const images = product.product_images.length > 0
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
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand={brand} />
      
      {/* Breadcrumb */}
      <div className="pt-20 pb-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-neutral-600 flex items-center">
            <Link to={`/${brand}/${category}`} className="flex items-center hover:text-neutral-900">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {category?.replace('-', ' ')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden relative group">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows - Only show if multiple images */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Strip - Only show if multiple images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-neutral-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'
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
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-3xl font-bold text-neutral-900">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>

              <p className="text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Size</h3>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center border rounded-lg transition-colors ${
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

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className={`w-full ${
                  brand === 'bhyross' 
                    ? 'bg-bhyross-500 hover:bg-bhyross-600' 
                    : 'bg-deecodes-500 hover:bg-deecodes-600'
                }`}
                disabled={product.stock_quantity === 0}
              >
                {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="flex flex-col items-center">
                  <Truck className="h-6 w-6 text-neutral-600 mb-1" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="h-6 w-6 text-neutral-600 mb-1" />
                  <span>Quality Guarantee</span>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowLeft className="h-6 w-6 text-neutral-600 mb-1" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Features</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-neutral-600">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      brand === 'bhyross' ? 'bg-bhyross-500' : 'bg-deecodes-500'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
