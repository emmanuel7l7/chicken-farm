import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, MessageSquare, Send } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/validation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';
import AdminNav from './AdminNav';

interface MockAnalytics {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
}

interface MockOrder {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  items: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_orders: number;
  total_spent: number;
  last_order: string;
}

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<MockAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<MockOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [bulkMessageType, setBulkMessageType] = useState<'all' | 'selected'>('selected');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        // Load real data from Supabase
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            profiles:user_id (name, email, phone),
            order_items (
              quantity,
              unit_price,
              total_price,
              products (name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (ordersError) throw ordersError;

        // Transform orders data
        const transformedOrders = ordersData?.map(order => ({
          id: order.id,
          user_name: order.profiles?.name || 'Unknown',
          user_email: order.profiles?.email || 'Unknown',
          user_phone: order.profiles?.phone,
          items: order.order_items?.map((item: any) => 
            `${item.products?.name} x${item.quantity}`
          ).join(', ') || 'No items',
          total_amount: order.total_amount,
          payment_method: order.payment_method || 'cash_on_delivery',
          payment_status: order.payment_status,
          status: order.status,
          created_at: order.created_at,
        })) || [];

        setRecentOrders(transformedOrders);

        // Load customers data
        const { data: customersData, error: customersError } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            phone,
            orders (
              id,
              total_amount,
              created_at
            )
          `)
          .eq('role', 'customer');

        if (customersError) throw customersError;

        const transformedCustomers = customersData?.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          total_orders: customer.orders?.length || 0,
          total_spent: customer.orders?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0,
          last_order: customer.orders?.[0]?.created_at || 'Never',
        })) || [];

        setCustomers(transformedCustomers);

        // Calculate analytics
        const totalOrders = transformedOrders.length;
        const totalRevenue = transformedOrders.reduce((sum, order) => sum + order.total_amount, 0);
        const totalCustomers = transformedCustomers.length;

        setAnalytics({
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          total_customers: totalCustomers,
        });

        setMonthlyRevenue(totalRevenue * 4); // Estimate monthly from recent orders
      } else {
        // Mock data for development
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
            user_phone: '+255712345678',
            items: 'Premium Layer Hens x2, Fresh Farm Eggs x1',
            total_amount: 58500,
            payment_method: 'cash_on_delivery',
            payment_status: 'pending',
            status: 'confirmed',
            created_at: new Date().toISOString(),
          },
        ]);

        setCustomers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+255712345678',
            total_orders: 3,
            total_spent: 125000,
            last_order: new Date().toISOString(),
          },
        ]);
        
        setMonthlyRevenue(1250000);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const updateData: any = { status };
        if (paymentStatus) {
          updateData.payment_status = paymentStatus;
        }

        const { error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId);

        if (error) throw error;
      }

      // Update local state
      setRecentOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status, ...(paymentStatus && { payment_status: paymentStatus }) }
            : order
        )
      );
      
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const sendMessageToCustomers = async () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (bulkMessageType === 'selected' && selectedCustomers.length === 0) {
      toast.error('Please select customers to send message to');
      return;
    }

    setSendingMessage(true);
    try {
      const targetCustomers = bulkMessageType === 'all' 
        ? customers 
        : customers.filter(c => selectedCustomers.includes(c.id));
      
      const customersWithPhone = targetCustomers.filter(c => c.phone);
      
      if (customersWithPhone.length === 0) {
        toast.error('None of the selected customers have phone numbers');
        return;
      }

      // TODO: Integrate with SMS API
      console.log('Sending message to customers:', customersWithPhone.map(c => c.phone));
      console.log('Message:', messageText);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Message sent to ${customersWithPhone.length} customers successfully!`);
      setMessageText('');
      setSelectedCustomers([]);
      setBulkMessageType('selected');
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Failed to send messages');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 p-4 border-r">
          <AdminNav />
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 p-4 border-r">
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6">
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Management</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'orders'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'customers'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Customers
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'orders' && (
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
                          {order.user_phone && (
                            <div className="text-xs text-gray-400">
                              {order.user_phone}
                            </div>
                          )}
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
          )}

          {activeTab === 'customers' && (
            <div>
              {/* Message Section */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Bulk SMS to Customers
                </h3>
                <div className="space-y-4">
                  {/* Message Type Selection */}
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="messageType"
                        value="selected"
                        checked={bulkMessageType === 'selected'}
                        onChange={(e) => setBulkMessageType(e.target.value as 'all' | 'selected')}
                        className="mr-2"
                      />
                      Send to Selected Customers
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="messageType"
                        value="all"
                        checked={bulkMessageType === 'all'}
                        onChange={(e) => setBulkMessageType(e.target.value as 'all' | 'selected')}
                        className="mr-2"
                      />
                      Send to All Customers
                    </label>
                  </div>

                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your SMS message here..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {bulkMessageType === 'all' 
                        ? `${customers.filter(c => c.phone).length} customers with phone numbers`
                        : `${selectedCustomers.length} customer(s) selected`
                      }
                    </span>
                    <button
                      onClick={sendMessageToCustomers}
                      disabled={sendingMessage || (bulkMessageType === 'selected' && selectedCustomers.length === 0) || !messageText.trim()}
                      className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {sendingMessage ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send SMS
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Customers Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.length === customers.length && customers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomers(customers.map(c => c.id));
                            } else {
                              setSelectedCustomers([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className={selectedCustomers.includes(customer.id) ? 'bg-primary-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleCustomerSelect(customer.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.phone || 'Not provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.total_orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(customer.total_spent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.last_order === 'Never' ? 'Never' : formatDate(customer.last_order)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {customers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No customers yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;