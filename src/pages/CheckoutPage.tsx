import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart, CartItem } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfileWithAddress } from '@/hooks/useUserProfileWithAddress';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { useAnalytics } from '@/hooks/useAnalytics';
import { shiprocketService } from '@/services/shiprocketService';
import { Loader2, ShoppingBag, Truck, AlertCircle, MapPin, Zap, Clock } from 'lucide-react';

interface CheckoutData {
  cartItems: CartItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'Prepaid' | 'COD';
  shippingCharges: number;
  codCharges: number;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { profile, updateProfile, hasAddress, getFullName } = useUserProfileWithAddress();
  const { initiatePayment, isProcessing, error, clearError } = useRazorpayCheckout(clearCart);
  const analytics = useAnalytics();

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
    paymentMethod: 'Prepaid' as 'Prepaid' | 'COD',
    saveAddress: true,
    fastDelivery: false, // New option for fast delivery
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [addressChanged, setAddressChanged] = useState(false);

  // Shipping rates state
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [cheapestCourier, setCheapestCourier] = useState<any>(null);
  const [fastestCourier, setFastestCourier] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingRates, setLoadingRates] = useState(false);
  const [codAvailable, setCodAvailable] = useState(false);
  const [codMessage, setCodMessage] = useState('');

  // Auto-fill form with saved profile data
  useEffect(() => {
    if (profile && hasAddress() && !addressChanged) {
      const fullName = getFullName() || profile.email?.split('@')[0] || 'User';
      
      setFormData(prev => ({
        ...prev,
        name: fullName,
        phone: profile.phone || '',
        email: profile.email || user?.email || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      }));

      // Track that we auto-filled the address
      analytics.trackEvent('address_autofilled', {
        has_saved_address: true
      });
    }
  }, [profile, user?.email]);

  // Update the transformedCartItems
  const transformedCartItems: CartItem[] = cartItems.map(item => {
    return {
      id: item.id || `item_${Date.now()}_${Math.random()}`,
      user_id: user?.id || '', 
      product_id: item.product_id || item.id,
      variant_id: item.variant_id || null,
      size: typeof item.size === 'string' ? parseInt(item.size) || 7 : (item.size || 7),
      quantity: item.quantity || 1,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      products: item.products || {
        id: item.product_id || item.id,
        name: 'Product',
        price: 0,
        brand: 'Unknown',
        product_images: []
      }
    };
  });

  // Helper function to get product URL
const getProductUrl = (product) => {
  if (!product?.id) return null;
  
  const brand = product.brand || 'bhyross';
  const category = product.category || 'oxford';
  
  return `/${brand}/${category}/${product.id}`;
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

  // Calculate pricing
  const subtotal = parseFloat(getTotalPrice().toFixed(2));
const tax = parseFloat((subtotal * 0.05 / 1.05).toFixed(2)); // Extract 5% tax from inclusive price
const productCostExclTax = parseFloat((subtotal - tax).toFixed(2)); // Product cost excluding tax// Extract 5% tax from inclusive price, accurate to 2 decimal places // Extract 5% tax from inclusive price
  const codCharges = 0;
  const totalBeforeRounding = subtotal + shippingCost + codCharges;
const roundingAdjustment = Math.round(totalBeforeRounding) - totalBeforeRounding;
const total = Math.round(totalBeforeRounding);

  // Helper function to parse delivery days and get numeric value for comparison
  const parseDeliveryDays = (deliveryString: string): number => {
    const match = deliveryString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 999;
  };

  // Get shipping rates function
  const getShippingRates = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      console.log('❌ Invalid pincode:', pincode);
      return;
    }
    
    setLoadingRates(true);
    try {
      console.log('🔍 Getting shipping rates for:', pincode);
      
      const totalWeight = transformedCartItems.reduce((weight, item) => {
        return weight + (item.quantity * 0.9);
      }, 0.2);

      const result = await shiprocketService.getShippingRates(
        '282007',
        pincode,
        Math.max(1, totalWeight),
        formData.paymentMethod === 'COD',
        subtotal + tax
      );
      
      if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
  const serviceable = result.data.filter((courier: any) => courier.serviceable);
  
  if (serviceable.length > 0) {
    setShippingRates(serviceable);
    
    // Find cheapest courier
    const cheapest = serviceable.reduce((prev: any, curr: any) => 
      (curr.total_charge || 0) < (prev.total_charge || 0) ? curr : prev
    );
    setCheapestCourier(cheapest);
    
    // Find fastest courier (lowest delivery days)
    const fastest = serviceable.reduce((prev: any, curr: any) => {
      const prevDays = parseDeliveryDays(prev.estimated_delivery_days || '999');
      const currDays = parseDeliveryDays(curr.estimated_delivery_days || '999');
      return currDays < prevDays ? curr : prev;
    });
    setFastestCourier(fastest);
    
    // Auto-select based on user preference
    const autoSelected = formData.fastDelivery ? fastest : cheapest;
    setSelectedCourier(autoSelected);
    setShippingCost(autoSelected.total_charge || 0);
  } else {
    useFallbackRates();
  }
} else {
  useFallbackRates();
}
    } catch (error) {
      console.error('❌ Failed to get shipping rates:', error);
      useFallbackRates();
    } finally {
      setLoadingRates(false);
    }
  };

  const useFallbackRates = () => {
  // No fallback rates - clear everything
  setShippingRates([]);
  setCheapestCourier(null);
  setFastestCourier(null);
  setSelectedCourier(null);
  setShippingCost(0);
};

  // Check COD availability
  // Check COD availability
// Set COD availability based on shipping availability
const setCodBasedOnShipping = () => {
  if (formData.pincode.length === 6 && !loadingRates) {
    if (shippingRates.length > 0) {
      setCodAvailable(true);
      setCodMessage('COD available for this pincode');
    } else {
      setCodAvailable(false);
      setCodMessage('COD not available - no shipping service to this pincode');
      if (formData.paymentMethod === 'COD') {
        setFormData(prev => ({ ...prev, paymentMethod: 'Prepaid' }));
      }
    }
  } else {
    setCodAvailable(false);
    setCodMessage('');
  }
};

  // Track page view and begin checkout when component mounts
  useEffect(() => {
    if (transformedCartItems.length > 0) {
      analytics.trackBeginCheckout(transformedCartItems, total);
      analytics.trackUserJourney('checkout_page_viewed', {
        items_count: transformedCartItems.length,
        total_value: total,
        has_saved_address: hasAddress()
      });
    }
  }, []);

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (!user) {
      analytics.trackError('authentication_error', 'User not authenticated on checkout page', 'checkout_page');
      navigate('/auth');
      return;
    }
    
    if (cartItems.length === 0) {
      analytics.trackCartAbandonment([], 0, 'empty_cart_checkout');
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate, analytics]);

  // Get shipping rates when pincode changes
  // Get shipping rates when pincode changes
// Get shipping rates when pincode changes
useEffect(() => {
  if (formData.pincode && formData.pincode.length === 6) {
    getShippingRates(formData.pincode);
  } else {
    setShippingRates([]);
    setSelectedCourier(null);
    setCheapestCourier(null);
    setFastestCourier(null);
    setShippingCost(0);
    setCodAvailable(false);
    setCodMessage('');
  }
}, [formData.pincode, formData.paymentMethod]);

// Set COD availability based on shipping rates
useEffect(() => {
  setCodBasedOnShipping();
}, [shippingRates, loadingRates, formData.pincode]);


  // Update selected courier when delivery preference changes
  useEffect(() => {
    if (cheapestCourier && fastestCourier) {
      const newSelected = formData.fastDelivery ? fastestCourier : cheapestCourier;
      setSelectedCourier(newSelected);
      setShippingCost(newSelected.total_charge || 0);
      
      analytics.trackEvent('delivery_preference_changed', {
        fast_delivery: formData.fastDelivery,
        courier_name: newSelected.courier_name,
        cost: newSelected.total_charge
      });
    }
  }, [formData.fastDelivery, cheapestCourier, fastestCourier]);

  // Track cart abandonment when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (transformedCartItems.length > 0) {
        analytics.trackCartAbandonment(transformedCartItems, total, 'checkout_page_exit');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [transformedCartItems, total, analytics]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark that address has been changed if it's an address field
    const addressFields = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
    if (addressFields.includes(field) && profile && typeof value === 'string') {
      setAddressChanged(true);
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }

    analytics.trackEngagement('form_field_interaction', undefined);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: 'Prepaid' | 'COD') => {
    // Only allow COD selection if it's available
    if (method === 'COD' && !codAvailable) {
      return;
    }
    
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    analytics.trackEvent('payment_method_selected', { method });
  };

  // Handle fast delivery toggle
  const handleFastDeliveryToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, fastDelivery: checked }));
  };

  // Save address to profile
  const saveAddressToProfile = async () => {
    if (!user || !addressChanged || !formData.saveAddress) return;
    
    try {
      await updateProfile({
        first_name: formData.name.split(' ')[0] || formData.name,
        last_name: formData.name.split(' ').slice(1).join(' ') || null,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      });

      analytics.trackEvent('address_saved', {
        is_first_address: !hasAddress(),
        address_changed: addressChanged
      });

      setAddressChanged(false);
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate shipping address
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }
    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    }

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

    // Validate COD availability
    if (formData.paymentMethod === 'COD' && !codAvailable) {
      errors.paymentMethod = 'COD is not available for this pincode';
    }

    // Validate shipping rates
    if (formData.pincode && formData.pincode.length === 6 && shippingRates.length === 0 && !loadingRates) {
      errors.pincode = 'Shipping not available to this pincode';
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      analytics.trackError('form_validation_error', `Form validation failed with ${Object.keys(errors).length} errors`, 'checkout_form');
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    analytics.trackEvent('checkout_form_submitted', {
      items_count: transformedCartItems.length,
      total_value: total,
      payment_method: formData.paymentMethod,
      address_changed: addressChanged,
      fast_delivery: formData.fastDelivery
    });
    
    if (!validateForm()) {
      analytics.trackError('form_validation_failed', 'Checkout form validation failed', 'checkout_form');
      return;
    }

    // Save address to profile if it has changed
    await saveAddressToProfile();

    const checkoutData: CheckoutData = {
      cartItems: transformedCartItems,
      totalAmount: total,
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
      paymentMethod: formData.paymentMethod,
      shippingCharges: shippingCost,
      codCharges: codCharges,
    };

    try {
      analytics.trackUserJourney('payment_initiated', {
        total_amount: total,
        items_count: transformedCartItems.length,
        payment_method: formData.paymentMethod,
        fast_delivery: formData.fastDelivery
      });

      await initiatePayment(checkoutData);

analytics.trackEvent('payment_initiation_success', {
  total_amount: total,
  items_count: transformedCartItems.length
});

// Don't clear cart here - it should only be cleared after successful payment confirmation
// clearCart();
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      
      analytics.trackError('payment_initiation_failed', 
        error instanceof Error ? error.message : 'Unknown payment error', 
        'checkout_payment'
      );
      
      analytics.trackCartAbandonment(transformedCartItems, total, 'payment_initiation_failed');
    }
  };

  const handleBillingAddressToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, sameAsBilling: checked }));
    analytics.trackEvent('billing_address_toggle', {
      same_as_shipping: checked
    });
  };

  const handleErrorDismiss = () => {
    clearError();
    analytics.trackEvent('error_dismissed', {
      error_type: 'payment_error'
    });
  };

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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                  {hasAddress() && !addressChanged && (
                    <div className="flex items-center text-green-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      Saved Address
                    </div>
                  )}
                  {addressChanged && (
                    <div className="flex items-center text-blue-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Address Modified
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={formErrors.name ? 'border-red-500' : ''}
                        placeholder="Enter your full name"
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
                        placeholder="10-digit mobile number"
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
                      placeholder="your.email@example.com"
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
                      placeholder="House no, Building, Street, Area"
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
                        placeholder="City name"
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
                        placeholder="State name"
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
                        placeholder="6-digit pincode"
                      />
                      {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
                      {loadingRates && formData.pincode.length === 6 && (
                        <p className="text-blue-500 text-sm mt-1 flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Checking shipping availability...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAsBilling"
                        checked={formData.sameAsBilling}
                        onCheckedChange={handleBillingAddressToggle}
                      />
                      <Label htmlFor="sameAsBilling">Billing address is same as shipping address</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveAddress"
                        checked={formData.saveAddress}
                        onCheckedChange={(checked) => handleInputChange('saveAddress', checked)}
                      />
                      <Label htmlFor="saveAddress">Save this address for future orders</Label>
                    </div>
                  </div>
                </form>
              </Card>

              {/* Delivery Options */}
              {/* Service Unavailable Message */}
{/* Service Unavailable Message */}
{formData.pincode.length === 6 && !loadingRates && shippingRates.length === 0 && (
  <Card className="p-6">
    <div className="flex items-center text-red-600">
      <AlertCircle className="w-5 h-5 mr-2" />
      <div>
        <h3 className="font-semibold">Service Not Available</h3>
        <p className="text-sm">We currently do not provide delivery service to pincode {formData.pincode}. Please try a different pincode or contact support.</p>
      </div>
    </div>
  </Card>
)}

{/* Delivery Options */}
{(cheapestCourier || fastestCourier) && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Options
                    {loadingRates && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                  </h2>
                  
                  

                  {/* Fast Delivery Toggle */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="fastDelivery"
                            checked={formData.fastDelivery}
                            onCheckedChange={handleFastDeliveryToggle}
                          />
                          <Label htmlFor="fastDelivery" className="flex items-center">
                            <Zap className="w-4 h-4 mr-1 text-orange-500" />
                            Fast Delivery
                          </Label>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{fastestCourier?.total_charge || 0}
                      </div>
                    </div>

                    

                    {/* Comparison */}
                    {cheapestCourier && fastestCourier && cheapestCourier.courier_company_id !== fastestCourier.courier_company_id && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <Clock className="w-3 h-3 mr-1 text-gray-500" />
                            <span className="font-medium">Standard</span>
                          </div>
                          <p className="text-gray-600">{cheapestCourier.courier_name}</p>
                          <p className="text-gray-600">Estimated delivery: {cheapestCourier.estimated_delivery_days} days</p>
                          <p className="font-medium">₹{cheapestCourier.total_charge}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <Zap className="w-3 h-3 mr-1 text-orange-500" />
                            <span className="font-medium">Express</span>
                          </div>
                          <p className="text-gray-600">{fastestCourier.courier_name}</p>
                          <p className="text-gray-600">Estimated delivery: {fastestCourier.estimated_delivery_days} days</p>
                          <p className="font-medium">₹{fastestCourier.total_charge}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Payment Method Selection */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'Prepaid'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaymentMethodChange('Prepaid')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Online Payment (Recommended)</h4>
                        <p className="text-sm text-gray-600">Pay via Credit/Debit Card, UPI, Net Banking</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        {formData.paymentMethod === 'Prepaid' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COD Option - Always visible but conditionally clickable */}
                  <div
                    className={`border rounded-lg p-3 transition-colors ${
                      formData.paymentMethod === 'COD'
                        ? 'border-blue-500 bg-blue-50'
                        : codAvailable 
                          ? 'border-gray-200 hover:border-gray-300 cursor-pointer'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => codAvailable && handlePaymentMethodChange('COD')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${!codAvailable ? 'text-gray-500' : ''}`}>
                          Cash on Delivery
                        </h4>
                        <p className={`text-sm ${!codAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pay when your order is delivered
                        </p>
                        {codCharges > 0 && (
                          <p className="text-xs text-amber-600">Additional charges: ₹{codCharges}</p>
                        )}
                        {/* COD Status Message */}
                        {formData.pincode.length === 6 && (
                          <div className="mt-2">
                            {loadingRates ? (
  <p className="text-xs text-blue-500 flex items-center">
    <Loader2 className="w-3 h-3 animate-spin mr-1" />
    Checking service availability...
  </p>
) : codMessage && (
                              <p className={`text-xs flex items-center ${
                                codAvailable ? 'text-green-600' : 'text-red-500'
                              }`}>
                                {codAvailable ? (
                                  <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                    {codMessage}
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {codMessage}
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        )}
                        {formData.pincode.length < 6 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Enter pincode to check COD availability
                          </p>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        codAvailable ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {formData.paymentMethod === 'COD' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {formErrors.paymentMethod && (
                    <p className="text-red-500 text-sm">{formErrors.paymentMethod}</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {transformedCartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      {item.products?.product_images?.[0]?.image_url && (
  <div 
    className={`w-12 h-12 flex-shrink-0 group ${getProductUrl(item.products) ? 'cursor-pointer' : ''}`}
    onClick={() => getProductUrl(item.products) && handleProductClick(item.products)}
  >
    <img
      src={item.products.product_images[0].image_url}
      alt={item.products?.name || 'Product'}
      className="w-full h-full object-cover rounded group-hover:opacity-90 transition-opacity"
    />
  </div>
)}
                      <div className="flex-1">
                        <h4 
  className={`font-medium text-sm transition-colors line-clamp-2 ${
    getProductUrl(item.products) ? 'cursor-pointer hover:text-neutral-700' : ''
  }`}
  onClick={() => getProductUrl(item.products) && handleProductClick(item.products)}
>
  {item.products?.name || 'Product'}
</h4>
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
  <div className="flex justify-between text-sm text-neutral-600">
  <span>Product Cost (excl. tax)</span>
  <span>₹{productCostExclTax.toFixed(2)}</span>
</div>
<div className="flex justify-between text-sm text-neutral-600">
  <span>Tax (5% - included)</span>
  <span>₹{tax.toFixed(2)}</span>
</div>

<div className="flex justify-between">
  <span>Subtotal</span>
  <span>₹{(productCostExclTax + tax).toFixed(2)}</span>
</div>
  
  {/* Shipping charges */}
  <div className="flex justify-between">
    <span className="flex items-center">
      Shipping 
      {formData.fastDelivery && (
        <Zap className="w-3 h-3 ml-1 text-orange-500" />
      )}
      {loadingRates && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
    </span>
    <span className={shippingCost > 0 ? '' : 'text-neutral-600'}>
      {formData.pincode.length === 6 ? (
        loadingRates ? (
          <span className="text-sm text-blue-500">Calculating...</span>
        ) : shippingCost > 0 ? (
          `₹${shippingCost.toFixed(2)}`
        ) : (
          <span className="text-sm text-red-500">Service not available</span>
        )
      ) : (
        <span className="text-sm text-neutral-500">Enter pincode</span>
      )}
    </span>
  </div>

  {/* COD charges */}
  {formData.paymentMethod === 'COD' && codCharges > 0 && (
    <div className="flex justify-between">
      <span>COD Charges</span>
      <span>₹{codCharges.toFixed(2)}</span>
    </div>
  )}
  
  {/* Rounding adjustment */}
  {roundingAdjustment !== 0 && (
    <div className="flex justify-between text-sm text-neutral-600">
      <span>Rounded Off</span>
      <span>{roundingAdjustment > 0 ? '+' : ''}₹{roundingAdjustment.toFixed(2)}</span>
    </div>
  )}
  
  <div className="border-t pt-3">
    <div className="flex justify-between font-semibold text-lg">
      <span>Total</span>
      <span>₹{total.toLocaleString()}</span>
    </div>
  </div>
</div>

                {/* Delivery Info Summary */}
                {selectedCourier && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center text-sm">
                      {formData.fastDelivery ? (
                        <Zap className="w-4 h-4 text-orange-500 mr-2" />
                      ) : (
                        <Truck className="w-4 h-4 text-blue-600 mr-2" />
                      )}
                      <div>
                        <p className="font-medium text-blue-800">
                          {selectedCourier.courier_name} 
                          {formData.fastDelivery && <span className="text-orange-600 ml-1">(Express)</span>}
                        </p>
                        <p className="text-blue-600">
                          Estimated delivery: {selectedCourier.estimated_delivery_days}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-red-700 text-sm">{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleErrorDismiss}
                      className="text-red-600 hover:text-red-700 p-0 h-auto"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {/* Pay Now Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || (loadingRates && formData.pincode.length === 6) || (formData.paymentMethod === 'COD' && !codAvailable) || (formData.pincode.length === 6 && shippingRates.length === 0 && !loadingRates)}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : loadingRates ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Delivery...
                    </>
                  ) : formData.paymentMethod === 'COD' ? (
                    `Place Order ₹${total.toLocaleString()}`
                  ) : (
                    `Pay ₹${total.toLocaleString()}`
                  )}
                </Button>

                <div className="text-center text-sm text-neutral-600 mt-4">
                  {formData.paymentMethod === 'COD' ? (
                    codAvailable ? (
                      <p>You will pay ₹{total.toLocaleString()} when your order is delivered</p>
                    ) : (
                      <p className="text-red-500">COD not available for this pincode</p>
                    )
                  ) : (
                    <p>Secure payment powered by Razorpay</p>
                  )}
                  <p className="mt-1">All major payment methods accepted</p>
                  {formData.fastDelivery && (
                    <p className="mt-1 text-orange-600 flex items-center justify-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Express delivery selected
                    </p>
                  )}
                  {addressChanged && formData.saveAddress && (
                    <p className="mt-1 text-blue-600">✓ Address will be saved for future orders</p>
                  )}
                  {addressChanged && !formData.saveAddress && (
                    <p className="mt-1 text-yellow-600">⚠ Address will not be saved</p>
                  )}
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