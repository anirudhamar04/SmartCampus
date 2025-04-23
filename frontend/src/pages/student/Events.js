import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StudentEvents = () => {
  const { currentUser } = useAuth();
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
      if (!currentUser || !currentUser.id) {
        setError('You must be logged in to register for events.');
        return;
      }
      
      if (isRegistering) {
        await eventService.registerParticipant(eventId, currentUser.id);
        setSuccessMessage('Successfully registered for the event!');
      } else {
        await eventService.removeParticipant(eventId, currentUser.id);
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
    if (!currentUser || !currentUser.id || !event.participantIds) {
      return false;
    }
    return event.participantIds.includes(currentUser.id);
  };

  const isEventPast = (eventDate) => {
    if (!eventDate) return false;
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
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
    if (isRegistered(event)) {
      return 'bg-zinc-900 text-zinc-100 border-zinc-700 border-l-4 border-l-green-500';
    }
    if (event.maxParticipants && event.participantIds && event.participantIds.length >= event.maxParticipants) {
      return 'bg-zinc-900 text-zinc-100 border-zinc-700 border-l-4 border-l-yellow-500';
    }
    return 'bg-zinc-900 text-zinc-100 border-zinc-700';
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="bg-zinc-900 p-6 rounded-lg mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-white">Campus Events</h1>
        <p className="text-zinc-400">Discover and register for upcoming events on campus</p>
      </div>
      
      {/* Success or Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-900 text-green-100 rounded-md border border-green-700">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md border border-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-6">
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'upcoming' ? 'text-white border-b-2 border-zinc-300' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events
        </button>
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'registered' ? 'text-white border-b-2 border-zinc-300' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => setActiveTab('registered')}
        >
          My Registrations
        </button>
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'past' ? 'text-white border-b-2 border-zinc-300' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-zinc-400">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-10 bg-zinc-800 rounded-lg">
          <p className="text-zinc-400">No events found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className={`border rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${getEventStatusClass(event)}`}
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
              
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                
                <div className="mb-4 text-sm text-zinc-300">
                  <div className="flex items-center mb-2">
                    <FaCalendarAlt className="mr-2 text-zinc-400" />
                    <span>{formatDate(event.startTime)}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <FaClock className="mr-2 text-zinc-400" />
                    <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <FaMapMarkerAlt className="mr-2 text-zinc-400" />
                    <span>{event.location}</span>
                  </div>
                  
                  {event.maxParticipants && (
                    <div className="flex items-center mb-2">
                      <FaUsers className="mr-2 text-zinc-400" />
                      <span>
                        {event.participantIds?.length || 0}/{event.maxParticipants} registered
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-zinc-400 mb-4 line-clamp-3">
                  {event.description}
                </p>
                
                <div className="pt-2 border-t border-zinc-700">
                  {isEventPast(event.startTime) ? (
                    <div className="text-zinc-500 italic text-sm mt-2">
                      This event has already taken place
                    </div>
                  ) : isRegistered(event) ? (
                    <button
                      onClick={() => handleRSVP(event.id, false)}
                      className="flex items-center justify-center w-full py-2 px-4 border border-red-700 text-red-400 rounded-md hover:bg-red-900 hover:text-red-200 transition-colors"
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancel Registration
                    </button>
                  ) : event.maxParticipants && event.participantIds && event.participantIds.length >= event.maxParticipants ? (
                    <div className="text-yellow-500 bg-yellow-900 bg-opacity-30 py-2 px-4 rounded-md text-center">
                      Event is full
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRSVP(event.id, true)}
                      className="flex items-center justify-center w-full py-2 px-4 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 transition-colors"
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