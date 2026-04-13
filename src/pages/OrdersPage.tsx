import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  RefreshCw,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { shiprocketService, TrackingInfo } from '@/services/shiprocketService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type OrderWithRelations = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<Database['public']['Tables']['order_items']['Row'] & {
    products: {
      id: string;
      name: string;
      brand: Database['public']['Enums']['brand_type'];
      category: string;
      price: number;
      images: string[] | null;
      product_images?: Array<{ image_url: string }>;
    } | null;
  }> | null;
  shipping_tracking?: Array<Database['public']['Tables']['shipping_tracking']['Row']> | null;
};

type OrderStatus = Database['public']['Enums']['order_status'];

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, TrackingInfo>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});
  const [trackingErrors, setTrackingErrors] = useState<Record<string, string>>({});
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [showTrackingForOrder, setShowTrackingForOrder] = useState<Record<string, boolean>>({});

  // Helper function to get product URL
  const getProductUrl = (product: any) => {
    if (!product?.id) return null;
    
    const brand = product.brand || 'bhyross';
    const category = product.category || 'oxford';
    
    return `/${brand}/${category}/${product.id}`;
  };

  // Handle product click navigation
  const handleProductClick = (product: any) => {
    if (product) {
      const productUrl = getProductUrl(product);
      if (productUrl) {
        navigate(productUrl);
      }
    }
  };

  const fetchUserOrders = async () => {
    if (!user?.id) {
      setError('Please log in to view your orders');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              brand,
              category,
              price,
              images,
              product_images (image_url)
            )
          ),
          shipping_tracking (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(ordersData || []);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const getStatusBadge = (status: OrderStatus | null) => {
    if (!status) status = 'pending';
    
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Package, label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Confirmed' },
      processing: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package, label: 'Processing' },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Truck, label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelled' },
      return_initiated: { bg: 'bg-orange-100', text: 'text-orange-800', icon: RefreshCw, label: 'Return Initiated' },
      returned: { bg: 'bg-gray-100', text: 'text-gray-800', icon: RefreshCw, label: 'Returned' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getItemsCount = (orderItems: OrderWithRelations['order_items']) => {
    if (!orderItems) return 0;
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const parseAddress = (address: any) => {
    if (!address || typeof address !== 'object') return null;
    return address;
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const trackShipment = async (order: OrderWithRelations) => {
    const orderId = order.id;
    setTrackingLoading(prev => ({ ...prev, [orderId]: true }));
    setTrackingErrors(prev => ({ ...prev, [orderId]: '' }));
    
    try {
      const result = await shiprocketService.smartTrackShipment({
        awbCode: order.awb_code || undefined,
        shipmentId: order.shipment_id || undefined,
        orderId: order.shiprocket_order_id?.toString() || undefined
      });
      
      if (result.success && result.data) {
        setTrackingData(prev => ({ ...prev, [orderId]: result.data! }));
        setShowTrackingForOrder(prev => ({ ...prev, [orderId]: true }));
        
        await shiprocketService.updateTrackingInDatabase(orderId, result.data);
        await fetchUserOrders();
      } else {
        setTrackingErrors(prev => ({ 
          ...prev, 
          [orderId]: result.error || 'Failed to track shipment' 
        }));
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setTrackingErrors(prev => ({ 
        ...prev, 
        [orderId]: error instanceof Error ? error.message : 'Unexpected error occurred' 
      }));
    } finally {
      setTrackingLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getTrackingStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return 'text-green-600';
    if (lowerStatus.includes('out for delivery')) return 'text-blue-600';
    if (lowerStatus.includes('in transit') || lowerStatus.includes('shipped')) return 'text-indigo-600';
    if (lowerStatus.includes('picked')) return 'text-purple-600';
    return 'text-gray-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="p-4 sm:p-8 text-center">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Please Log In</h2>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">You need to be logged in to view your orders.</p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </Card>
          </div>
        </div>
        <Footer brand="bhyross" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="p-4 sm:p-8">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground text-sm sm:text-base">Loading your orders...</span>
              </div>
            </Card>
          </div>
        </div>
        <Footer brand="bhyross" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Track and manage your orders</p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {orders.length === 0 ? (
            <Card className="p-4 sm:p-8 text-center">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">You haven't placed any orders yet.</p>
              <Button asChild>
                <Link to="/">Start Shopping</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const shippingAddress = parseAddress(order.shipping_address);
                const billingAddress = parseAddress(order.billing_address);
                const currentTracking = trackingData[order.id];
                const hasShippingInfo = order.awb_code || order.shipment_id || order.shiprocket_order_id;
                const isExpanded = expandedOrders[order.id];
                const showTracking = showTrackingForOrder[order.id];
                
                return (
                  <Card key={order.id} className="overflow-hidden">
                    {/* Main Order Summary */}
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">
                              Order #{order.id.slice(-8).toUpperCase()}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              {formatDate(order.created_at)}
                            </div>
                            <div>
                              {getItemsCount(order.order_items)} item{getItemsCount(order.order_items) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right sm:text-right">
                          <p className="text-lg sm:text-xl font-semibold mb-2">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleOrderDetails(order.id)}
                          className="flex items-center justify-center gap-1 w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        
                        {hasShippingInfo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => trackShipment(order)}
                            disabled={trackingLoading[order.id]}
                            className="flex items-center justify-center gap-1 w-full sm:w-auto"
                          >
                            {trackingLoading[order.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Truck className="w-4 h-4" />
                            )}
                            {trackingLoading[order.id] ? 'Tracking...' : 'Track Order'}
                          </Button>
                        )}
                      </div>

                      {/* Tracking Info (when shown) */}
                      {showTracking && currentTracking && (
                        <div className="mb-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <Truck className="w-4 h-4" />
                            Current Tracking Status
                          </h4>
                          <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div>
                              <span className="font-medium">AWB Code:</span> {currentTracking.awb_code}
                            </div>
                            <div>
                              <span className="font-medium">Courier:</span> {currentTracking.courier_name}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>{' '}
                              <Badge variant="outline" className={getTrackingStatusColor(currentTracking.current_status)}>
                                {currentTracking.current_status}
                              </Badge>
                            </div>
                          </div>
                          {currentTracking.track_url && (
                            <Button variant="outline" size="sm" asChild className="mt-3 w-full sm:w-auto">
                              <a href={currentTracking.track_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Track on Courier Website
                              </a>
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Tracking Error */}
                      {trackingErrors[order.id] && (
                        <Alert className="mb-4 border-orange-200 bg-orange-50">
                          <XCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800 text-sm">
                            {trackingErrors[order.id]}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="space-y-4 sm:space-y-6 pt-4 border-t">
                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold mb-3 text-sm sm:text-base">Items Ordered</h4>
                            <div className="space-y-3">
                              {order.order_items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 bg-muted/30 rounded-lg">
                                  {/* Product Image */}
                                  {(() => {
                                    const imageUrl = item.products?.product_images?.[0]?.image_url ||
                                                   (item.products?.images && item.products.images.length > 0 ? item.products.images[0] : null);
                                    const productUrl = getProductUrl(item.products);
                                    
                                    return imageUrl ? (
                                      <div 
                                        className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 group ${productUrl ? 'cursor-pointer' : ''}`}
                                        onClick={() => productUrl && handleProductClick(item.products)}
                                      >
                                        <img
                                          src={imageUrl}
                                          alt={item.products?.name || 'Product'}
                                          className="w-full h-full object-cover rounded-md group-hover:opacity-90 transition-opacity"
                                        />
                                      </div>
                                    ) : null;
                                  })()}
                                  
                                  <div className="flex-1 min-w-0">
                                    <h5 
                                      className={`font-medium text-xs sm:text-sm transition-colors truncate ${
                                        getProductUrl(item.products) ? 'cursor-pointer hover:text-muted-foreground' : ''
                                      }`}
                                      onClick={() => getProductUrl(item.products) && handleProductClick(item.products)}
                                    >
                                      {item.products?.name || 'Unknown Product'}
                                    </h5>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs text-muted-foreground">
                                      <span>Brand: {item.products?.brand || 'Unknown'}</span>
                                      <span>Size: {item.size}</span>
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-xs sm:text-sm">{formatCurrency(item.price)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Addresses */}
                          {(shippingAddress || billingAddress) && (
                            <div>
                              <h4 className="font-semibold mb-3 text-sm sm:text-base">Delivery Information</h4>
                              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                                {shippingAddress && (
                                  <div className="p-3 bg-muted/30 rounded-lg">
                                    <h5 className="font-medium mb-2 flex items-center gap-1 text-xs sm:text-sm">
                                      <MapPin className="w-3 h-3" />
                                      Shipping Address
                                    </h5>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <p className="font-medium text-foreground">{shippingAddress.fullName}</p>
                                      <p>{shippingAddress.address}</p>
                                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                                      {shippingAddress.phone && (
                                        <p className="flex items-center gap-1">
                                          <Phone className="w-3 h-3" />
                                          {shippingAddress.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {billingAddress && billingAddress !== shippingAddress && (
                                  <div className="p-3 bg-muted/30 rounded-lg">
                                    <h5 className="font-medium mb-2 flex items-center gap-1 text-xs sm:text-sm">
                                      <CreditCard className="w-3 h-3" />
                                      Billing Address
                                    </h5>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <p className="font-medium text-foreground">{billingAddress.fullName}</p>
                                      <p>{billingAddress.address}</p>
                                      <p>{billingAddress.city}, {billingAddress.state} {billingAddress.pincode}</p>
                                      {billingAddress.phone && (
                                        <p className="flex items-center gap-1">
                                          <Phone className="w-3 h-3" />
                                          {billingAddress.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Payment Info */}
                          {order.payment_method && (
                            <div>
                              <h4 className="font-semibold mb-3 text-sm sm:text-base">Payment Information</h4>
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                                  <p>
                                    <span className="font-medium">Payment Method:</span> {order.payment_method.toUpperCase()}
                                  </p>
                                  {order.razorpay_order_id && (
                                    <p className="break-all">
                                      <span className="font-medium">Transaction ID:</span> {order.razorpay_order_id}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Detailed Tracking History */}
                          {showTracking && currentTracking?.activities && currentTracking.activities.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <Clock className="w-4 h-4" />
                                Tracking History
                              </h4>
                              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {currentTracking.activities.map((activity, index) => (
                                    <div key={index} className="flex gap-3 text-xs sm:text-sm">
                                      <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-1 sm:mt-2"></div>
                                        {index < currentTracking.activities.length - 1 && (
                                          <div className="w-px h-6 bg-border ml-[3px] mt-1"></div>
                                        )}
                                      </div>
                                      <div className="flex-1 pb-3">
                                        <div className="font-medium">
                                          {activity.sr_status_label || activity.status}
                                        </div>
                                        <div className="text-muted-foreground mt-1">{activity.activity}</div>
                                        <div className="text-muted-foreground text-xs mt-1">
                                          {formatDate(activity.date)} • {activity.location}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer brand="bhyross" />
    </div>
  );
};

export default OrdersPage;