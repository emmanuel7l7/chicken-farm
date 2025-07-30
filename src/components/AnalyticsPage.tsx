import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';

interface MockAnalytics {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
}

interface MockOrder {
  id: string;
  user_name: string;
  user_email: string;
  items: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
}

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<MockAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<MockOrder[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for development
    setTimeout(() => {
      setAnalytics({
        total_orders: 12,
        total_revenue: 450000,
        total_customers: 8,
      });
      
      setRecentOrders([
        {
          id: '1',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          items: 'Premium Layer Hens x2, Fresh Farm Eggs x1',
          total_amount: 58500,
          payment_method: 'cash_on_delivery',
          payment_status: 'pending',
          status: 'confirmed',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          items: 'Broiler Chickens x3',
          total_amount: 54000,
          payment_method: 'mpesa',
          payment_status: 'paid',
          status: 'processing',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
      
      setMonthlyRevenue(1250000);
      setLoading(false);
    }, 1000);
  }, []);

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    // Mock update for development
    setRecentOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status, ...(paymentStatus && { payment_status: paymentStatus }) }
          : order
      )
    );
    alert('Order status updated successfully');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.total_orders || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.total_customers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.total_revenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.payment_method.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'confirmed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {order.payment_method === 'cash_on_delivery' && order.payment_status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed', 'paid')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirm Payment
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Process
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {recentOrders.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;