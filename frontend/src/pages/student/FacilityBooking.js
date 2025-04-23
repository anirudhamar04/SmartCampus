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

  // Filter facilities by type
  const filteredFacilities = selectedType 
    ? facilities.filter(facility => facility.type === selectedType)
    : facilities;

  // Filter bookings by status (upcoming or past)
  const upcomingBookings = myBookings.filter(booking => !isBookingPast(booking));
  const pastBookings = myBookings.filter(booking => isBookingPast(booking));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-zinc-800">Campus Facilities</h1>
      
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

      {/* Booking Form */}
      {showBookingForm && selectedFacility && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Book {selectedFacility.name}</h2>
          <p className="mb-4 text-zinc-600">
            <span className="font-medium">Location:</span> {selectedFacility.location}
          </p>
          
          <form onSubmit={handleBookingSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  placeholder="E.g., Basketball practice, Study session"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-zinc-700 font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 min-h-[80px]"
                placeholder="Any special requirements or additional information"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingLoading}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'facilities' ? 'text-black border-b-2 border-black' : 'text-zinc-500'}`}
          onClick={() => setActiveTab('facilities')}
        >
          Available Facilities
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'bookings' ? 'text-black border-b-2 border-black' : 'text-zinc-500'}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-zinc-600">Loading data...</p>
        </div>
      ) : activeTab === 'facilities' ? (
        <>
          {/* Facility Type Filter */}
          <div className="mb-6">
            <label className="block text-zinc-700 font-medium mb-2">
              Filter by Facility Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full md:w-1/3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="">All Facility Types</option>
              {facilityTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          
          {/* Facilities List */}
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 rounded-lg">
              <p className="text-zinc-500">
                {selectedType 
                  ? `No ${selectedType.toLowerCase()} facilities found.` 
                  : 'No facilities available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-zinc-200 transition-all duration-200 hover:shadow-md"
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
                    <h3 className="text-xl font-semibold mb-2">{facility.name}</h3>
                    
                    <div className="mb-3 text-sm text-zinc-600">
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
                    
                    <p className="text-zinc-700 mb-4 line-clamp-3">
                      {facility.description}
                    </p>
                    
                    <div>
                      {facility.available ? (
                        <button
                          onClick={() => handleBookFacility(facility)}
                          className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-center"
                        >
                          <FaCalendarAlt className="mr-2" />
                          Book This Facility
                        </button>
                      ) : (
                        <div className="text-yellow-600 bg-yellow-50 py-2 px-4 rounded-md text-center">
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
          <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 rounded-lg mb-8">
              <p className="text-zinc-500">You don't have any upcoming facility bookings.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{booking.facilityName}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(booking.date)}
                      </p>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaClock className="mr-2" />
                        {booking.startTime} to {booking.endTime}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-2" />
                        {booking.facilityName}
                      </p>
                      <p className="text-zinc-600 mb-2">
                        <span className="font-medium">Purpose:</span> {booking.purpose}
                      </p>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mb-4 p-3 bg-zinc-50 rounded-md">
                      <p className="text-zinc-700"><span className="font-medium">Notes:</span> {booking.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center"
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <h2 className="text-xl font-semibold mb-4">Past Bookings</h2>
          {pastBookings.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 rounded-lg">
              <p className="text-zinc-500">You don't have any past facility bookings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="bg-zinc-50 p-5 rounded-lg shadow-sm border border-zinc-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{booking.facilityName}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800">
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(booking.date)}
                      </p>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaClock className="mr-2" />
                        {booking.startTime} to {booking.endTime}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-zinc-600 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-2" />
                        {booking.facilityName}
                      </p>
                      <p className="text-zinc-600 mb-2">
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