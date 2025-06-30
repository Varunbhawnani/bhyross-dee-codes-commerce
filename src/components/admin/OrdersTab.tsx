import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OrdersTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Orders Management</h2>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-semibold">#ORD-001247</h4>
              <p className="text-sm text-neutral-600">John Doe - john@example.com</p>
              <p className="text-sm font-medium text-green-600">₹4,250</p>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-semibold">#ORD-001246</h4>
              <p className="text-sm text-neutral-600">Jane Smith - jane@example.com</p>
              <p className="text-sm font-medium text-green-600">₹3,850</p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
              <p className="text-xs text-neutral-500 mt-1">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-semibold">#ORD-001245</h4>
              <p className="text-sm text-neutral-600">Mike Johnson - mike@example.com</p>
              <p className="text-sm font-medium text-green-600">₹5,200</p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800">Delivered</Badge>
              <p className="text-xs text-neutral-500 mt-1">3 days ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrdersTab;