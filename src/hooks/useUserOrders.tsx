import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type OrderWithRelations = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<Database['public']['Tables']['order_items']['Row'] & {
    products: {
      name: string;
      brand: Database['public']['Enums']['brand_type'];
      price: number;
      images: string[] | null;
    } | null;
  }> | null;
};

export const useUserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
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
              name,
              brand,
              price,
              images
            )
          )
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
  }, [user?.id]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  // Get order counts by status for quick stats
  const getOrderStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      const status = order.status || 'pending';
      stats[status as keyof typeof stats]++;
    });

    return stats;
  }, [orders]);

  // Get recent orders (last 5)
  const getRecentOrders = useCallback(() => {
    return orders.slice(0, 5);
  }, [orders]);

  // Get active orders (not delivered or cancelled)
  const getActiveOrders = useCallback(() => {
    return orders.filter(order => 
      order.status !== 'delivered' && order.status !== 'cancelled'
    );
  }, [orders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchUserOrders,
    getOrderStats,
    getRecentOrders,
    getActiveOrders,
  };
};