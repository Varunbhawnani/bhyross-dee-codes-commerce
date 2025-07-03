import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  // Product stats
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  newProductsThisWeek: number;
  
  // Order/Revenue stats
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthPercentage: number;
  totalOrders: number;
  ordersThisMonth: number;
  
  // Customer stats
  totalCustomers: number;
  newCustomersThisWeek: number;
  
  // Recent activity
  recentOrders: RecentOrder[];
  recentProducts: RecentProduct[];
  recentCustomers: RecentCustomer[];
}

export interface RecentOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_number: string;
}

export interface RecentProduct {
  id: string;
  name: string;
  updated_at: string;
  action: 'created' | 'updated';
}

export interface RecentCustomer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Get date ranges
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Fetch product statistics
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, is_active, stock_quantity, created_at, updated_at, name');

      if (productsError) throw productsError;

      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.is_active).length;
      const inactiveProducts = totalProducts - activeProducts;
      const lowStockProducts = products.filter(p => 
        p.stock_quantity <= 10 && p.is_active
      ).length;
      const newProductsThisWeek = products.filter(p => 
        new Date(p.created_at) >= oneWeekAgo
      ).length;

      // Get recent product updates (created or updated in last week)
      const recentProducts: RecentProduct[] = products
        .filter(p => {
          const created = new Date(p.created_at);
          const updated = new Date(p.updated_at);
          return created >= oneWeekAgo || updated >= oneWeekAgo;
        })
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          updated_at: p.updated_at,
          action: new Date(p.created_at) >= oneWeekAgo ? 'created' : 'updated'
        }));

      // Fetch order statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const totalOrders = orders.length;
      const ordersThisMonth = orders.filter(o => 
        new Date(o.created_at) >= oneMonthAgo
      ).length;

      // Calculate revenue
      const allCompletedOrders = orders.filter(o => 
        o.status === 'delivered' || o.status === 'confirmed'
      );
      const totalRevenue = allCompletedOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      const revenueThisMonth = allCompletedOrders
        .filter(o => new Date(o.created_at) >= oneMonthAgo)
        .reduce((sum, order) => sum + order.total_amount, 0);
      
      const revenueLastMonth = allCompletedOrders
        .filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= twoMonthsAgo && orderDate < oneMonthAgo;
        })
        .reduce((sum, order) => sum + order.total_amount, 0);

      const revenueGrowthPercentage = revenueLastMonth > 0 
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0 ? 100 : 0;

      // Get recent orders (last 5)
      const recentOrders: RecentOrder[] = orders
        .slice(0, 5)
        .map((order, index) => ({
          id: order.id,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          order_number: `#${1000 + index + 1}` // Simple order numbering
        }));

      // Fetch customer statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const totalCustomers = profiles.length;
      const newCustomersThisWeek = profiles.filter(p => 
        new Date(p.created_at) >= oneWeekAgo
      ).length;

      // Get recent customers (last 5 new registrations)
      const recentCustomers: RecentCustomer[] = profiles
        .slice(0, 5)
        .map(profile => ({
          id: profile.id,
          email: profile.email || 'No email',
          first_name: profile.first_name,
          last_name: profile.last_name,
          created_at: profile.created_at
        }));

      return {
        // Product stats
        totalProducts,
        activeProducts,
        inactiveProducts,
        lowStockProducts,
        newProductsThisWeek,
        
        // Revenue stats
        totalRevenue,
        revenueThisMonth,
        revenueLastMonth,
        revenueGrowthPercentage,
        totalOrders,
        ordersThisMonth,
        
        // Customer stats
        totalCustomers,
        newCustomersThisWeek,
        
        // Recent activity
        recentOrders,
        recentProducts,
        recentCustomers,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};