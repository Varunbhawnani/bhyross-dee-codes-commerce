import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { Loader2, ShoppingBag } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { initiatePayment, isProcessing, error, clearError } = useRazorpayCheckout();

  const [formData, setFormData] = useState({
    // Shipping Address
    name: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Billing Address
    billingName: '',
    billingPhone: '',
    billingEmail: user?.email || '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    
    // Options
    sameAsBilling: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate shipping address
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';

    // Validate phone number
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Validate email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate pincode
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Validate billing address if different from shipping
    if (!formData.sameAsBilling) {
      if (!formData.billingName.trim()) errors.billingName = 'Billing name is required';
      if (!formData.billingPhone.trim()) errors.billingPhone = 'Billing phone is required';
      if (!formData.billingEmail.trim()) errors.billingEmail = 'Billing email is required';
      if (!formData.billingAddress.trim()) errors.billingAddress = 'Billing address is required';
      if (!formData.billingCity.trim()) errors.billingCity = 'Billing city is required';
      if (!formData.billingState.trim()) errors.billingState = 'Billing state is required';
      if (!formData.billingPincode.trim()) errors.billingPincode = 'Billing pincode is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const totalAmount = Math.round(getTotalPrice() * 1.18); // Including 18% tax
    
    const checkoutData = {
      cartItems,
      totalAmount,
      shippingAddress: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      billingAddress: formData.sameAsBilling ? undefined : {
        name: formData.billingName,
        phone: formData.billingPhone,
        email: formData.billingEmail,
        address: formData.billingAddress,
        city: formData.billingCity,
        state: formData.billingState,
        pincode: formData.billingPincode,
      },
    };

    try {
      await initiatePayment(checkoutData);
      // Clear cart after successful payment initiation
      clearCart();
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  if (!user || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={formErrors.name ? 'border-red-500' : ''}
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={formErrors.phone ? 'border-red-500' : ''}
                      />
                      {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={formErrors.address ? 'border-red-500' : ''}
                    />
                    {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={formErrors.city ? 'border-red-500' : ''}
                      />
                      {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={formErrors.state ? 'border-red-500' : ''}
                      />
                      {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className={formErrors.pincode ? 'border-red-500' : ''}
                      />
                      {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsBilling"
                      checked={formData.sameAsBilling}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, sameAsBilling: checked as boolean }))
                      }
                    />
                    <Label htmlFor="sameAsBilling">Billing address is same as shipping address</Label>
                  </div>
                </form>
              </Card>

              {/* Billing Address - Only show if different from shipping */}
              {!formData.sameAsBilling && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingName">Full Name *</Label>
                        <Input
                          id="billingName"
                          value={formData.billingName}
                          onChange={(e) => handleInputChange('billingName', e.target.value)}
                          className={formErrors.billingName ? 'border-red-500' : ''}
                        />
                        {formErrors.billingName && <p className="text-red-500 text-sm mt-1">{formErrors.billingName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billingPhone">Phone Number *</Label>
                        <Input
                          id="billingPhone"
                          type="tel"
                          value={formData.billingPhone}
                          onChange={(e) => handleInputChange('billingPhone', e.target.value)}
                          className={formErrors.billingPhone ? 'border-red-500' : ''}
                        />
                        {formErrors.billingPhone && <p className="text-red-500 text-sm mt-1">{formErrors.billingPhone}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="billingEmail">Email Address *</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        value={formData.billingEmail}
                        onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                        className={formErrors.billingEmail ? 'border-red-500' : ''}
                      />
                      {formErrors.billingEmail && <p className="text-red-500 text-sm mt-1">{formErrors.billingEmail}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="billingAddress">Address *</Label>
                      <Input
                        id="billingAddress"
                        value={formData.billingAddress}
                        onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                        className={formErrors.billingAddress ? 'border-red-500' : ''}
                      />
                      {formErrors.billingAddress && <p className="text-red-500 text-sm mt-1">{formErrors.billingAddress}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="billingCity">City *</Label>
                        <Input
                          id="billingCity"
                          value={formData.billingCity}
                          onChange={(e) => handleInputChange('billingCity', e.target.value)}
                          className={formErrors.billingCity ? 'border-red-500' : ''}
                        />
                        {formErrors.billingCity && <p className="text-red-500 text-sm mt-1">{formErrors.billingCity}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billingState">State *</Label>
                        <Input
                          id="billingState"
                          value={formData.billingState}
                          onChange={(e) => handleInputChange('billingState', e.target.value)}
                          className={formErrors.billingState ? 'border-red-500' : ''}
                        />
                        {formErrors.billingState && <p className="text-red-500 text-sm mt-1">{formErrors.billingState}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billingPincode">Pincode *</Label>
                        <Input
                          id="billingPincode"
                          value={formData.billingPincode}
                          onChange={(e) => handleInputChange('billingPincode', e.target.value)}
                          className={formErrors.billingPincode ? 'border-red-500' : ''}
                        />
                        {formErrors.billingPincode && <p className="text-red-500 text-sm mt-1">{formErrors.billingPincode}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      {item.products?.product_images?.[0]?.image_url && (
                        <img
                          src={item.products.product_images[0].image_url}
                          alt={item.products?.name || 'Product'}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.products?.name || 'Product'}</h4>
                        <p className="text-xs text-neutral-600">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">₹{((item.products?.price || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-red-700 text-sm">{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="text-red-600 hover:text-red-700 p-0 h-auto"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {/* Pay Now Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-neutral-900 hover:bg-neutral-800"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${total.toLocaleString()}`
                  )}
                </Button>

                <div className="text-center text-sm text-neutral-600 mt-4">
                  <p>Secure payment powered by Razorpay</p>
                  <p className="mt-1">All major payment methods accepted</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;