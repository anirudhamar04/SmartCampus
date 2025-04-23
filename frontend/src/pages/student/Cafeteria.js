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
  const { user } = useAuth();
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
    fetchInitialData();
  }, [user.id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch all cafeteria items
      const itemsResponse = await cafeteriaService.getAllItems();
      setMenuItems(itemsResponse.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(itemsResponse.data.map(item => item.category))];
      setCategories(uniqueCategories);
      
      // Fetch user's orders
      const ordersResponse = await cafeteriaService.getOrdersByUser(user.id);
      setOrders(ordersResponse.data);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cafeteria data. Please try again later.');
      setLoading(false);
      console.error('Error fetching cafeteria data:', err);
    }
  };

  const handleAddToCart = (item) => {
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
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
        userId: user.id,
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        paymentMethod,
        deliveryLocation,
        remarks
      };
      
      await cafeteriaService.createOrder(orderData);
      
      // Reset state
      setCart([]);
      setDeliveryLocation('');
      setRemarks('');
      setShowCheckout(false);
      
      // Show success message
      setSuccessMessage('Order placed successfully!');
      
      // Refresh orders
      const ordersResponse = await cafeteriaService.getOrdersByUser(user.id);
      setOrders(ordersResponse.data);
      
      // Switch to orders tab
      setActiveTab('orders');
      
      setOrderLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      setOrderLoading(false);
      console.error('Error placing order:', err);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Format price
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
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

  // Filter menu items by category
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Campus Cafeteria</h1>
        
        {/* Cart Summary Button */}
        {activeTab === 'menu' && (
          <button
            onClick={() => setShowCheckout(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={cart.length === 0}
          >
            <FaShoppingCart className="mr-2" />
            Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            {cart.length > 0 && (
              <span className="ml-2 font-bold">{formatPrice(calculateTotal())}</span>
            )}
          </button>
        )}
      </div>
      
      {/* Success or Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <FaCheckCircle className="mr-2" />
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}

      {/* Checkout Form */}
      {showCheckout && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Order</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Your cart is empty.</p>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              {/* Cart Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Items in Cart</h3>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex flex-col p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600 ml-2">
                            {formatPrice(item.price)} each
                          </span>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartItem(index, item.quantity - 1)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="mx-2 w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartItem(index, item.quantity + 1)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <FaPlus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(index)}
                            className="ml-4 p-1 text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={item.specialInstructions}
                          onChange={(e) => handleUpdateSpecialInstructions(index, e.target.value)}
                          placeholder="Special instructions (optional)"
                          className="flex-grow p-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="ml-4 font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-4 font-semibold text-lg">
                  <span className="mr-2">Total:</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
              
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-gray-700 font-medium mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-gray-700 font-medium mb-2">
                  Additional Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  placeholder="Any additional information for your order"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={orderLoading || cart.length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center"
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
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'menu' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : activeTab === 'menu' ? (
        <>
          {/* Menu Categories */}
          <div className="mb-6 border-b pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === '' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory('')}
              >
                All Items
              </button>
              
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === category 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Menu Items */}
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No menu items found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md"
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
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <span className="font-bold text-green-700">{formatPrice(item.price)}</span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mb-2">
                        {item.category}
                      </span>
                      <p className="text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {item.available ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" />
                          Add to Order
                        </button>
                      ) : (
                        <div className="text-yellow-600 bg-yellow-50 py-2 px-4 rounded-md text-center w-full">
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
            {orders.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You haven't placed any orders yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        <FaHistory className="inline-block mr-1" />
                        {formatDate(order.orderTime)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <FaUtensils className="text-gray-400 mr-2" />
                            <span>
                              {item.quantity} x {item.itemName}
                              {item.specialInstructions && (
                                <span className="text-xs text-gray-500 block ml-5">
                                  Note: {item.specialInstructions}
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Delivery:</span> {order.deliveryLocation}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Payment:</span> {order.paymentMethod.replace('_', ' ')}
                        {' '}
                        <span className={`px-2 py-0.5 rounded text-xs ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>
                    
                    {order.remarks && (
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Remarks:</span> {order.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-lg font-bold text-green-700">
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