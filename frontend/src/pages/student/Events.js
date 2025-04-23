import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StudentEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAll();
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      setLoading(false);
      console.error('Error fetching events:', err);
    }
  };

  const handleRSVP = async (eventId, isRegistering) => {
    try {
      if (isRegistering) {
        await eventService.registerParticipant(eventId, user.id);
        setSuccessMessage('Successfully registered for the event!');
      } else {
        await eventService.removeParticipant(eventId, user.id);
        setSuccessMessage('Successfully unregistered from the event!');
      }
      
      // Update the events list
      fetchEvents();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(isRegistering ? 'Failed to register for the event.' : 'Failed to unregister from the event.');
      console.error('RSVP error:', err);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const isRegistered = (event) => {
    return event.participantIds?.includes(user.id);
  };

  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === 'upcoming') {
      return !isEventPast(event.startTime);
    } else if (activeTab === 'registered') {
      return isRegistered(event) && !isEventPast(event.startTime);
    } else if (activeTab === 'past') {
      return isEventPast(event.startTime);
    }
    return true;
  });

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

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const getEventStatusClass = (event) => {
    if (isEventPast(event.startTime)) {
      return 'bg-gray-200 text-gray-700';
    }
    if (isRegistered(event)) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (event.maxParticipants && event.participantIds?.length >= event.maxParticipants) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    return 'bg-white border-gray-200';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Campus Events</h1>
      
      {/* Success or Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'registered' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('registered')}
        >
          My Registrations
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No events found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className={`border rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${getEventStatusClass(event)}`}
            >
              {event.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                
                <div className="mb-3 text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <FaCalendarAlt className="mr-2" />
                    <span>{formatDate(event.startTime)}</span>
                  </div>
                  
                  <div className="flex items-center mb-1">
                    <FaClock className="mr-2" />
                    <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                  </div>
                  
                  <div className="flex items-center mb-1">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{event.location}</span>
                  </div>
                  
                  {event.maxParticipants && (
                    <div className="flex items-center mb-1">
                      <FaUsers className="mr-2" />
                      <span>
                        {event.participantIds?.length || 0}/{event.maxParticipants} registered
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {event.description}
                </p>
                
                <div>
                  {isEventPast(event.startTime) ? (
                    <div className="text-gray-500 italic text-sm">
                      This event has already taken place
                    </div>
                  ) : isRegistered(event) ? (
                    <button
                      onClick={() => handleRSVP(event.id, false)}
                      className="flex items-center justify-center w-full py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancel Registration
                    </button>
                  ) : event.maxParticipants && event.participantIds?.length >= event.maxParticipants ? (
                    <div className="text-yellow-600 bg-yellow-50 py-2 px-4 rounded-md text-center">
                      Event is full
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRSVP(event.id, true)}
                      className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaCheckCircle className="mr-2" />
                      Register for Event
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentEvents; 