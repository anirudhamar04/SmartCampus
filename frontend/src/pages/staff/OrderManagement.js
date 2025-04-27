import React, { useState, useEffect } from 'react';
import { cafeteriaService } from '../../services/api';
import { 
  FaUtensils, 
  FaHistory, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationCircle,
  FaSearch
} from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const orderStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (statusFilter) {
        response = await cafeteriaService.getOrdersByStatus(statusFilter);
      } else {
        // Since there's no "all orders" endpoint, we'll fetch by each status
        const pendingOrders = await cafeteriaService.getOrdersByStatus('PENDING');
        const preparingOrders = await cafeteriaService.getOrdersByStatus('PREPARING');
        const readyOrders = await cafeteriaService.getOrdersByStatus('READY');
        const completedOrders = await cafeteriaService.getOrdersByStatus('COMPLETED');
        const cancelledOrders = await cafeteriaService.getOrdersByStatus('CANCELLED');
        
        // Combine all orders
        response = {
          data: [
            ...(pendingOrders.data || []),
            ...(preparingOrders.data || []),
            ...(readyOrders.data || []),
            ...(completedOrders.data || []),
            ...(cancelledOrders.data || [])
          ]
        };
      }
      
      if (response && response.data) {
        // Sort orders by creation time - most recent first
        const sortedOrders = response.data.sort((a, b) => {
          return new Date(b.orderTime) - new Date(a.orderTime);
        });
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      await cafeteriaService.updateOrderStatus(orderId, newStatus);
      
      // Update local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      setSuccessMessage(`Order #${orderId} updated to ${newStatus}`);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(`Failed to update order status: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Filter orders by search query (orderId or customer name)
  const filteredOrders = searchQuery.trim() === '' 
    ? orders 
    : orders.filter(order => 
        order.id.toString().includes(searchQuery) || 
        order.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <button
          onClick={fetchOrders}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          disabled={loading}
        >
          Refresh Orders
        </button>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <FaCheckCircle className="mr-2" />
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-primary-300 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 bg-primary-800 border border-primary-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">All Orders</option>
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-primary-300 mb-2">Search by Order ID or Customer</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full p-2 pl-10 bg-primary-800 border border-primary-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <FaSearch className="absolute left-3 top-3 text-primary-500" />
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-primary-300">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-primary-800 rounded-lg p-8 text-center">
          <p className="text-primary-300 text-lg">No orders found</p>
          {statusFilter && (
            <p className="text-primary-400 mt-2">Try selecting a different status filter</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-primary-800 rounded-lg overflow-hidden">
            <thead className="bg-primary-700">
              <tr>
                <th className="px-4 py-3 text-left text-primary-300">Order ID</th>
                <th className="px-4 py-3 text-left text-primary-300">Customer</th>
                <th className="px-4 py-3 text-left text-primary-300">Time</th>
                <th className="px-4 py-3 text-left text-primary-300">Items</th>
                <th className="px-4 py-3 text-left text-primary-300">Total</th>
                <th className="px-4 py-3 text-left text-primary-300">Status</th>
                <th className="px-4 py-3 text-left text-primary-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-primary-750">
                  <td className="px-4 py-3">#{order.id}</td>
                  <td className="px-4 py-3">{order.userName}</td>
                  <td className="px-4 py-3">{formatDate(order.orderTime)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <FaUtensils className="mr-2 text-primary-400" size={12} />
                          <span>{item.quantity}x {item.itemName}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary-200">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          disabled={updateLoading}
                        >
                          Prepare
                        </button>
                      )}
                      
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          disabled={updateLoading}
                        >
                          Mark Ready
                        </button>
                      )}
                      
                      {order.status === 'READY' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          disabled={updateLoading}
                        >
                          Complete
                        </button>
                      )}
                      
                      {(order.status === 'PENDING' || order.status === 'PREPARING') && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          disabled={updateLoading}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 