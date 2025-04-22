import React, { useState, useEffect } from 'react';
import { facilityService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FacilityBooking = () => {
  const { currentUser } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    facilityId: '',
    purpose: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchFacilities();
    fetchBookings();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await facilityService.getAllFacilities();
      setFacilities(response.data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
      setError('Failed to fetch facilities. Please try again later.');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await facilityService.getMyBookings(currentUser.id);
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateDateTimes = () => {
    const currentDate = new Date();
    const selectedDate = new Date(formData.date);
    const startTime = new Date(`${formData.date}T${formData.startTime}`);
    const endTime = new Date(`${formData.date}T${formData.endTime}`);
    
    // Check if date is in the past
    if (selectedDate < new Date(currentDate.toDateString())) {
      setError('You cannot book a facility for a past date.');
      return false;
    }
    
    // Check if end time is after start time
    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDateTimes()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const bookingData = {
        ...formData,
        teacherId: currentUser.id
      };
      
      if (editMode && selectedBooking) {
        await facilityService.updateBooking(selectedBooking.id, bookingData);
      } else {
        await facilityService.createBooking(bookingData);
      }
      
      resetForm();
      fetchBookings();
    } catch (err) {
      console.error('Failed to save booking:', err);
      setError(`Failed to ${editMode ? 'update' : 'create'} booking. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      setLoading(true);
      await facilityService.deleteBooking(bookingId);
      
      // Clear selected booking if it's the one being deleted
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
        resetForm();
      }
      
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Failed to cancel booking. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    // Check if current user is the one who booked the facility
    if (booking.teacherId !== currentUser.id) {
      setError("You don't have permission to edit this booking.");
      return;
    }
    
    const facilityBooking = {
      facilityId: booking.facilityId,
      purpose: booking.purpose,
      date: formatDateForInput(booking.date),
      startTime: formatTimeForInput(booking.startTime),
      endTime: formatTimeForInput(booking.endTime),
      notes: booking.notes || ''
    };
    
    setFormData(facilityBooking);
    setSelectedBooking(booking);
    setEditMode(true);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = (facilityId) => {
    // Set up form for a quick booking starting in the next 30 minutes
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour after start
    
    setFormData({
      facilityId: facilityId,
      purpose: 'Quick Booking',
      date: formatDateForInput(now),
      startTime: formatTimeForInput(startTime.toISOString()),
      endTime: formatTimeForInput(endTime.toISOString()),
      notes: ''
    });
    
    setEditMode(false);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      facilityId: '',
      purpose: '',
      date: '',
      startTime: '',
      endTime: '',
      notes: ''
    });
    
    setSelectedBooking(null);
    setEditMode(false);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // If it's already in HH:MM format
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's an ISO date string
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    
    // If it's already in HH:MM format
    if (timeString.includes(':')) {
      return timeString;
    }
    
    // If it's an ISO date string
    const time = new Date(timeString);
    return time.toISOString().substr(11, 5);
  };

  const getFacilityName = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility ? facility.name : 'Unknown Facility';
  };
  
  const getFacilityType = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility ? facility.type : 'Unknown Type';
  };

  const getBookingStatusClass = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const startTime = new Date(`${booking.date}T${booking.startTime}`);
    const endTime = new Date(`${booking.date}T${booking.endTime}`);
    
    if (bookingDate < new Date(now.toDateString())) {
      return 'bg-gray-700 text-gray-300'; // Past
    }
    
    if (now >= startTime && now <= endTime) {
      return 'bg-green-900 text-green-200'; // In progress
    }
    
    return 'bg-blue-900 text-blue-200'; // Upcoming
  };

  const getBookingStatusText = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const startTime = new Date(`${booking.date}T${booking.startTime}`);
    const endTime = new Date(`${booking.date}T${booking.endTime}`);
    
    if (bookingDate < new Date(now.toDateString())) {
      return 'Past';
    }
    
    if (now >= startTime && now <= endTime) {
      return 'In Progress';
    }
    
    return 'Upcoming';
  };

  const isBookingEditable = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const startTime = new Date(`${booking.date}T${booking.startTime}`);
    
    // Check if booking is in the future and belongs to current user
    return booking.teacherId === currentUser.id && 
           bookingDate >= new Date(now.toDateString()) && 
           now < startTime;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-100">Facility Booking</h1>
          <p className="text-primary-300 mt-2">
            Book school facilities for classes, events, or activities
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editMode) {
              resetForm();
            } else {
              setShowForm(!showForm);
              setEditMode(false);
              setSelectedBooking(null);
              resetForm();
            }
          }}
          className="btn btn-primary"
        >
          {showForm && !editMode ? 'Cancel' : 'Book Facility'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
          <button 
            className="ml-2 text-red-200 hover:text-white" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Create/Edit booking form */}
      {showForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">
            {editMode ? 'Edit Booking' : 'New Facility Booking'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Facility <span className="text-red-500">*</span>
                </label>
                <select
                  name="facilityId"
                  value={formData.facilityId}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select facility</option>
                  {facilities.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} ({facility.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Class, Meeting, Event"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input w-full"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="Any additional information or requirements"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : editMode ? 'Update Booking' : 'Book Facility'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Available Facilities section */}
      <div className="bg-primary-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-primary-700">
          <h2 className="text-lg font-semibold text-primary-100">Available Facilities</h2>
        </div>
        
        {facilities.length === 0 ? (
          <div className="p-6 text-center text-primary-300">Loading facilities...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {facilities.map(facility => (
              <div key={facility.id} className="bg-primary-750 rounded-lg p-4 flex flex-col">
                <h3 className="text-lg font-medium text-primary-100">{facility.name}</h3>
                <p className="text-sm text-primary-300 mb-2">{facility.type}</p>
                <p className="text-sm text-primary-300 mb-2">Capacity: {facility.capacity}</p>
                <p className="text-sm text-primary-300 mb-2">Location: {facility.location}</p>
                <p className="text-sm text-primary-300 mb-2">
                  Hours: {facility.openingTime ? `${facility.openingTime} - ${facility.closingTime}` : 'Not specified'}
                </p>
                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => handleBookNow(facility.id)}
                    className="w-full btn btn-primary"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings list */}
      <div className="bg-primary-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-primary-700">
          <h2 className="text-lg font-semibold text-primary-100">Your Bookings</h2>
        </div>
        
        {loading && bookings.length === 0 ? (
          <div className="p-6 text-center text-primary-300">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center text-primary-300">
            You haven't booked any facilities yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Facility</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-primary-750">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-200">
                        {getFacilityName(booking.facilityId)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">
                        {getFacilityType(booking.facilityId)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{booking.purpose}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{formatDate(booking.date)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusClass(booking)}`}>
                        {getBookingStatusText(booking)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {isBookingEditable(booking) ? (
                        <>
                          <button
                            onClick={() => handleEdit(booking)}
                            className="text-primary-300 hover:text-primary-100 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <span className="text-primary-400">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityBooking; 