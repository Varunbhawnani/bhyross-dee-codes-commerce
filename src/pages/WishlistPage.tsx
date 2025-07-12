import React, { useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const WishlistPage: React.FC = () => {
  const { wishlistItems, isLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSizes, setSelectedSizes] = useState<{[key: string]: number}>({});

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Heart className="h-16 w-16 sm:h-24 sm:w-24 text-neutral-400 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">Please sign in</h1>
            <p className="text-base sm:text-lg text-neutral-600 mb-8">
              Sign in to view your wishlist
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-neutral-900 hover:bg-neutral-800"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const handleSizeSelect = (itemId: string, size: number) => {
    setSelectedSizes(prev => ({ ...prev, [itemId]: size }));
  };

  const handleAddToCart = (item: any) => {
    const selectedSize = selectedSizes[item.id];
    if (!selectedSize) return;

    addToCart({
      productId: item.product_id,
      size: selectedSize,
      quantity: 1
    });
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  // Helper function to get the first image URL - now handles product_images table
  const getProductImageUrl = (item: any) => {
    // First try to get from product_images table (primary image first)
    if (item.products?.product_images && item.products.product_images.length > 0) {
      // Sort by is_primary (true first) then by display_order
      const sortedImages = [...item.products.product_images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.display_order || 0) - (b.display_order || 0);
      });
      return sortedImages[0].image_url;
    }
    
    // Fallback to images array if it exists
    if (item.products?.images && item.products.images.length > 0) {
      return item.products.images[0];
    }
    
    return null;
  };

  // Handle product click - Navigate to product page
  const handleProductClick = (item: any) => {
    if (item.products?.brand && item.products?.category && item.products?.id) {
      const productUrl = `/${item.products.brand}/${item.products.category}/${item.products.id}`;
      navigate(productUrl);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">My Wishlist</h1>
              <p className="text-neutral-600 mt-1">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            {wishlistItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                className="flex items-center space-x-2 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </Button>
            )}
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 sm:h-24 sm:w-24 text-neutral-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-neutral-600 mb-8">
                Start adding items you love to your wishlist
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-neutral-900 hover:bg-neutral-800"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            /* Wishlist Items */
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="p-3 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Product Image - Now Clickable */}
                    <div className="flex-shrink-0">
                      {getProductImageUrl(item) ? (
                        <img
                          src={getProductImageUrl(item)}
                          alt={item.products?.name || 'Product'}
                          className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleProductClick(item)}
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-neutral-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-neutral-300 transition-colors"
                             onClick={() => handleProductClick(item)}>
                          <span className="text-neutral-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          {/* Product Name - Now Clickable */}
                          <h3 
                            className="font-semibold text-sm sm:text-lg text-neutral-900 mb-1 truncate cursor-pointer hover:text-neutral-600 transition-colors"
                            onClick={() => handleProductClick(item)}
                          >
                            {item.products?.name || 'Product Name'}
                          </h3>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs sm:text-sm text-neutral-600 capitalize font-medium">
                              {item.products?.brand || 'Unknown Brand'}
                            </span>
                            {item.products?.category && (
                              <Badge variant="secondary" className="text-xs">
                                {item.products.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-lg font-bold text-neutral-900">
                            ₹{item.products?.price?.toLocaleString('en-IN') || '0'}
                          </p>
                        </div>

                        {/* Stock Status & Remove Button */}
                        <div className="flex flex-col items-end space-y-2">
                          {item.products?.stock_quantity === 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromWishlist(item.product_id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Heart className="h-4 w-4 fill-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Product Description */}
                      {item.products?.description && (
                        <p className="text-xs sm:text-sm text-neutral-600 mb-3 line-clamp-2">
                          {item.products.description}
                        </p>
                      )}

                      {/* Size Selection & Add to Cart */}
                      {item.products?.sizes && item.products.sizes.length > 0 && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-neutral-700 mb-2 block">
                              Select Size:
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {item.products.sizes.map((size) => (
                                <Button
                                  key={size}
                                  variant={selectedSizes[item.id] === size ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleSizeSelect(item.id, size)}
                                  className="h-8 px-3 text-xs sm:text-sm"
                                >
                                  {size}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button
                              onClick={() => handleAddToCart(item)}
                              disabled={item.products?.stock_quantity === 0 || !selectedSizes[item.id]}
                              className="flex items-center justify-center space-x-2 bg-neutral-900 hover:bg-neutral-800 flex-1 h-9 text-sm"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Add to Cart</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleProductClick(item)}
                              className="flex-1 h-9 text-sm"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* SKU */}
                      {item.products?.sku && (
                        <p className="text-xs text-neutral-500 mt-2">
                          SKU: {item.products.sku}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;