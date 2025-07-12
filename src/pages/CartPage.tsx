import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice, isLoading } = useCart();
  const { user } = useAuth();
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackCustomEvent('page_view', {
      page: '/cart',
      title: 'Cart Page'
    });
  }, [analytics]);

  // Track view_cart event when cart page loads with items
  useEffect(() => {
    if (cartItems.length > 0) {
      analytics.trackCustomEvent('view_cart', {
        currency: 'INR',
        value: getTotalPrice(),
        items: cartItems.map(item => ({
          item_id: item.products?.id || item.id,
          item_name: item.products?.name || 'Product',
          item_category: 'Unknown',
          item_brand: item.products?.brand || 'Unknown',
          price: item.products?.price || 0,
          quantity: item.quantity,
          item_variant: `Size ${item.size}`
        }))
      });
    }
  }, [cartItems, getTotalPrice, analytics]);

  // Handle checkout button click - Navigate to checkout page
  const handleCheckout = () => {
    if (cartItems.length > 0) {
      const totalValue = Math.round(getTotalPrice() * 1.18); // Including tax
      
      analytics.trackBeginCheckout(cartItems.map(item => ({
        productId: item.products?.id || item.id,
        name: item.products?.name || 'Product',
        category: 'Unknown',
        brand: item.products?.brand || 'Unknown',
        price: item.products?.price || 0,
        quantity: item.quantity
      })), totalValue);

      // Navigate to checkout page
      navigate('/checkout');
    }
  };

  // Handle continue shopping clicks
  const handleContinueShopping = (brand: string) => {
    analytics.trackCustomEvent('continue_shopping', {
      source: 'cart_page',
      brand: brand
    });
  };

  // Handle product click navigation
  const handleProductClick = (product) => {
    if (product?.category && product?.id) {
      const brand = product.brand?.toLowerCase() || 'bhyross';
      window.location.href = `/${brand}/${product.category}/${product.id}`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 text-neutral-400 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">Please sign in</h1>
            <p className="text-base sm:text-lg text-neutral-600 mb-8">
              Sign in to view your cart and start shopping
            </p>
            <Link to="/auth">
              <Button className="bg-neutral-900 hover:bg-neutral-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <Footer brand="bhyross" />
      </div>
    );
  }

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
        <div className="flex-1 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 text-neutral-400 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">Your cart is empty</h1>
            <p className="text-base sm:text-lg text-neutral-600 mb-8 max-w-md mx-auto">
              Start shopping to add items to your cart
            </p>
            
            {/* Continue Shopping Button */}
            <div className="flex justify-center">
              <Link to="/">
                <Button 
                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3"
                  onClick={() => handleContinueShopping('general')}
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
      
      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 sm:mb-0">Shopping Cart</h1>
            <div className="text-sm sm:text-base text-neutral-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    {/* Clickable Product Image */}
                    {item.products?.product_images?.[0]?.image_url && (
                      <div 
                        className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex-shrink-0 cursor-pointer group"
                        onClick={() => handleProductClick(item.products)}
                      >
                        <img
                          src={item.products.product_images[0].image_url}
                          alt={item.products?.name || 'Product'}
                          className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {/* Clickable Product Name */}
                      <h3 
                        className="font-semibold text-base sm:text-lg lg:text-xl text-neutral-900 mb-2 cursor-pointer hover:text-neutral-700 transition-colors line-clamp-2"
                        onClick={() => handleProductClick(item.products)}
                      >
                        {item.products?.name || 'Product'}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3">
                        <p className="text-sm sm:text-base text-neutral-600 mb-1 sm:mb-0">
                          <span className="capitalize font-medium">{item.products?.brand || 'Unknown'}</span>
                        </p>
                        <p className="text-sm sm:text-base text-neutral-600">
                          Size: <span className="font-medium">{item.size}</span>
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-neutral-900">
                        ₹{item.products?.price?.toLocaleString() || '0'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0 sm:h-10 sm:w-10"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        
                        <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                          className="h-8 w-8 p-0 sm:h-10 sm:w-10"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 sm:h-10 sm:w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Cart Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 space-y-4 sm:space-y-0">
                <Button 
                  variant="outline" 
                  onClick={() => clearCart()} 
                  className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  Clear Cart
                </Button>
                <Link to="/">
                  <Button 
                    variant="ghost" 
                    className="text-neutral-600 hover:text-neutral-900 w-full sm:w-auto"
                    onClick={() => handleContinueShopping('general')}
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-neutral-600">Subtotal</span>
                    <span className="text-base font-medium">₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-neutral-600">Shipping</span>
                    <span className="text-base font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-neutral-600">Tax (18%)</span>
                    <span className="text-base font-medium">₹{Math.round(getTotalPrice() * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-neutral-900">Total</span>
                      <span className="text-lg font-bold text-neutral-900">₹{Math.round(getTotalPrice() * 1.18).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 text-base font-medium mb-4"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="text-center text-sm text-neutral-500 space-y-2">
                  <p>🔒 Secure checkout with SSL encryption</p>
                  <p>📦 Free shipping on orders over ₹2,500</p>
                  <p>↩️ 30-day return policy</p>
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