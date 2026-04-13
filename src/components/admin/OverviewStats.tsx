import React, { useState, useEffect } from 'react';
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
  Loader2,
  Activity
} from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(value * progress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [value, duration]);

  return count;
};

const OverviewStats = () => {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <span className="ml-2 text-gray-600">Loading dashboard stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load dashboard statistics</p>
          <p className="text-sm text-gray-600 mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      case 'shipped': return 'text-purple-600 bg-purple-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 text-lg">Monitor your business performance in real-time</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Products</p>
              <p className="text-4xl font-bold text-black mt-2">
                <AnimatedCounter value={stats?.totalProducts || 0} />
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <p className="text-sm text-green-600 font-medium">
                  +{stats?.newProductsThisWeek || 0} this week
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="p-3 bg-gray-100 rounded-full">
                <Package className="h-8 w-8 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Products</p>
              <p className="text-4xl font-bold text-black mt-2">
                <AnimatedCounter value={stats?.activeProducts || 0} />
              </p>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                {stats?.inactiveProducts || 0} inactive
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Eye className="h-8 w-8 text-black" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black rounded-full transition-all duration-1000"
                style={{ 
                  width: `${((stats?.activeProducts || 0) / (stats?.totalProducts || 1)) * 100}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(((stats?.activeProducts || 0) / (stats?.totalProducts || 1)) * 100)}% active
            </p>
          </div>
        </Card>
        
        <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Low Stock Items</p>
              <p className="text-4xl font-bold text-black mt-2">
                <AnimatedCounter value={stats?.lowStockProducts || 0} />
              </p>
              <p className="text-sm text-red-600 mt-2 font-medium">Need attention</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Revenue</p>
              <p className="text-4xl font-bold text-black mt-2">
                {formatCurrency(stats?.revenueThisMonth || 0)}
              </p>
              <div className="flex items-center mt-2">
                {stats?.revenueGrowthPercentage !== undefined && (
                  <>
                    {stats.revenueGrowthPercentage >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stats.revenueGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.revenueGrowthPercentage >= 0 ? '+' : ''}{stats.revenueGrowthPercentage.toFixed(1)}% from last month
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <BarChart3 className="h-8 w-8 text-black" />
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Orders</p>
              <p className="text-3xl font-bold text-black mt-2">
                <AnimatedCounter value={stats?.totalOrders || 0} />
              </p>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                {stats?.ordersThisMonth || 0} this month
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-black" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Customers</p>
              <p className="text-3xl font-bold text-black mt-2">
                <AnimatedCounter value={stats?.totalCustomers || 0} />
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <p className="text-sm text-green-600 font-medium">
                  +{stats?.newCustomersThisWeek || 0} this week
                </p>
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Users className="h-6 w-6 text-black" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-black mt-2">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-2 font-medium">All time</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-black" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 border-2 border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-black">Recent Activity</h3>
          <div className="p-2 bg-gray-100 rounded-full">
            <Activity className="h-5 w-5 text-black" />
          </div>
        </div>
        <div className="space-y-4">
          {/* Recent Orders */}
          {stats?.recentOrders?.slice(0, 2).map((order) => (
            <div key={order.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300">
              <div className="p-3 bg-black rounded-full">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-black">New order received</p>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-xs text-gray-600 font-medium">
                    Order {order.order_number} - {formatCurrency(order.total_amount)}
                  </p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-medium">{formatTimeAgo(order.created_at)}</span>
            </div>
          ))}

          {/* Recent Product Updates */}
          {stats?.recentProducts?.slice(0, 2).map((product) => (
            <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300">
              <div className="p-3 bg-black rounded-full">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-black">
                  Product {product.action === 'created' ? 'created' : 'updated'}
                </p>
                <p className="text-xs text-gray-600 mt-1 font-medium">{product.name}</p>
              </div>
              <span className="text-xs text-gray-500 font-medium">{formatTimeAgo(product.updated_at)}</span>
            </div>
          ))}

          {/* Recent Customers */}
          {stats?.recentCustomers?.slice(0, 1).map((customer) => (
            <div key={customer.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300">
              <div className="p-3 bg-black rounded-full">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-black">New customer registered</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {customer.first_name && customer.last_name 
                    ? `${customer.first_name} ${customer.last_name} (${customer.email})`
                    : customer.email
                  }
                </p>
              </div>
              <span className="text-xs text-gray-500 font-medium">{formatTimeAgo(customer.created_at)}</span>
            </div>
          ))}

          {(!stats?.recentOrders?.length && !stats?.recentProducts?.length && !stats?.recentCustomers?.length) && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-500 font-medium">No recent activity to display</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OverviewStats;