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

  const handleAddToCart = async (item: any) => {
  const selectedSize = selectedSizes[item.id];
  if (!selectedSize) {
    return;
  }

  addToCart({
    productId: item.product_id,
    variantId: item.variant_id || undefined, // Pass undefined instead of null
    size: selectedSize,
    quantity: 1
  });

  // Automatically remove from wishlist after adding to cart
  await handleRemoveFromWishlist(item.product_id, item.variant_id);
};

  const handleRemoveFromWishlist = async (productId: string, variantId?: string) => {
    await removeFromWishlist(productId, variantId);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  // Helper function to get the appropriate image URL - prioritize variant images
  const getProductImageUrl = (item: any) => {
    // First try variant-specific images if this is a variant item
    if (item.variant_id && item.product_variants?.product_images && item.product_variants.product_images.length > 0) {
      const sortedVariantImages = [...item.product_variants.product_images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      return sortedVariantImages[0].image_url;
    }
    
    // Then try general product images
    if (item.products?.product_images && item.products.product_images.length > 0) {
      // For variant items, try to find variant-specific images first
      if (item.variant_id) {
        const variantSpecificImages = item.products.product_images.filter(img => img.variant_id === item.variant_id);
        if (variantSpecificImages.length > 0) {
          const sortedImages = [...variantSpecificImages].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
          });
          return sortedImages[0].image_url;
        }
      }
      
      // Fallback to general product images
      const sortedImages = [...item.products.product_images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      return sortedImages[0].image_url;
    }
    
    // Fallback to images array if it exists
    if (item.products?.images && item.products.images.length > 0) {
      return item.products.images[0];
    }
    
    return null;
  };

  // Helper function to get display name with variant info
  const getDisplayName = (item: any) => {
    const baseName = item.products?.name || 'Product Name';
    
    
    
    return baseName;
  };

  // Helper function to get available sizes (from variant or product)
  const getAvailableSizes = (item: any) => {
    // If it's a variant item and has specific stock info, use that
    // For now, fall back to product sizes
    return item.products?.sizes || [];
  };

  // Helper function to check stock availability
  const getStockStatus = (item: any) => {
    if (item.variant_id && item.product_variants) {
      return {
        isInStock: (item.product_variants.stock_quantity || 0) > 0,
        quantity: item.product_variants.stock_quantity || 0
      };
    }
    
    return {
      isInStock: (item.products?.stock_quantity || 0) > 0,
      quantity: item.products?.stock_quantity || 0
    };
  };

  // Handle product click - Navigate to product page with variant
  const handleProductClick = (item: any) => {
    if (item.products?.brand && item.products?.category && item.products?.id) {
      let productUrl = `/${item.products.brand}/${item.products.category}/${item.products.id}`;
      
      // Add variant parameter if it exists
      if (item.variant_id) {
        productUrl += `?variant=${item.variant_id}`;
      }
      
      navigate(productUrl);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">My Wishlist</h1>
              <p className="text-neutral-600 mt-1 text-sm sm:text-base">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            {wishlistItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto h-9 sm:h-10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm sm:text-base">Clear All</span>
              </Button>
            )}
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Heart className="h-16 w-16 sm:h-24 sm:w-24 text-neutral-300 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-neutral-600 mb-6 sm:mb-8 text-sm sm:text-base">
                Start adding items you love to your wishlist
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-neutral-900 hover:bg-neutral-800 h-10 sm:h-11"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            /* Wishlist Items */
            <div className="space-y-2 sm:space-y-4">
              {wishlistItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const availableSizes = getAvailableSizes(item);
                
                return (
                  <Card key={item.id} className="p-2 sm:p-6 border-l-4 border-l-neutral-900 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Product Image - Ultra compact on mobile */}
                      <div className="flex-shrink-0">
                        {getProductImageUrl(item) ? (
                          <img
                            src={getProductImageUrl(item)}
                            alt={getDisplayName(item)}
                            className="w-12 h-12 sm:w-28 sm:h-28 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleProductClick(item)}
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-28 sm:h-28 bg-neutral-200 rounded-md flex items-center justify-center cursor-pointer hover:bg-neutral-300 transition-colors"
                               onClick={() => handleProductClick(item)}>
                            <span className="text-neutral-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info - Streamlined */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            {/* Product Name & Brand - Single line on mobile */}
                            <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                              <h3 
                                className="font-semibold text-sm sm:text-lg text-neutral-900 cursor-pointer hover:text-neutral-600 transition-colors truncate"
                                onClick={() => handleProductClick(item)}
                              >
                                {getDisplayName(item)}
                              </h3>
                              
                            </div>
                            
                            {/* Variant Info - Show color if available */}
                            {item.product_variants?.color_name && (
                              <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                                <Badge variant="outline" className="text-xs">
                                  Color: {item.product_variants.color_name}
                                </Badge>
                                {item.product_variants.sku && (
                                  <span className="text-xs text-neutral-500">
                                    SKU: {item.product_variants.sku}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Price & Category - Single line */}
                            <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
                              <p className="text-sm sm:text-lg font-bold text-neutral-900">
                                ₹{item.products?.price?.toLocaleString('en-IN') || '0'}
                              </p>
                              {item.products?.category && (
                                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                                  {item.products.category}
                                </Badge>
                              )}
                              {!stockStatus.isInStock && (
                                <Badge variant="destructive" className="text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons - Horizontal on mobile */}
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            {/* Size Selection - Inline on mobile ONLY */}
                            {availableSizes && availableSizes.length > 0 && (
                              <div className="sm:hidden">
                                <select
                                  value={selectedSizes[item.id] || ''}
                                  onChange={(e) => handleSizeSelect(item.id, Number(e.target.value))}
                                  className="w-16 h-7 px-1 text-xs border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                >
                                  <option value="">Size</option>
                                  {availableSizes.map((size) => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Add to Cart - Compact - Mobile ONLY */}
                            <Button
                              onClick={() => handleAddToCart(item)}
                              disabled={!stockStatus.isInStock || !selectedSizes[item.id]}
                              className="sm:hidden bg-neutral-900 hover:bg-neutral-800 h-7 px-2 text-xs"
                            >
                              <ShoppingCart className="h-3 w-3" />
                            </Button>

                            {/* Remove from Wishlist */}

                            {/* Remove from Wishlist */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromWishlist(item.product_id, item.variant_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                            >
                              <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-red-500" />
                            </Button>
                          </div>
                        </div>

                        {/* Product Description - Desktop only */}
                        {item.products?.description && (
                          <p className="text-sm text-neutral-600 mt-2 line-clamp-2 hidden sm:block">
                            {item.products.description}
                          </p>
                        )}

                        {/* Desktop Size Selection & Actions */}
                        {availableSizes && availableSizes.length > 0 && (
                          <div className="hidden sm:block mt-3 space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="flex flex-wrap gap-2">
                                {availableSizes.map((size) => (
                                  <Button
                                    key={size}
                                    variant={selectedSizes[item.id] === size ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleSizeSelect(item.id, size)}
                                    className="h-8 px-3 text-sm"
                                  >
                                    {size}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleAddToCart(item)}
                                disabled={!stockStatus.isInStock || !selectedSizes[item.id]}
                                className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 flex-1 h-9"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                <span>Add to Cart</span>
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleProductClick(item)}
                                className="flex-1 h-9"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Stock info - Desktop only */}
                        <div className="hidden sm:block mt-2 space-y-1">
                          
                          {/* SKU - Show product SKU if no variant SKU */}
                          {!item.product_variants?.sku && item.products?.sku && (
                            <p className="text-xs text-neutral-500">
                              SKU: {item.products.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;