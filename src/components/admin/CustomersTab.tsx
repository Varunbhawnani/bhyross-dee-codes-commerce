import React from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

const CustomersTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Customer Management</h2>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-neutral-500" />
              </div>
              <div>
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-neutral-600">john@example.com</p>
                <p className="text-xs text-neutral-500">Joined 2 months ago</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">5 Orders</p>
              <p className="text-xs text-neutral-600">₹18,450 total</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-neutral-500" />
              </div>
              <div>
                <h4 className="font-semibold">Jane Smith</h4>
                <p className="text-sm text-neutral-600">jane@example.com</p>
                <p className="text-xs text-neutral-500">Joined 1 month ago</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">3 Orders</p>
              <p className="text-xs text-neutral-600">₹12,300 total</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomersTab;