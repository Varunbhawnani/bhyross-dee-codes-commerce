import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Search, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface CustomerData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

const CustomersTab: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'joined'>('joined');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with order statistics
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch order statistics for each customer
      const customersWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('user_id', profile.id)
            .eq('status', 'delivered'); // Only count delivered orders

          if (ordersError) {
            console.error('Error fetching orders for user:', profile.id, ordersError);
          }

          const orders = ordersData || [];
          const orderCount = orders.length;
          const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
          const lastOrderDate = orders.length > 0 
            ? Math.max(...orders.map(order => new Date(order.created_at!).getTime()))
            : null;

          return {
            ...profile,
            order_count: orderCount,
            total_spent: totalSpent,
            last_order_date: lastOrderDate ? new Date(lastOrderDate).toISOString() : null,
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase();
      const email = customer.email?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search);
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = `${a.first_name || ''} ${a.last_name || ''}`;
          const nameB = `${b.first_name || ''} ${b.last_name || ''}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'orders':
          comparison = a.order_count - b.order_count;
          break;
        case 'spent':
          comparison = a.total_spent - b.total_spent;
          break;
        case 'joined':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getCustomerInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last || '?';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-neutral-900">Customer Management</h2>
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-900">Customer Management</h2>
        <div className="text-sm text-neutral-600">
          Total Customers: {customers.length}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="joined">Sort by Join Date</option>
              <option value="name">Sort by Name</option>
              <option value="orders">Sort by Orders</option>
              <option value="spent">Sort by Amount Spent</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </Card>

      {/* Customer List */}
      <Card className="p-6">
        {filteredAndSortedCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {searchTerm ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-neutral-600">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Customer data will appear here once you have registered users.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedCustomers.map((customer) => (
              <div 
                key={customer.id} 
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-neutral-700">
                      {getCustomerInitials(customer.first_name, customer.last_name)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">
                      {customer.first_name && customer.last_name 
                        ? `${customer.first_name} ${customer.last_name}`
                        : customer.email?.split('@')[0] || 'Unknown User'
                      }
                    </h4>
                    <p className="text-sm text-neutral-600">
                      {customer.email || 'No email provided'}
                    </p>
                    {customer.phone && (
                      <p className="text-xs text-neutral-500">{customer.phone}</p>
                    )}
                    <p className="text-xs text-neutral-500">
                      Joined {formatDate(customer.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">
                    {customer.order_count} Order{customer.order_count !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {formatCurrency(customer.total_spent)} total
                  </p>
                  {customer.last_order_date && (
                    <p className="text-xs text-neutral-500">
                      Last order: {formatDate(customer.last_order_date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900">
              {customers.length}
            </div>
            <div className="text-sm text-neutral-600">Total Customers</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900">
              {customers.filter(c => c.order_count > 0).length}
            </div>
            <div className="text-sm text-neutral-600">Active Customers</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900">
              {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}
            </div>
            <div className="text-sm text-neutral-600">Total Revenue</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomersTab;