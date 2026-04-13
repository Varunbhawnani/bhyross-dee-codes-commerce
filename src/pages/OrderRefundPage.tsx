import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

const OrderRefundPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const state = location.state as {
    refundReason?: string;
    refundId?: string;
    paymentId?: string;
  } | null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Cancelled
          </h1>
          
          <p className="text-gray-600 mb-4">
            {state?.refundReason || 'Your order has been cancelled and refund has been initiated.'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Order ID:</span>
              <span className="text-gray-900 font-mono">{orderId}</span>
            </div>
            
            {state?.paymentId && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Payment ID:</span>
                <span className="text-gray-900 font-mono text-xs">{state.paymentId}</span>
              </div>
            )}
            
            {state?.refundId && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Refund ID:</span>
                <span className="text-gray-900 font-mono text-xs">{state.refundId}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Refund Processing
              </h3>
              <p className="text-sm text-blue-700">
                Your refund will be processed within 5-7 business days to the original payment method.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/cart"
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          
          <Link
            to="/"
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team with your order ID.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderRefundPage;