import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { lostAndFoundService } from '../../services/api';
import { 
  FaSearch, 
  FaPlus, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaHandHolding,
  FaInfoCircle,
  FaClipboardList
} from 'react-icons/fa';

const LostAndFound = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('allItems');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // New item form
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemCategory, setItemCategory] = useState('ELECTRONICS');
  const [itemLocation, setItemLocation] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [itemStatus, setItemStatus] = useState('LOST'); // LOST or FOUND
  const [itemImage, setItemImage] = useState('');

  // Claim form
  const [claimDescription, setClaimDescription] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const categories = ['ELECTRONICS', 'CLOTHING', 'ACCESSORIES', 'DOCUMENTS', 'KEYS', 'OTHER'];
  const locations = ['Main Building', 'Library', 'Cafeteria', 'Sports Complex', 'Dorms', 'Parking Lot', 'Other'];

  useEffect(() => {
    fetchItems();
    if (currentUser && currentUser.id) {
      fetchMyItems();
    }
  }, [currentUser]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await lostAndFoundService.getAllItems();
      if (response && response.data) {
        setItems(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lost and found items:', err);
      setError('Failed to fetch items. Please try again later.');
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      if (!currentUser || !currentUser.id) return;
      
      const response = await lostAndFoundService.getMyItems(currentUser.id);
      if (response && response.data) {
        setMyItems(response.data);
      }
    } catch (err) {
      console.error('Error fetching your items:', err);
      // Don't show error to avoid disrupting main view
    }
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!itemName || !itemDescription || !itemLocation || !itemDate) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser.id) {
        setError('You must be logged in to report an item.');
        setLoading(false);
        return;
      }
      
      const itemData = {
        name: itemName.trim(),
        description: itemDescription.trim(),
        category: itemCategory,
        location: itemLocation,
        date: itemDate,
        status: itemStatus,
        reportedBy: currentUser.id,
        imageUrl: itemImage.trim() || null
      };
      
      await lostAndFoundService.addItem(itemData);
      
      // Reset form
      setItemName('');
      setItemDescription('');
      setItemCategory('ELECTRONICS');
      setItemLocation('');
      setItemDate('');
      setItemImage('');
      setShowForm(false);
      
      // Show success message
      setSuccessMessage(`Item has been reported as ${itemStatus.toLowerCase()}.`);
      
      // Refresh items
      fetchItems();
      fetchMyItems();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error submitting lost/found item:', err);
      setError('Failed to submit your item. Please try again.');
      setLoading(false);
    }
  };

  const handleClaimItem = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!claimDescription) {
      setError('Please provide details to support your claim.');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser.id) {
        setError('You must be logged in to claim an item.');
        setLoading(false);
        return;
      }
      
      if (!selectedItem || !selectedItem.id) {
        setError('No item selected for claim.');
        setLoading(false);
        return;
      }
      
      const claimData = {
        userId: currentUser.id,
        description: claimDescription.trim()
      };
      
      await lostAndFoundService.claimItem(selectedItem.id, claimData);
      
      // Reset form
      setClaimDescription('');
      setSelectedItem(null);
      setShowClaimForm(false);
      
      // Show success message
      setSuccessMessage('Your claim has been submitted. We will review it shortly.');
      
      // Refresh items
      fetchItems();
      fetchMyItems();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error claiming item:', err);
      setError('Failed to submit your claim. Please try again.');
      setLoading(false);
    }
  };

  const handleStartClaim = (item) => {
    if (!currentUser || !currentUser.id) {
      setError('You must be logged in to claim items.');
      return;
    }
    
    setSelectedItem(item);
    setShowClaimForm(true);
    setClaimDescription('');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForms = () => {
    setShowForm(false);
    setShowClaimForm(false);
    setSelectedItem(null);
    setItemName('');
    setItemDescription('');
    setItemCategory('ELECTRONICS');
    setItemLocation('');
    setItemDate('');
    setItemImage('');
    setClaimDescription('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Filter items based on search term and filters
  const filteredItems = items.filter(item => {
    // Text search
    const searchMatch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const categoryMatch = !categoryFilter || item.category === categoryFilter;
    
    // Status filter
    const statusMatch = !statusFilter || item.status === statusFilter;
    
    return searchMatch && categoryMatch && statusMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-800">Lost and Found</h1>
        <button
          onClick={() => {
            resetForms();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors flex items-center"
        >
          {showForm ? 'Cancel' : 'Report Item'}
          {!showForm && <FaPlus className="ml-2" />}
        </button>
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

      {/* Report Lost/Found Item Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Report an Item</h2>
          
          <form onSubmit={handleSubmitItem}>
            <div className="mb-4">
              <div className="flex space-x-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="statusLost"
                    name="itemStatus"
                    value="LOST"
                    checked={itemStatus === 'LOST'}
                    onChange={() => setItemStatus('LOST')}
                    className="mr-2"
                  />
                  <label htmlFor="statusLost" className="text-zinc-700">I lost an item</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="statusFound"
                    name="itemStatus"
                    value="FOUND"
                    checked={itemStatus === 'FOUND'}
                    onChange={() => setItemStatus('FOUND')}
                    className="mr-2"
                  />
                  <label htmlFor="statusFound" className="text-zinc-700">I found an item</label>
                </div>
              </div>
            
              <label className="block text-zinc-700 font-medium mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="Brief name of the item"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-zinc-700 font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 min-h-[120px]"
                placeholder="Detailed description (color, brand, identifying features, etc.)"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Category
                </label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={itemLocation}
                  onChange={(e) => setItemLocation(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Date {itemStatus === 'LOST' ? 'Lost' : 'Found'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={itemDate}
                  onChange={(e) => setItemDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  placeholder="URL to an image of the item"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Claim Item Form */}
      {showClaimForm && selectedItem && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-2">Claim Item</h2>
          <p className="mb-4 text-zinc-600">
            You are claiming: <span className="font-medium">{selectedItem.name}</span>
          </p>
          
          <form onSubmit={handleClaimItem}>
            <div className="mb-6">
              <label className="block text-zinc-700 font-medium mb-2">
                Proof of Ownership <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-zinc-500 mb-2">
                Please provide specific details that would identify you as the owner of this item.
              </p>
              <textarea
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 min-h-[120px]"
                placeholder="Describe unique identifiers or characteristics only the owner would know about"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setShowClaimForm(false);
                }}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
              <FaSearch className="absolute left-3 top-3 text-zinc-400" />
            </div>
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="">All Status</option>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
              <option value="CLAIMED">Claimed</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'allItems' ? 'text-black border-b-2 border-black' : 'text-zinc-500'}`}
          onClick={() => setActiveTab('allItems')}
        >
          All Items
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'myItems' ? 'text-black border-b-2 border-black' : 'text-zinc-500'}`}
          onClick={() => {
            setActiveTab('myItems');
            if (currentUser && currentUser.id) {
              fetchMyItems();
            }
          }}
        >
          My Items
        </button>
      </div>

      {/* Items List */}
      {loading && activeTab === 'allItems' ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-zinc-600">Loading items...</p>
        </div>
      ) : activeTab === 'allItems' ? (
        <>
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 rounded-lg">
              <p className="text-zinc-500">No items found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-zinc-200 transition-all duration-200 hover:shadow-md"
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'LOST' ? 'bg-red-100 text-red-800' :
                        item.status === 'FOUND' ? 'bg-green-100 text-green-800' :
                        item.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="mb-3 text-sm text-zinc-600">
                      <div className="flex items-center mb-1">
                        <FaInfoCircle className="mr-2" />
                        <span>Category: {item.category}</span>
                      </div>
                      
                      <div className="flex items-center mb-1">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>Location: {item.location}</span>
                      </div>
                      
                      <div className="flex items-center mb-1">
                        <FaCalendarAlt className="mr-2" />
                        <span>Date: {formatDate(item.date)}</span>
                      </div>
                    </div>
                    
                    <p className="text-zinc-700 mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    
                    <div>
                      {item.status === 'FOUND' && (
                        <button
                          onClick={() => handleStartClaim(item)}
                          className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-center"
                        >
                          <FaHandHolding className="mr-2" />
                          This is Mine
                        </button>
                      )}
                      
                      {item.status === 'LOST' && (
                        <div className="text-zinc-500 py-2 px-4 bg-zinc-50 rounded-md text-center">
                          <FaClipboardList className="inline-block mr-2" />
                          Reported as lost
                        </div>
                      )}
                      
                      {(item.status === 'CLAIMED' || item.status === 'RETURNED') && (
                        <div className="text-green-600 py-2 px-4 bg-green-50 rounded-md text-center">
                          <FaCheckCircle className="inline-block mr-2" />
                          {item.status === 'CLAIMED' ? 'Claim submitted' : 'Returned to owner'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : activeTab === 'myItems' ? (
        <>
          {!currentUser ? (
            <div className="text-center py-10 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700">You need to be logged in to view your items.</p>
            </div>
          ) : myItems.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 rounded-lg">
              <p className="text-zinc-500">You haven't reported or claimed any items yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'LOST' ? 'bg-red-100 text-red-800' :
                        item.status === 'FOUND' ? 'bg-green-100 text-green-800' :
                        item.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {item.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(item.date)}
                      </p>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-2" />
                        {item.location}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-zinc-700 line-clamp-3">{item.description}</p>
                    </div>
                  </div>
                  
                  {item.adminNotes && (
                    <div className="mb-4 p-3 bg-zinc-50 rounded-md">
                      <p className="text-zinc-700">
                        <span className="font-medium">Admin Notes:</span> {item.adminNotes}
                      </p>
                    </div>
                  )}
                  
                  {item.status === 'CLAIMED' && (
                    <div className="text-yellow-600 py-2 px-4 bg-yellow-50 rounded-md text-center">
                      Your claim is under review
                    </div>
                  )}
                  
                  {item.status === 'RETURNED' && (
                    <div className="text-green-600 py-2 px-4 bg-green-50 rounded-md text-center">
                      This item has been returned
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default LostAndFound; 