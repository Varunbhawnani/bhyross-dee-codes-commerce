import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
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

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-16">
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 text-neutral-400 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">Your cart is empty</h1>
            <p className="text-base sm:text-lg text-neutral-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:space-x-4 justify-center">
              <Link to="/bhyross">
                <Button 
                  className="bg-bhyross-500 hover:bg-bhyross-600 w-full sm:w-auto"
                  onClick={() => handleContinueShopping('bhyross')}
                >
                  Shop Bhyross
                </Button>
              </Link>
              <Link to="/deecodes">
                <Button 
                  className="bg-deecodes-500 hover:bg-deecodes-600 w-full sm:w-auto"
                  onClick={() => handleContinueShopping('deecodes')}
                >
                  Shop Dee Codes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-3 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {item.products?.product_images?.[0]?.image_url && (
                      <img
                        src={item.products.product_images[0].image_url}
                        alt={item.products?.name || 'Product'}
                        className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-lg text-neutral-900 mb-1 truncate">
                        {item.products?.name || 'Product'}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 mb-1 sm:mb-2">
                        <span className="capitalize font-medium">{item.products?.brand || 'Unknown'}</span> | Size: {item.size}
                      </p>
                      <p className="text-sm sm:text-lg font-bold text-neutral-900">
                        ₹{item.products?.price?.toLocaleString() || '0'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        
                        <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                          className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 space-y-3 sm:space-y-0">
                <Button variant="outline" onClick={() => clearCart()} className="w-full sm:w-auto">
                  Clear Cart
                </Button>
                <div className="w-full sm:w-auto">
                  <Link to="/">
                    <Button 
                      variant="ghost" 
                      className="text-bhyross-600 hover:text-bhyross-700 w-full sm:w-auto"
                      onClick={() => handleContinueShopping('general')}
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{Math.round(getTotalPrice() * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{Math.round(getTotalPrice() * 1.18).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-neutral-900 hover:bg-neutral-800 mb-3"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="text-center text-sm text-neutral-600">
                  <p>Secure checkout with SSL encryption</p>
                  <p className="mt-2">Free shipping on orders over ₹2,500</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;