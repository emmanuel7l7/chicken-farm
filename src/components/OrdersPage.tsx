import React, { useState, useEffect } from 'react';
import { Package, Eye, CheckCircle, Clock, Truck, X, Phone, Mail, MapPin } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  delivery_address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        // Load real data from Supabase
        const { data: ordersData, error } = await supabase
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
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedOrders = ordersData?.map(order => ({
          id: order.id,
          user_name: order.profiles?.name || 'Unknown',
          user_email: order.profiles?.email || 'Unknown',
          user_phone: order.profiles?.phone,
          items: order.order_items?.map((item: any) => ({
            product_name: item.products?.name || 'Unknown Product',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })) || [],
          total_amount: order.total_amount,
          payment_method: order.payment_method || 'cash_on_delivery',
          payment_status: order.payment_status,
          status: order.status,
          delivery_address: order.delivery_address || '',
          notes: order.notes,
          created_at: order.created_at,
          updated_at: order.updated_at,
        })) || [];

        setOrders(transformedOrders);
      } else {
        // Mock data for development
        const mockOrders: Order[] = [
          {
            id: '1',
            user_name: 'John Doe',
            user_email: 'john@example.com',
            user_phone: '+255712345678',
            items: [
              {
                product_name: 'Premium Layer Hens',
                quantity: 2,
                unit_price: 25000,
                total_price: 50000,
              },
              {
                product_name: 'Fresh Farm Eggs',
                quantity: 1,
                unit_price: 8500,
                total_price: 8500,
              }
            ],
            total_amount: 58500,
            payment_method: 'cash_on_delivery',
            payment_status: 'pending',
            status: 'confirmed',
            delivery_address: '123 Main Street, Dar es Salaam',
            notes: 'Please call before delivery',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '2',
            user_name: 'Jane Smith',
            user_email: 'jane@example.com',
            user_phone: '+255787654321',
            items: [
              {
                product_name: 'Broiler Chickens',
                quantity: 3,
                unit_price: 18000,
                total_price: 54000,
              }
            ],
            total_amount: 54000,
            payment_method: 'mpesa',
            payment_status: 'paid',
            status: 'processing',
            delivery_address: '456 Oak Avenue, Arusha',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const updateData: any = { status, updated_at: new Date().toISOString() };
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
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status, 
                ...(paymentStatus && { payment_status: paymentStatus }),
                updated_at: new Date().toISOString()
              }
            : order
        )
      );
      
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const paymentMatch = paymentFilter === 'all' || order.payment_status === paymentFilter;
    return statusMatch && paymentMatch;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(-8)}
                  </td>
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
                      {order.items.length} item(s)
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items.slice(0, 2).map(item => item.product_name).join(', ')}
                      {order.items.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.payment_method.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {order.payment_method === 'cash_on_delivery' && order.payment_status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed', 'paid')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Order Details #{selectedOrder.id.slice(-8)}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm">{selectedOrder.user_name} ({selectedOrder.user_email})</span>
                  </div>
                  {selectedOrder.user_phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm">{selectedOrder.user_phone}</span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                    <span className="text-sm">{selectedOrder.delivery_address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.product_name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.total_price)}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(item.unit_price)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Payment Status</h4>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    via {selectedOrder.payment_method.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Order Status</h4>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Special Instructions</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 space-y-1">
                <div>Created: {formatDate(selectedOrder.created_at)}</div>
                <div>Last Updated: {formatDate(selectedOrder.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;