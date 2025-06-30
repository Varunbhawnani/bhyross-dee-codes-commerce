import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  BarChart3, 
  Eye,
  AlertTriangle,
  ShoppingCart,
  Users
} from 'lucide-react';

interface OverviewStatsProps {
  stats?: {
    totalProducts?: number;
    newProductsThisWeek?: number;
    activeProducts?: number;
    inactiveProducts?: number;
    lowStockProducts?: number;
  };
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
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
              <p className="text-3xl font-bold text-neutral-900">₹1,24,580</p>
              <p className="text-sm text-green-600 mt-1">+18% from last month</p>
            </div>
            <BarChart3 className="h-8 w-8 text-neutral-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">New order received</p>
              <p className="text-xs text-neutral-600">Order #1247 - ₹4,250</p>
            </div>
            <span className="text-xs text-neutral-500 ml-auto">2 min ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
            <Package className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Product updated</p>
              <p className="text-xs text-neutral-600">Oxford Brown Leather updated</p>
            </div>
            <span className="text-xs text-neutral-500 ml-auto">15 min ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">New customer registered</p>
              <p className="text-xs text-neutral-600">john.doe@example.com</p>
            </div>
            <span className="text-xs text-neutral-500 ml-auto">1 hour ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewStats;