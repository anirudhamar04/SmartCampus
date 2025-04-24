import React, { useState, useEffect } from 'react';
import { cafeteriaService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUtensils, 
  FaShoppingCart, 
  FaPlus, 
  FaMinus, 
  FaTrash, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaHistory,
  FaCreditCard
} from 'react-icons/fa';

const StudentCafeteria = () => {
  const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const paymentMethods = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT', 'MEAL_PLAN'];
  const deliveryLocations = ['Campus Center', 'Library', 'Student Union', 'Dorm A', 'Dorm B', 'Dorm C', 'Sports Complex', 'Pick Up'];

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchInitialData();
    }
  }, [currentUser]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser || !currentUser.id) {
        setError('User information not available. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching cafeteria data for user:', currentUser.id);
      
      // Fetch all cafeteria items
      const itemsResponse = await cafeteriaService.getAllItems();
      console.log('Menu items response:', itemsResponse);
      
      if (itemsResponse && itemsResponse.data) {
        setMenuItems(itemsResponse.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(itemsResponse.data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } else {
        setMenuItems([]);
        setCategories([]);
      }
      
      // Fetch user's orders
      const ordersResponse = await cafeteriaService.getOrdersByUser(currentUser.id);
      console.log('Orders response:', ordersResponse);
      
      if (ordersResponse && ordersResponse.data) {
        setOrders(ordersResponse.data);
      } else {
        setOrders([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cafeteria data:', err);
      setError('Failed to fetch cafeteria data. Please try again later.');
      setLoading(false);
      setMenuItems([]);
      setOrders([]);
    }
  };

  const handleAddToCart = (item) => {
    if (!item || !item.id) {
      console.error('Invalid item:', item);
      return;
    }
    
    const existingItem = cart.find(cartItem => cartItem.itemId === item.id);
    
    if (existingItem) {
      // Update quantity if already in cart
      setCart(cart.map(cartItem => 
        cartItem.itemId === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      // Add new item to cart
      setCart([...cart, {
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        specialInstructions: ''
      }]);
    }
    
    // Show success message
    setSuccessMessage(`Added ${item.name} to cart`);
    
    // Clear success message after 2 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
  };

  const handleUpdateCartItem = (index, quantity) => {
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      handleRemoveCartItem(index);
      return;
    }
    
    setCart(cart.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const handleUpdateSpecialInstructions = (index, specialInstructions) => {
    setCart(cart.map((item, i) => 
      i === index ? { ...item, specialInstructions } : item
    ));
  };

  const handleRemoveCartItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const refreshOrders = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        console.error('Cannot refresh orders: No user information');
        return;
      }

      const ordersResponse = await cafeteriaService.getOrdersByUser(currentUser.id);
      
      if (ordersResponse && ordersResponse.data) {
        setOrders(ordersResponse.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error refreshing orders:', err);
      // Don't show error to user as this is a background refresh
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!currentUser || !currentUser.id) {
      setError('User information not available. Please log in again.');
      return;
    }
    
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before placing an order.');
      return;
    }
    
    if (!deliveryLocation) {
      setError('Please select a delivery location.');
      return;
    }
    
    try {
      setOrderLoading(true);
      
      // Format the order data
      const orderData = {
        userId: currentUser.id,
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions?.trim() || ''
        })),
        paymentMethod,
        deliveryLocation,
        remarks: remarks?.trim() || ''
      };
      
      console.log('Placing order:', orderData);
      await cafeteriaService.createOrder(orderData);
      
      // Reset state
      setCart([]);
      setDeliveryLocation('');
      setRemarks('');
      setShowCheckout(false);
      
      // Show success message
      setSuccessMessage('Order placed successfully!');
      
      // Refresh orders
      await refreshOrders();
      
      // Switch to orders tab
      setActiveTab('orders');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(`Failed to place order: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setOrderLoading(false);
    }
  };

  // Calculate cart total
  const calculateTotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-primary-800 text-primary-200';
    
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-900 text-yellow-200';
      case 'PREPARING':
        return 'bg-blue-900 text-blue-200';
      case 'READY':
        return 'bg-green-900 text-green-200';
      case 'COMPLETED':
        return 'bg-gray-900 text-gray-200';
      case 'CANCELLED':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  // Filter menu items by category
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-100">Campus Cafeteria</h1>
        <p className="text-primary-300 mt-2">
          Order food and track your deliveries
        </p>
      </div>
      
      {/* Success or Error Messages */}
      {successMessage && (
        <div className="bg-green-900 text-green-200 p-3 rounded">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded flex items-center justify-between">
          <span>{error}</span>
          <button 
            className="text-red-200 hover:text-red-100" 
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Cart Button */}
      {activeTab === 'menu' && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCheckout(true)}
            className="btn btn-primary flex items-center"
            disabled={!cart || cart.length === 0}
          >
            <FaShoppingCart className="mr-2" />
            Cart ({cart ? cart.length : 0} {cart && cart.length === 1 ? 'item' : 'items'})
            {cart && cart.length > 0 && (
              <span className="ml-2 font-bold">{formatPrice(calculateTotal())}</span>
            )}
          </button>
        </div>
      )}

      {/* Check if user is authenticated */}
      {!currentUser && (
        <div className="mb-4 p-3 bg-yellow-900 text-yellow-200 rounded">
          <p>You need to be logged in to place orders. Please log in to continue.</p>
        </div>
      )}

      {/* Checkout Form */}
      {showCheckout && (
        <div className="bg-primary-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-100">Your Order</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-primary-400 hover:text-primary-200"
            >
              &times;
            </button>
          </div>
          
          {!cart || cart.length === 0 ? (
            <div className="p-6 text-center text-primary-300">
              Your cart is empty.
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              {/* Cart Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-primary-200 mb-3">Items in Cart</h3>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex flex-col p-4 border border-primary-700 rounded-md bg-primary-750">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium text-primary-200">{item.name}</span>
                          <span className="text-primary-300 ml-2">
                            {formatPrice(item.price)} each
                          </span>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartItem(index, item.quantity - 1)}
                            className="p-1 text-primary-400 hover:text-primary-200"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="mx-2 w-6 text-center text-primary-200">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartItem(index, item.quantity + 1)}
                            className="p-1 text-primary-400 hover:text-primary-200"
                          >
                            <FaPlus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(index)}
                            className="ml-4 p-1 text-red-400 hover:text-red-300"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={item.specialInstructions || ''}
                          onChange={(e) => handleUpdateSpecialInstructions(index, e.target.value)}
                          placeholder="Special instructions (optional)"
                          className="input flex-grow"
                        />
                        <span className="ml-4 font-semibold text-primary-200">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-4 font-semibold text-lg text-primary-100">
                  <span className="mr-2">Total:</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
              
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-primary-200 font-medium mb-2">
                    Delivery Location <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Select Location</option>
                    {deliveryLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-primary-200 font-medium mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input w-full"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-primary-200 font-medium mb-2">
                  Additional Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input w-full h-32"
                  placeholder="Any additional information for your order"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={orderLoading || !cart || cart.length === 0 || !currentUser}
                  className="btn btn-primary flex items-center"
                >
                  <FaCreditCard className="mr-2" />
                  {orderLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-primary-700">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'menu'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => setActiveTab('menu')}
          >
            Menu
          </button>
          
          <button
            className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => {
              setActiveTab('orders');
              if (currentUser && currentUser.id) {
                refreshOrders();
              }
            }}
          >
            My Orders
          </button>
          
          {/* Category tabs */}
          {activeTab === 'menu' && categories.map((cat) => (
            <button
              key={cat}
              className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
                selectedCategory === cat
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-300 mx-auto"></div>
          <p className="mt-2 text-primary-300">Loading...</p>
        </div>
      ) : activeTab === 'menu' ? (
        <>          
          {/* Menu Items */}
          {!filteredMenuItems || filteredMenuItems.length === 0 ? (
            <div className="p-6 text-center text-primary-300 bg-primary-800 rounded-lg">
              No menu items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-primary-800 rounded-lg overflow-hidden border border-primary-700 transition-all duration-200 hover:bg-primary-750"
                >
                  {item.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-primary-100">{item.name}</h3>
                      <span className="font-bold text-green-300">{formatPrice(item.price)}</span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 bg-primary-700 text-primary-200 text-xs rounded mb-2">
                        {item.category}
                      </span>
                      <p className="text-primary-300 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {item.available ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="btn btn-primary w-full flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" />
                          Add to Order
                        </button>
                      ) : (
                        <div className="bg-yellow-900 text-yellow-200 py-2 px-4 rounded text-center w-full">
                          Currently unavailable
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-6">
            {!orders || orders.length === 0 ? (
              <div className="p-6 text-center text-primary-300 bg-primary-800 rounded-lg">
                You haven't placed any orders yet.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-primary-800 p-5 rounded-lg border border-primary-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-100">Order #{order.id}</h3>
                      <p className="text-sm text-primary-400">
                        <FaHistory className="inline-block mr-1" />
                        {formatDate(order.orderTime)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-primary-200">Items:</h4>
                    <div className="space-y-2">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <FaUtensils className="text-primary-400 mr-2" />
                            <span className="text-primary-300">
                              {item.quantity} x {item.itemName}
                              {item.specialInstructions && (
                                <span className="text-xs text-primary-400 block ml-5">
                                  Note: {item.specialInstructions}
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="font-medium text-primary-200">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-primary-300">
                        <span className="font-medium">Delivery:</span> {order.deliveryLocation}
                      </p>
                      <p className="text-primary-300">
                        <span className="font-medium">Payment:</span> {order.paymentMethod && order.paymentMethod.replace('_', ' ')}
                        {' '}
                        <span className={`px-2 py-0.5 rounded text-xs ${order.paymentStatus === 'PAID' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>
                    
                    {order.remarks && (
                      <div>
                        <p className="text-primary-300">
                          <span className="font-medium">Remarks:</span> {order.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-primary-700">
                    <span className="font-medium text-primary-300">Total:</span>
                    <span className="text-lg font-bold text-green-300">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCafeteria; 