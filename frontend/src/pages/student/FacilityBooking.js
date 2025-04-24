import React, { useState, useEffect } from 'react';
import { facilityService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaBuilding, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaTimesCircle,
  FaUsers
} from 'react-icons/fa';

const StudentFacilityBooking = () => {
  const { currentUser } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('facilities');
  
  // Booking form state
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

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
      
      console.log('Fetching facility data for user:', currentUser.id);
      
      // Fetch all available facilities
      const facilitiesResponse = await facilityService.getAll();
      console.log('Facilities response:', facilitiesResponse);
      
      if (facilitiesResponse && facilitiesResponse.data) {
        setFacilities(facilitiesResponse.data);
        
        // Extract unique facility types
        const types = [...new Set(facilitiesResponse.data.map(f => f.type).filter(Boolean))];
        setFacilityTypes(types);
      } else {
        setFacilities([]);
        setFacilityTypes([]);
      }
      
      // Fetch user's bookings
      const bookingsResponse = await facilityService.getMyBookings(currentUser.id);
      console.log('Bookings response:', bookingsResponse);
      
      if (bookingsResponse && bookingsResponse.data) {
        setMyBookings(bookingsResponse.data);
      } else {
        setMyBookings([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching facility data:', err);
      setError('Failed to fetch data. Please try again later.');
      setLoading(false);
      setFacilities([]);
      setMyBookings([]);
    }
  };

  const refreshUserBookings = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        console.error('Cannot refresh bookings: No user information');
        return;
      }

      const bookingsResponse = await facilityService.getMyBookings(currentUser.id);
      
      if (bookingsResponse && bookingsResponse.data) {
        setMyBookings(bookingsResponse.data);
      } else {
        setMyBookings([]);
      }
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      // Don't show error to user as this is a background refresh
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedFacility || !selectedFacility.id) {
      setError('Invalid facility selected. Please try again.');
      return;
    }
    
    if (!bookingDate || !startTime || !endTime || !purpose) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Validate times
    const selectedDate = new Date(bookingDate);
    const now = new Date();
    
    // Check if date is in the past
    if (selectedDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      setError('You cannot book a facility for a past date.');
      return;
    }
    
    // Check if end time is after start time
    const startDateTime = new Date(`${bookingDate}T${startTime}`);
    const endDateTime = new Date(`${bookingDate}T${endTime}`);
    
    if (endDateTime <= startDateTime) {
      setError('End time must be after start time.');
      return;
    }
    
    try {
      setBookingLoading(true);
      
      if (!currentUser || !currentUser.id) {
        setError('User information not available. Please log in again.');
        setBookingLoading(false);
        return;
      }
      
      // Format the booking data
      const bookingData = {
        facilityId: selectedFacility.id,
        teacherId: currentUser.id, // This should be userId, but backend expects teacherId
        purpose: purpose.trim(),
        date: bookingDate,
        startTime,
        endTime,
        notes: notes.trim()
      };
      
      console.log('Submitting booking data:', bookingData);
      await facilityService.createBooking(bookingData);
      
      // Reset form
      setBookingDate('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
      setNotes('');
      setShowBookingForm(false);
      setSelectedFacility(null);
      
      // Show success message
      setSuccessMessage('Facility booked successfully!');
      
      // Refresh bookings
      await refreshUserBookings();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error booking facility:', err);
      setError(`Failed to book facility: ${err.response?.data?.message || 'This time slot might already be taken.'}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Canceling booking with ID:', bookingId);
      await facilityService.deleteBooking(bookingId);
      
      // Show success message
      setSuccessMessage('Booking cancelled successfully!');
      
      // Refresh bookings
      await refreshUserBookings();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(`Failed to cancel booking: ${err.response?.data?.message || 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFacility = (facility) => {
    if (!currentUser || !currentUser.id) {
      setError('You must be logged in to book facilities.');
      return;
    }
    
    setSelectedFacility(facility);
    setShowBookingForm(true);
    
    // Set default values for form
    const today = new Date().toISOString().split('T')[0];
    setBookingDate(today);
    
    // Default booking time: current hour + 1
    const currentHour = new Date().getHours();
    setStartTime(`${(currentHour + 1).toString().padStart(2, '0')}:00`);
    setEndTime(`${(currentHour + 2).toString().padStart(2, '0')}:00`);
    
    // Switch to facilities tab
    setActiveTab('facilities');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowBookingForm(false);
    setSelectedFacility(null);
    setBookingDate('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setNotes('');
    setError(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Check if a booking is upcoming or past
  const isBookingPast = (booking) => {
    if (!booking.date || !booking.endTime) return false;
    
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.endTime.split(':');
    bookingDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    return bookingDate < new Date();
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-900 text-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-900 text-green-200';
      case 'CANCELLED':
        return 'bg-red-900 text-red-200';
      case 'COMPLETED':
        return 'bg-gray-900 text-gray-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  // Filter facilities by type
  const filteredFacilities = selectedType 
    ? facilities.filter(facility => facility.type === selectedType)
    : facilities;

  // Filter bookings by status (upcoming or past)
  const upcomingBookings = myBookings.filter(booking => !isBookingPast(booking));
  const pastBookings = myBookings.filter(booking => isBookingPast(booking));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-100">Campus Facilities</h1>
        <p className="text-primary-300 mt-2">
          Book and manage facility reservations
        </p>
      </div>
      
      {/* Success or Error Messages */}
      {successMessage && (
        <div className="bg-green-900 text-green-200 p-3 rounded">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* Booking Form */}
      {showBookingForm && selectedFacility && (
        <div className="bg-primary-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-primary-100 mb-4">Book {selectedFacility.name}</h2>
          <p className="mb-4 text-primary-300">
            <span className="font-medium">Location:</span> {selectedFacility.location}
          </p>
          
          <form onSubmit={handleBookingSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-primary-200 font-medium mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-primary-200 font-medium mb-2">
                  Purpose <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="input w-full"
                  placeholder="E.g., Basketball practice, Study session"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-primary-200 font-medium mb-2">
                  Start Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-primary-200 font-medium mb-2">
                  End Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-primary-200 font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input w-full h-32"
                placeholder="Any special requirements or additional information"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingLoading}
                className="btn btn-primary"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-primary-700">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'facilities'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => setActiveTab('facilities')}
          >
            Available Facilities
          </button>
          <button
            className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-300 mx-auto"></div>
          <p className="mt-2 text-primary-300">Loading data...</p>
        </div>
      ) : activeTab === 'facilities' ? (
        <>
          {/* Facility Type Filter */}
          <div className="mb-6 bg-primary-800 p-4 rounded-lg">
            <label className="block text-primary-200 font-medium mb-2">
              Filter by Facility Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input w-full md:w-1/3"
            >
              <option value="">All Facility Types</option>
              {facilityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          {/* Facilities List */}
          {filteredFacilities.length === 0 ? (
            <div className="p-6 text-center text-primary-300 bg-primary-800 rounded-lg">
              {selectedType 
                ? `No ${selectedType.toLowerCase()} facilities found.` 
                : 'No facilities available.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-primary-800 rounded-lg overflow-hidden border border-primary-700 transition-all duration-200 hover:bg-primary-750"
                >
                  {facility.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={facility.imageUrl} 
                        alt={facility.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 text-primary-100">{facility.name}</h3>
                    
                    <div className="mb-3 text-sm text-primary-300">
                      <div className="flex items-center mb-1">
                        <FaBuilding className="mr-2" />
                        <span>Type: {facility.type}</span>
                      </div>
                      
                      <div className="flex items-center mb-1">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>Location: {facility.location}</span>
                      </div>
                      
                      {facility.capacity > 0 && (
                        <div className="flex items-center mb-1">
                          <FaUsers className="mr-2" />
                          <span>Capacity: {facility.capacity}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-primary-200 mb-4 line-clamp-3">
                      {facility.description}
                    </p>
                    
                    <div>
                      {facility.available ? (
                        <button
                          onClick={() => handleBookFacility(facility)}
                          className="btn btn-primary w-full flex items-center justify-center"
                        >
                          <FaCalendarAlt className="mr-2" />
                          Book This Facility
                        </button>
                      ) : (
                        <div className="bg-yellow-900 text-yellow-200 py-2 px-4 rounded-md text-center">
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
          {/* Bookings List */}
          <h2 className="text-xl font-semibold mb-4 text-primary-100">Upcoming Bookings</h2>
          {upcomingBookings.length === 0 ? (
            <div className="p-6 text-center text-primary-300 bg-primary-800 rounded-lg mb-8">
              You don't have any upcoming facility bookings.
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-primary-800 p-5 rounded-lg border border-primary-700">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-primary-100">{booking.facilityName}</h3>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-primary-300 flex items-center mb-2">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(booking.date)}
                      </p>
                      <p className="text-primary-300 flex items-center mb-2">
                        <FaClock className="mr-2" />
                        {formatTime(booking.startTime)} to {formatTime(booking.endTime)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-primary-300 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-2" />
                        {booking.facilityName}
                      </p>
                      <p className="text-primary-300 mb-2">
                        <span className="font-medium">Purpose:</span> {booking.purpose}
                      </p>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mb-4 p-3 bg-primary-750 rounded-md">
                      <p className="text-primary-200"><span className="font-medium">Notes:</span> {booking.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-danger flex items-center"
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <h2 className="text-xl font-semibold mb-4 text-primary-100">Past Bookings</h2>
          {pastBookings.length === 0 ? (
            <div className="p-6 text-center text-primary-300 bg-primary-800 rounded-lg">
              You don't have any past facility bookings.
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="bg-primary-750 p-5 rounded-lg border border-primary-700">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-primary-100">{booking.facilityName}</h3>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-primary-300 flex items-center mb-2">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(booking.date)}
                      </p>
                      <p className="text-primary-300 flex items-center mb-2">
                        <FaClock className="mr-2" />
                        {formatTime(booking.startTime)} to {formatTime(booking.endTime)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-primary-300 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-2" />
                        {booking.facilityName}
                      </p>
                      <p className="text-primary-300 mb-2">
                        <span className="font-medium">Purpose:</span> {booking.purpose}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentFacilityBooking; 