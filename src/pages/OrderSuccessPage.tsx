import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Package, Clock, ArrowRight, Home, ShoppingBag } from 'lucide-react';

// Updated interface to match the actual database structure
interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
  billing_address?: any;
  payment_id?: string;
  razorpay_order_id?: string;
  updated_at?: string;
  user_id: string;
  order_items: Array<{
    id: string;
    quantity: number;
    size: number; // Changed from string to number to match database
    price: number;
    order_id: string;
    product_id: string;
    created_at: string;
    products: {
      id: string;
      name: string;
      brand: "bhyross" | "deecodes" | "imcolus"; // Updated to match database union type
      product_images: Array<{
        image_url: string;
      }>;
    };
  }>;
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const analytics = useAnalytics();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (
                id,
                name,
                brand,
                product_images (
                  image_url
                )
              )
            )
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        setOrder(data);

        // Track purchase completion
        if (data && data.order_items) {
          analytics.trackPurchase(
            data.id,
            data.order_items.map(item => ({
              productId: item.products.id,
              name: item.products.name,
              category: 'Unknown',
              brand: item.products.brand,
              price: item.price,
              quantity: item.quantity
            })),
            data.total_amount
          );
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, analytics]);

  // Track page view
  useEffect(() => {
    analytics.trackCustomEvent('page_view', {
      page: '/order-success',
      title: 'Order Success Page'
    });
  }, [analytics]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-red-50 rounded-full p-3 w-16 h-16 mx-auto mb-6">
                <Package className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">Order Not Found</h1>
              <p className="text-neutral-600 mb-8">
                {error || 'We couldn\'t find the order you\'re looking for.'}
              </p>
              <div className="space-y-4">
                <Link to="/">
                  <Button className="bg-neutral-900 hover:bg-neutral-800">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-green-50 rounded-full p-3 w-16 h-16 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Order Confirmed!</h1>
            <p className="text-lg text-neutral-600 mb-4">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="bg-white rounded-lg p-4 inline-block">
              <p className="text-sm text-neutral-600">Order ID</p>
              <p className="text-lg font-mono font-semibold text-neutral-900">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              {/* Order Status */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-neutral-600">{orderDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-neutral-100 rounded-full p-2">
                      <Package className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium">Processing</p>
                      <p className="text-sm text-neutral-600">We'll notify you when shipped</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-neutral-100 rounded-full p-2">
                      <Clock className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-neutral-600">{estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Shipping Address */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="text-neutral-700">
                  <p className="font-medium">{order.shipping_address.name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                  <p className="mt-2">
                    <span className="text-sm text-neutral-600">Phone: </span>
                    {order.shipping_address.phone}
                  </p>
                  <p>
                    <span className="text-sm text-neutral-600">Email: </span>
                    {order.shipping_address.email}
                  </p>
                </div>
              </Card>
            </div>

            {/* Order Items */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                      {item.products.product_images?.[0]?.image_url && (
                        <img
                          src={item.products.product_images[0].image_url}
                          alt={item.products.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.products.name}</h3>
                        <p className="text-sm text-neutral-600 capitalize">
                          {item.products.brand} | Size: {item.size}
                        </p>
                        <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                
                {/* Order Total */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Paid</span>
                    <span>₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link to="/">
                  <Button className="w-full bg-neutral-900 hover:bg-neutral-800">
                    <Home className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
                <Link to="/bhyross">
                  <Button variant="outline" className="w-full">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop More from Bhyross
                  </Button>
                </Link>
              </div>

              {/* Support Info */}
              <Card className="p-6 bg-neutral-50">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  If you have any questions about your order, please contact our support team.
                </p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> support@yourstore.com</p>
                  <p><span className="font-medium">Phone:</span> +91 12345 67890</p>
                  <p><span className="font-medium">Hours:</span> Mon-Sat 9AM-6PM IST</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;