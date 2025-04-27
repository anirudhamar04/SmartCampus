import React, { useState, useEffect } from 'react';
import { facilityService } from '../../services/api';

// Facility card component
const FacilityCard = ({ facility, onManage }) => {
  const statusColor = facility.status === 'AVAILABLE' 
    ? 'bg-green-900/30 text-green-300'
    : 'bg-red-900/30 text-red-300';
    
  return (
    <div className="card p-6">
      <div className="flex justify-between items-start">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-primary-100 mb-1">{facility.name}</h3>
          <p className="text-sm text-primary-300">Location: {facility.location}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
          {facility.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-primary-300 text-sm">Type</h4>
          <p className="text-primary-100">{facility.type}</p>
        </div>
        <div>
          <h4 className="text-primary-300 text-sm">Capacity</h4>
          <p className="text-primary-100">{facility.capacity}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-primary-300 text-sm">Pending Bookings</h4>
          <p className="text-primary-100">{facility.pendingBookings || 0}</p>
        </div>
        <button
          onClick={() => onManage(facility)}
          className="btn btn-sm btn-primary"
        >
          Manage Bookings
        </button>
      </div>
    </div>
  );
};

// Booking details modal
const BookingDetailsModal = ({ booking, facility, onClose, onApprove, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-900 rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-primary-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-100">
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="text-primary-300 hover:text-primary-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-primary-100 mb-4">Booking Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-primary-300 text-sm">Booking ID</p>
                  <p className="text-primary-100">{booking.id}</p>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Status</p>
                  <p className={`inline-block px-2 py-1 rounded-full text-xs ${
                    booking.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-300' :
                    booking.status === 'APPROVED' ? 'bg-green-900/30 text-green-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {booking.status}
                  </p>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Purpose</p>
                  <p className="text-primary-100">{booking.purpose}</p>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Date</p>
                  <p className="text-primary-100">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Time</p>
                  <p className="text-primary-100">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary-100 mb-4">Facility Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-primary-300 text-sm">Facility Name</p>
                  <p className="text-primary-100">{facility.name}</p>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Location</p>
                  <p className="text-primary-100">{facility.location}</p>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Type</p>
                  <p className="text-primary-100">{facility.type}</p>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Capacity</p>
                  <p className="text-primary-100">{facility.capacity}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-primary-100 mb-4">Requester Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-primary-300 text-sm">Name</p>
                <p className="text-primary-100">{booking.requester.firstName} {booking.requester.lastName}</p>
              </div>
              <div>
                <p className="text-primary-300 text-sm">Email</p>
                <p className="text-primary-100">{booking.requester.email}</p>
              </div>
              <div>
                <p className="text-primary-300 text-sm">Role</p>
                <p className="text-primary-100">{booking.requester.role}</p>
              </div>
              <div>
                <p className="text-primary-300 text-sm">Department</p>
                <p className="text-primary-100">{booking.requester.department || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {booking.status === 'PENDING' && (
          <div className="p-6 border-t border-primary-700 flex justify-end space-x-3">
            <button
              onClick={() => onReject(booking.id)}
              className="btn bg-red-700 hover:bg-red-600 text-white"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(booking.id)}
              className="btn bg-green-700 hover:bg-green-600 text-white"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Facility bookings management modal
const FacilityBookingsModal = ({ facility, onClose, onUpdateBooking }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Make real API call
      const response = await facilityService.getBookings(facility.id);
      setBookings(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setMessage({
        text: 'Failed to load bookings. Please try again.',
        type: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
  };
  
  const handleApproveBooking = async (bookingId) => {
    try {
      // Make real API call
      await facilityService.updateBooking(bookingId, { status: 'APPROVED' });
      
      // Update bookings state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'APPROVED' } : booking
      );
      
      setBookings(updatedBookings);
      
      // Calculate new pending bookings count
      const pendingCount = updatedBookings.filter(booking => booking.status === 'PENDING').length;
      
      // Update parent component
      onUpdateBooking({
        ...facility,
        pendingBookings: pendingCount
      });
      
      setSelectedBooking(null);
      setMessage({
        text: 'Booking approved successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to approve booking:', error);
      setMessage({
        text: 'Failed to approve booking',
        type: 'error'
      });
    }
  };
  
  const handleRejectBooking = async (bookingId) => {
    try {
      // Make real API call
      await facilityService.updateBooking(bookingId, { status: 'REJECTED' });
      
      // Update bookings state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'REJECTED' } : booking
      );
      
      setBookings(updatedBookings);
      
      // Calculate new pending bookings count
      const pendingCount = updatedBookings.filter(booking => booking.status === 'PENDING').length;
      
      // Update parent component
      onUpdateBooking({
        ...facility,
        pendingBookings: pendingCount
      });
      
      setSelectedBooking(null);
      setMessage({
        text: 'Booking rejected successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to reject booking:', error);
      setMessage({
        text: 'Failed to reject booking',
        type: 'error'
      });
    }
  };
  
  // Filter bookings based on selected status
  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'ALL' || booking.status === filterStatus
  );
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-primary-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-100">
            Manage Bookings: {facility.name}
          </h2>
          <button
            onClick={onClose}
            className="text-primary-300 hover:text-primary-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {message.text && (
          <div className={`px-6 py-3 ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
            {message.text}
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="statusFilter" className="block text-primary-300 mb-2">Filter by Status</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-full md:w-48"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="card p-8 text-center text-primary-300">
              No bookings found for this facility.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-800/50 text-left">
                    <th className="py-3 px-4 font-semibold text-primary-300">Date</th>
                    <th className="py-3 px-4 font-semibold text-primary-300">Time</th>
                    <th className="py-3 px-4 font-semibold text-primary-300">Purpose</th>
                    <th className="py-3 px-4 font-semibold text-primary-300">Requester</th>
                    <th className="py-3 px-4 font-semibold text-primary-300">Status</th>
                    <th className="py-3 px-4 font-semibold text-primary-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="border-b border-primary-800">
                      <td className="py-4 px-4">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4">{booking.startTime} - {booking.endTime}</td>
                      <td className="py-4 px-4">{booking.purpose}</td>
                      <td className="py-4 px-4">{booking.requester.firstName} {booking.requester.lastName}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          booking.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-300' :
                          booking.status === 'APPROVED' ? 'bg-green-900/30 text-green-300' :
                          'bg-red-900/30 text-red-300'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-primary-400 hover:text-primary-100"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          facility={facility}
          onClose={() => setSelectedBooking(null)}
          onApprove={handleApproveBooking}
          onReject={handleRejectBooking}
        />
      )}
    </div>
  );
};

const FacilityManagementPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [showEditFacilityModal, setShowEditFacilityModal] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalBookings: 0,
    availableFacilities: 0
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchBookings(selectedFacility.id);
    }
  }, [selectedFacility]);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      // Make real API call
      const response = await facilityService.getAllFacilities();
      const facilityData = response.data || [];
      setFacilities(facilityData);
      
      // If no facility is selected and we have facilities, select the first one
      if (!selectedFacility && facilityData.length > 0) {
        setSelectedFacility(facilityData[0]);
      }
      
      // Make another API call to get available facilities
      const availableResponse = await facilityService.getAvailable();
      const availableFacilities = availableResponse.data?.length || 0;
      
      // Calculate bookings statistics
      const allBookingsResponse = await facilityService.getBookings();
      const allBookings = allBookingsResponse.data || [];
      
      setStats({
        totalFacilities: facilityData.length,
        totalBookings: allBookings.length,
        availableFacilities
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
      setMessage({
        text: 'Failed to load facilities. Please try again.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const fetchBookings = async (facilityId) => {
    setBookingLoading(true);
    try {
      // Make real API call to get bookings for a facility
      const response = await facilityService.getBookings(facilityId);
      setBookings(response.data || []);
      setBookingLoading(false);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setMessage({
        text: 'Failed to load bookings. Please try again.',
        type: 'error'
      });
      setBookingLoading(false);
    }
  };

  const handleCreateFacility = async (facilityData) => {
    try {
      // Make real API call
      const response = await facilityService.create(facilityData);
      
      // Add the new facility to state
      const newFacility = response.data;
      setFacilities([...facilities, newFacility]);
      
      // Update statistics
      setStats({
        ...stats,
        totalFacilities: stats.totalFacilities + 1,
        availableFacilities: stats.availableFacilities + 1
      });
      
      setMessage({
        text: 'Facility created successfully',
        type: 'success'
      });
      
      // Close modal
      setShowAddFacilityModal(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to create facility:', error);
      setMessage({
        text: 'Failed to create facility. Please try again.',
        type: 'error'
      });
    }
  };

  const handleUpdateFacility = async (facilityId, updatedData) => {
    try {
      // Make real API call
      const response = await facilityService.update(facilityId, updatedData);
      
      // Update the facility in state
      const updatedFacility = response.data;
      setFacilities(facilities.map(facility => 
        facility.id === facilityId ? updatedFacility : facility
      ));
      
      // If this was the selected facility, update it
      if (selectedFacility && selectedFacility.id === facilityId) {
        setSelectedFacility(updatedFacility);
      }
      
      setMessage({
        text: 'Facility updated successfully',
        type: 'success'
      });
      
      // Close modal
      setShowEditFacilityModal(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to update facility:', error);
      setMessage({
        text: 'Failed to update facility. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteFacility = async (facilityId) => {
    try {
      // Make real API call
      await facilityService.delete(facilityId);
      
      // Find if facility was available
      const deletedFacility = facilities.find(facility => facility.id === facilityId);
      const wasAvailable = deletedFacility?.status === 'AVAILABLE' || false;
      
      // Remove facility from state
      const updatedFacilities = facilities.filter(facility => facility.id !== facilityId);
      setFacilities(updatedFacilities);
      
      // Update statistics
      setStats({
        ...stats,
        totalFacilities: stats.totalFacilities - 1,
        availableFacilities: wasAvailable ? stats.availableFacilities - 1 : stats.availableFacilities
      });
      
      // If the deleted facility was selected, select another one
      if (selectedFacility && selectedFacility.id === facilityId) {
        setSelectedFacility(updatedFacilities.length > 0 ? updatedFacilities[0] : null);
      }
      
      setMessage({
        text: 'Facility deleted successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to delete facility:', error);
      setMessage({
        text: 'Failed to delete facility. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      // Make real API call
      await facilityService.deleteBooking(bookingId);
      
      // Remove booking from state
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      
      // Update statistics
      setStats({
        ...stats,
        totalBookings: stats.totalBookings - 1
      });
      
      setMessage({
        text: 'Booking deleted successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to delete booking:', error);
      setMessage({
        text: 'Failed to delete booking. Please try again.',
        type: 'error'
      });
    }
  };

  const handleEditFacility = (facility) => {
    setFacilityToEdit(facility);
    setShowEditFacilityModal(true);
  };

  const handleManageFacility = (facility) => {
    setSelectedFacility(facility);
  };

  // Filter facilities based on search term and type
  const filteredFacilities = facilities.filter(facility => {
    if (!facility) return false;
    
    const type = facility.type || '';
    const name = facility.name || '';
    const location = facility.location || '';
    const term = searchTerm || '';
    const filterTypeValue = filterType || 'ALL';
    
    return (filterTypeValue === 'ALL' || type === filterTypeValue) &&
      (name.toLowerCase().includes(term.toLowerCase()) ||
       location.toLowerCase().includes(term.toLowerCase()));
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-100">Facility Management</h1>
      </div>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
          {message.text}
        </div>
      )}
      
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-primary-300 mb-2">Search Facilities</label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="w-full md:w-64">
            <label htmlFor="filterType" className="block text-primary-300 mb-2">Filter by Type</label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-full"
            >
              <option value="ALL">All Types</option>
              <option value="AUDITORIUM">Auditorium</option>
              <option value="CONFERENCE_ROOM">Conference Room</option>
              <option value="CLASSROOM">Classroom</option>
              <option value="LAB">Lab</option>
              <option value="SPORTS">Sports Facility</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="card p-8 text-center text-primary-300">
          {searchTerm || filterType !== 'ALL' ? 'No facilities match your search criteria.' : 'No facilities found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map(facility => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onManage={handleManageFacility}
            />
          ))}
        </div>
      )}
      
      {selectedFacility && (
        <FacilityBookingsModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          onUpdateBooking={handleUpdateFacility}
        />
      )}
    </div>
  );
};

export default FacilityManagementPage; 