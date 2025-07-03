import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  BarChart3, 
  Eye,
  AlertTriangle,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';

const OverviewStats: React.FC = () => {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
        <span className="ml-2 text-neutral-600">Loading dashboard stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load dashboard statistics</p>
          <p className="text-sm text-neutral-600 mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      case 'shipped': return 'text-purple-600 bg-purple-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Products</p>
              <p className="text-3xl font-bold text-neutral-900">{stats?.totalProducts || 0}</p>
              <p className="text-sm text-green-600 mt-1">+{stats?.newProductsThisWeek || 0} this week</p>
            </div>
            <Package className="h-8 w-8 text-neutral-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Products</p>
              <p className="text-3xl font-bold text-neutral-900">{stats?.activeProducts || 0}</p>
              <p className="text-sm text-neutral-600 mt-1">{stats?.inactiveProducts || 0} inactive</p>
            </div>
            <Eye className="h-8 w-8 text-neutral-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-neutral-900">{stats?.lowStockProducts || 0}</p>
              <p className="text-sm text-orange-600 mt-1">Need attention</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Revenue</p>
              <p className="text-3xl font-bold text-neutral-900">
                {formatCurrency(stats?.revenueThisMonth || 0)}
              </p>
              <div className="flex items-center mt-1">
                {stats?.revenueGrowthPercentage !== undefined && (
                  <>
                    {stats.revenueGrowthPercentage >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${stats.revenueGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.revenueGrowthPercentage >= 0 ? '+' : ''}{stats.revenueGrowthPercentage.toFixed(1)}% from last month
                    </span>
                  </>
                )}
              </div>
            </div>
            <BarChart3 className="h-8 w-8 text-neutral-500" />
          </div>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Orders</p>
              <p className="text-2xl font-bold text-neutral-900">{stats?.totalOrders || 0}</p>
              <p className="text-sm text-neutral-600 mt-1">{stats?.ordersThisMonth || 0} this month</p>
            </div>
            <ShoppingCart className="h-6 w-6 text-neutral-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{stats?.totalCustomers || 0}</p>
              <p className="text-sm text-green-600 mt-1">+{stats?.newCustomersThisWeek || 0} this week</p>
            </div>
            <Users className="h-6 w-6 text-neutral-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-neutral-600 mt-1">All time</p>
            </div>
            <BarChart3 className="h-6 w-6 text-neutral-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {/* Recent Orders */}
          {stats?.recentOrders?.slice(0, 2).map((order) => (
            <div key={order.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New order received</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-neutral-600">
                    Order {order.order_number} - {formatCurrency(order.total_amount)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <span className="text-xs text-neutral-500">{formatTimeAgo(order.created_at)}</span>
            </div>
          ))}

          {/* Recent Product Updates */}
          {stats?.recentProducts?.slice(0, 2).map((product) => (
            <div key={product.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
              <Package className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Product {product.action === 'created' ? 'created' : 'updated'}
                </p>
                <p className="text-xs text-neutral-600">{product.name}</p>
              </div>
              <span className="text-xs text-neutral-500">{formatTimeAgo(product.updated_at)}</span>
            </div>
          ))}

          {/* Recent Customers */}
          {stats?.recentCustomers?.slice(0, 1).map((customer) => (
            <div key={customer.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New customer registered</p>
                <p className="text-xs text-neutral-600">
                  {customer.first_name && customer.last_name 
                    ? `${customer.first_name} ${customer.last_name} (${customer.email})`
                    : customer.email
                  }
                </p>
              </div>
              <span className="text-xs text-neutral-500">{formatTimeAgo(customer.created_at)}</span>
            </div>
          ))}

          {(!stats?.recentOrders?.length && !stats?.recentProducts?.length && !stats?.recentCustomers?.length) && (
            <div className="text-center py-8 text-neutral-500">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity to display</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OverviewStats;