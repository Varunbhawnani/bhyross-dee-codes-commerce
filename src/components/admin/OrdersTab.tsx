import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Updated type definition to match our fetch approach
type OrderWithRelations = Database['public']['Tables']['orders']['Row'] & {
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  order_items: Array<Database['public']['Tables']['order_items']['Row'] & {
    products: {
      name: string;
      brand: Database['public']['Enums']['brand_type'];
      price: number;
    } | null;
  }> | null;
};

type OrderStatus = Database['public']['Enums']['order_status'];

const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders with order_items and products
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              brand,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) {
        console.error('Supabase error:', ordersError);
        throw ordersError;
      }

      // Transform the data to match OrderWithRelations type
      let ordersWithProfiles: OrderWithRelations[] = [];
      
      if (ordersData && ordersData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(ordersData.map(order => order.user_id).filter(Boolean))];
        
        let profilesMap: Record<string, any> = {};
        
        // Fetch profiles if we have user IDs
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, phone')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            // Create a map for easy lookup
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {} as Record<string, any>);
          }
        }

        // Transform orders data to match the expected type
        ordersWithProfiles = ordersData.map(order => ({
          ...order,
          profiles: order.user_id && profilesMap[order.user_id] ? profilesMap[order.user_id] : null,
          order_items: order.order_items || null
        }));
      }

      console.log('Fetched orders data:', ordersWithProfiles);
      setOrders(ordersWithProfiles);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(orderId);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const getStatusBadge = (status: OrderStatus | null) => {
    if (!status) status = 'pending';
    
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Package },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      processing: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Truck },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCustomerName = (profiles: OrderWithRelations['profiles']) => {
    if (!profiles) return 'Unknown Customer';
    return `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim() || 'Unknown Customer';
  };

  const getItemsCount = (orderItems: OrderWithRelations['order_items']) => {
    if (!orderItems) return 0;
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-neutral-900">Orders Management</h2>
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            <span className="ml-2 text-neutral-600">Loading orders...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Orders Management</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-800 text-sm">{error}</p>
        </Card>
      )}

      <Card className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">No orders found</p>
            <p className="text-sm text-neutral-500 mt-1">
              {statusFilter !== 'all' ? `No orders with status: ${statusFilter}` : 'Orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">#{order.id.slice(-8).toUpperCase()}</h4>
                    {order.razorpay_order_id && (
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                        {order.razorpay_order_id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {getCustomerName(order.profiles)} - {order.profiles?.email || 'No email'}
                  </p>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {getItemsCount(order.order_items)} item{getItemsCount(order.order_items) !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="mb-2">
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status || 'pending'}
                      onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                      disabled={updatingStatus === order.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {updatingStatus === order.id && (
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrdersTab;