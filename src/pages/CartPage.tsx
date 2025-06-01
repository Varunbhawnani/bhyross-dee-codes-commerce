
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice, isLoading } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen professional-page">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-24 w-24 text-trust-400 mx-auto mb-6 animate-float" />
            <h1 className="text-3xl font-bold text-trust-900 mb-4 animate-fade-in">Please sign in</h1>
            <p className="text-lg text-trust-600 mb-8 animate-fade-in-up animation-delay-200">
              Sign in to view your cart and start shopping
            </p>
            <Link to="/auth">
              <Button className="btn-professional bg-trust-900 hover:bg-trust-800 text-white animate-scale-in animation-delay-400">
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
      <div className="min-h-screen professional-page">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-professional-600"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen professional-page">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-24 w-24 text-trust-400 mx-auto mb-6 animate-float" />
            <h1 className="text-3xl font-bold text-trust-900 mb-4 animate-fade-in">Your cart is empty</h1>
            <p className="text-lg text-trust-600 mb-8 animate-fade-in-up animation-delay-200">
              Start shopping to add items to your cart
            </p>
            <div className="space-x-4 animate-scale-in animation-delay-400">
              <Link to="/bhyross">
                <Button className="btn-bhyross">
                  Shop Bhyross
                </Button>
              </Link>
              <Link to="/deecodes">
                <Button className="btn-deecodes">
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
    <div className="min-h-screen bg-gradient-to-br from-trust-50 via-white to-trust-100">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-trust-900 mb-8 animate-fade-in">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card key={item.id} className={`professional-card p-6 card-hover stagger-item stagger-${Math.min(index + 1, 6)}`}>
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.products.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center'}
                      alt={item.products.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-trust-900 mb-1">
                        {item.products.name}
                      </h3>
                      <p className="text-sm text-trust-600 mb-2">
                        Brand: <span className="capitalize font-medium">{item.products.brand}</span> | Size: {item.size}
                      </p>
                      <p className="text-lg font-bold text-trust-900">
                        ₹{item.products.price.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1}
                        className="border-trust-300 text-trust-700 hover:bg-trust-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium text-trust-800">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                        className="border-trust-300 text-trust-700 hover:bg-trust-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={() => clearCart()} className="border-trust-300 text-trust-700 hover:bg-trust-50">
                  Clear Cart
                </Button>
                <Link to="/">
                  <Button variant="ghost" className="text-trust-600 hover:text-trust-800">Continue Shopping</Button>
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="professional-card p-6 sticky top-8 animate-fade-in-up animation-delay-600">
                <h2 className="text-xl font-semibold text-trust-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-trust-700">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-trust-700">
                    <span>Shipping</span>
                    <span className="text-success-600">Free</span>
                  </div>
                  <div className="flex justify-between text-trust-700">
                    <span>Tax</span>
                    <span>₹{Math.round(getTotalPrice() * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-trust-200 pt-3">
                    <div className="flex justify-between font-semibold text-lg text-trust-900">
                      <span>Total</span>
                      <span>₹{Math.round(getTotalPrice() * 1.18).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full btn-professional bg-trust-900 hover:bg-trust-800 mb-3">
                  Proceed to Checkout
                </Button>
                
                <div className="text-center text-sm text-trust-600">
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
