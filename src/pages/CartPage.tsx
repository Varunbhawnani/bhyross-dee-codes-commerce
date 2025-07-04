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
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-24 w-24 text-neutral-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Please sign in</h1>
            <p className="text-lg text-neutral-600 mb-8">
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
            <ShoppingBag className="h-24 w-24 text-neutral-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-neutral-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <div className="space-x-4">
              <Link to="/bhyross">
                <Button className="bg-bhyross-500 hover:bg-bhyross-600">
                  Shop Bhyross
                </Button>
              </Link>
              <Link to="/deecodes">
                <Button className="bg-deecodes-500 hover:bg-deecodes-600">
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    {item.products?.product_images?.[0]?.image_url && (
                      <img
                        src={item.products.product_images[0].image_url}
                        alt={item.products?.name || 'Product'}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                        {item.products?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        Brand: <span className="capitalize font-medium">{item.products?.brand || 'Unknown'}</span> | Size: {item.size}
                      </p>
                      <p className="text-lg font-bold text-neutral-900">
                        ₹{item.products?.price?.toLocaleString() || '0'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
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
                <Button variant="outline" onClick={() => clearCart()}>
                  Clear Cart
                </Button>
                <div className="space-x-4">
                  <Link to="/">
                    <Button variant="ghost" className="text-bhyross-600 hover:text-bhyross-700">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
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
                
                <Button className="w-full bg-neutral-900 hover:bg-neutral-800 mb-3">
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