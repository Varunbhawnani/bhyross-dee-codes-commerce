
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Star, Truck, Shield, ArrowLeft } from 'lucide-react';

const ProductPage = () => {
  const { category, productId } = useParams();
  const brand = location.pathname.includes('/bhyross/') ? 'bhyross' : 'deecodes';
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState('9');
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data
  const product = {
    id: productId || '1',
    name: `Premium ${category?.replace('-', ' ')} Shoe`,
    price: brand === 'bhyross' ? 18999 : 3499,
    originalPrice: brand === 'bhyross' ? 21999 : 4499,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571245078683-3bbf52d98bf6?w=600&h=600&fit=crop&crop=center'
    ],
    rating: 4.8,
    reviews: 156,
    description: brand === 'bhyross' 
      ? 'Crafted from premium Italian leather with traditional Goodyear welt construction. Each shoe is hand-finished by master artisans, featuring a timeless design that complements any formal attire.'
      : 'Modern design meets affordable quality in this expertly crafted formal shoe. Made with durable synthetic materials and designed for all-day comfort, perfect for the contemporary professional.',
    features: brand === 'bhyross' 
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
        ],
    sizes: ['7', '8', '9', '10', '11', '12'],
    inStock: true
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      brand: brand as 'bhyross' | 'deecodes'
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} (Size ${selectedSize}) has been added to your cart.`,
    });
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
            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
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
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-neutral-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-3xl font-bold text-neutral-900">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-neutral-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.originalPrice > product.price && (
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
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
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
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
                {product.features.map((feature, index) => (
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
