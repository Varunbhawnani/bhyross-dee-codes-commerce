import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Minus, Plus, Trash2, ShoppingBag, User } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice, isLoading } = useCart();
  const { user } = useAuth();
  const analytics = useAnalytics();

  // Helper function to get color code from color name
  const getColorCode = (colorName) => {
    if (!colorName) return '#9CA3AF'; // Default gray
    
    const colorMap = {
      // Basic colors
      'red': '#EF4444',
      'blue': '#3B82F6',
      'green': '#10B981',
      'yellow': '#F59E0B',
      'purple': '#8B5CF6',
      'pink': '#EC4899',
      'orange': '#F97316',
      'cyan': '#06B6D4',
      'lime': '#84CC16',
      'indigo': '#6366F1',
      'teal': '#14B8A6',
      'rose': '#F43F5E',
      
      // Neutral colors
      'black': '#1F2937',
      'white': '#F9FAFB',
      'gray': '#6B7280',
      'grey': '#6B7280',
      'silver': '#9CA3AF',
      'gold': '#F59E0B',
      
      // Leather/shoe specific colors
      'brown': '#92400E',
      'tan': '#D2B48C',
      'cognac': '#A0522D',
      'mahogany': '#C04000',
      'chestnut': '#954535',
      'burgundy': '#800020',
      'navy': '#1E3A8A',
      'olive': '#6B7280',
      'camel': '#C19A6B',
      'espresso': '#3C2415',
      'chocolate': '#7B3F00',
      'honey': '#FFA500',
      'charcoal': '#36454F',
      'cream': '#FFFDD0',
      'beige': '#F5F5DC',
      'nude': '#E3C4A8',
      'taupe': '#72695A'
    };

    const normalizedColor = colorName.toLowerCase().trim();
    return colorMap[normalizedColor] || '#9CA3AF';
  };

  // Helper function to get product URL
  const getProductUrl = (product) => {
    if (!product?.id) return null;
    
    const brand = product.brand || 'bhyross';
    const category = product.category || 'oxford';
    
    return `/${brand}/${category}/${product.id}`;
  };

  // Track view_cart event when cart page loads with items
  useEffect(() => {
    if (cartItems.length > 0) {
      // Use the dedicated trackViewCart method
      analytics.trackViewCart(cartItems, getTotalPrice());
    }
  }, [cartItems, getTotalPrice, analytics]);

  // Handle checkout button click
  const handleCheckout = () => {
    if (cartItems.length > 0) {
      const totalValue = getTotalPrice(); // Use subtotal without tax
      
      // Use the dedicated trackBeginCheckout method
      analytics.trackBeginCheckout(cartItems.map(item => ({
        productId: item.products?.id || item.product_id,
        name: item.products?.name || 'Product',
        category: 'Unknown',
        brand: item.products?.brand || 'Unknown',
        price: item.products?.price || 0,
        quantity: item.quantity
      })), totalValue);

      // If user is not authenticated, redirect to auth with return path
      if (!user) {
        // Store the intended destination
        sessionStorage.setItem('checkout_return_path', '/checkout');
        navigate('/auth?redirect=/checkout');
      } else {
        // Navigate to checkout page
        navigate('/checkout');
      }
    }
  };

  // Handle continue shopping clicks
  const handleContinueShopping = (source) => {
    analytics.trackCustomEvent('continue_shopping', {
      source: source,
      user_type: user ? 'authenticated' : 'guest'
    });
  };

  // Handle product click navigation with proper tracking
  const handleProductClick = (product) => {
    if (product) {
      // Track product view
      analytics.trackProductView({
        id: product.id,
        name: product.name,
        category: product.category || 'Unknown',
        brand: product.brand || 'Unknown',
        price: product.price
      });
      
      // Navigate to product page
      const productUrl = getProductUrl(product);
      if (productUrl) {
        navigate(productUrl);
      }
    }
  };

  // Handle quantity update with tracking
  const handleQuantityUpdate = (itemId, newQuantity) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item && newQuantity > 0) {
      const oldQuantity = item.quantity;
      
      // Update quantity in cart
      updateQuantity({ id: itemId, quantity: newQuantity });
      
      // Track quantity change
      analytics.trackCustomEvent('cart_quantity_change', {
        product_id: item.products?.id || item.product_id,
        product_name: item.products?.name || 'Product',
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        quantity_change: newQuantity - oldQuantity,
        value_change: (newQuantity - oldQuantity) * (item.products?.price || 0),
        user_type: user ? 'authenticated' : 'guest'
      });
    }
  };

  // Handle remove from cart with proper tracking
  const handleRemoveFromCart = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      // Track remove from cart event
      analytics.trackRemoveFromCart({
        productId: item.products?.id || item.product_id,
        name: item.products?.name || 'Product',
        category: 'Unknown',
        brand: item.products?.brand || 'Unknown',
        price: item.products?.price || 0,
        quantity: item.quantity
      });
      
      // Remove from cart
      removeFromCart(itemId);
    }
  };

  // Handle clear cart with tracking
  const handleClearCart = () => {
    if (cartItems.length > 0) {
      // Track cart clear event
      analytics.trackCustomEvent('cart_cleared', {
        items_count: cartItems.length,
        total_value: getTotalPrice(),
        user_type: user ? 'authenticated' : 'guest'
      });
      
      // Clear cart
      clearCart();
    }
  };

  // Track cart abandonment when user leaves page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (cartItems.length > 0) {
        analytics.trackCartAbandonment(cartItems, getTotalPrice(), 'cart_page');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cartItems, getTotalPrice, analytics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
        <Footer brand="bhyross" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 pt-20 sm:pt-24 pb-8 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 lg:h-24 lg:w-24 text-neutral-400 mx-auto mb-4 sm:mb-6" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">Your cart is empty</h1>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Start shopping to add items to your cart
            </p>
            
            {/* Continue Shopping Button */}
            <div className="flex justify-center px-4">
              <Link to="/">
                <Button 
                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base"
                  onClick={() => handleContinueShopping('empty_cart')}
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer brand="bhyross" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-20 sm:pt-24 pb-8 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-neutral-900 mb-3 sm:mb-0">Shopping Cart</h1>
            <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-4">
              <div className="text-xs sm:text-sm lg:text-base text-neutral-600">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
              </div>
              {!user && (
                <div className="flex items-center space-x-2 bg-blue-50 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full w-fit">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <span className="text-xs sm:text-sm text-blue-600">Guest</span>
                </div>
              )}
            </div>
          </div>

          {/* Guest user notice */}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h3 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">Shopping as Guest</h3>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Sign in to save your cart and enjoy a personalized shopping experience
                  </p>
                </div>
                <Link to="/auth" className="sm:flex-shrink-0">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-auto text-sm py-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Clickable Product Image */}
                    {(() => {
                      const imageUrl = item.product_variants?.product_images?.[0]?.image_url || 
                                     item.products?.product_images?.[0]?.image_url;
                      const productUrl = getProductUrl(item.products);
                      
                      return imageUrl ? (
                        <div 
                          className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 flex-shrink-0 group ${productUrl ? 'cursor-pointer' : ''}`}
                          onClick={() => productUrl && handleProductClick(item.products)}
                        >
                          <img
                            src={imageUrl}
                            alt={item.products?.name || 'Product'}
                            className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                          />
                        </div>
                      ) : null;
                    })()}
                    
                    <div className="flex-1 min-w-0">
                      {/* Clickable Product Name */}
                      <h3 
                        className={`font-semibold text-sm sm:text-base lg:text-lg xl:text-xl text-neutral-900 mb-2 transition-colors line-clamp-2 ${
                          getProductUrl(item.products) ? 'cursor-pointer hover:text-neutral-700' : ''
                        }`}
                        onClick={() => getProductUrl(item.products) && handleProductClick(item.products)}
                      >
                        {item.products?.name || 'Product'}
                      </h3>
                      
                      {/* Product Details with Color Swatch */}
                      <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4 mb-2 sm:mb-3">
                        <p className="text-xs sm:text-sm lg:text-base text-neutral-600">
                          <span className="capitalize font-medium">{item.products?.brand || 'Unknown'}</span>
                        </p>
                        
                        {/* Color with Swatch */}
                        {item.product_variants?.color_name && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm lg:text-base text-neutral-600">Color:</span>
                            <div className="flex items-center space-x-1">
                              <div 
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-neutral-300 shadow-sm"
                                style={{ backgroundColor: getColorCode(item.product_variants.color_name) }}
                                title={item.product_variants.color_name}
                              ></div>
                              <span className="text-xs sm:text-sm lg:text-base font-medium capitalize text-neutral-700">
                                {item.product_variants.color_name}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs sm:text-sm lg:text-base text-neutral-600">
                          Size: <span className="font-medium">{item.size}</span>
                        </p>
                      </div>
                      
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-neutral-900">
                        ₹{item.products?.price?.toLocaleString() || '0'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 sm:space-y-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 p-0"
                        >
                          <Minus className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                        </Button>
                        
                        <span className="w-6 sm:w-8 lg:w-10 text-center font-medium text-xs sm:text-sm lg:text-base">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 p-0"
                        >
                          <Plus className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                        </Button>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 p-0"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Cart Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 sm:pt-6 space-y-3 sm:space-y-0">
                <Button 
                  variant="outline" 
                  onClick={handleClearCart}
                  className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm py-2"
                >
                  Clear Cart
                </Button>
                <Link to="/">
                  <Button 
                    variant="ghost" 
                    className="text-neutral-600 hover:text-neutral-900 w-full sm:w-auto text-sm py-2"
                    onClick={() => handleContinueShopping('cart_page')}
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-neutral-900 mb-4 sm:mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold text-neutral-900">Total</span>
                    <span className="text-base sm:text-lg font-bold text-neutral-900">₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 sm:py-3 text-sm sm:text-base font-medium mb-3 sm:mb-4"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  {!user ? 'Sign In to Checkout' : 'Proceed to Checkout'}
                </Button>
                
                {!user && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-amber-800 text-center">
                      You'll be asked to sign in before completing your purchase
                    </p>
                  </div>
                )}
                
                <div className="text-center text-xs sm:text-sm text-neutral-500 space-y-2">
                  <p>🔒 Secure checkout with SSL encryption</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer brand="bhyross" />
    </div>
  );
};

export default CartPage;