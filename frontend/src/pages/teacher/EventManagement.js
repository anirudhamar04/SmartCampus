import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EventManagement = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    category: 'ACADEMIC',
    status: 'SCHEDULED'
  });

  // Constants for dropdown options
  const categoryOptions = ['ACADEMIC', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'OTHER'];
  const statusOptions = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAll();
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to fetch events. Please try again later.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format dates in the exact format required by the API: "2025-04-20T00:00:00"
      const formatStartDate = (dateStr) => {
        if (!dateStr) return null;
        // Set time to 00:00:00 for start date
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        
        // Format as YYYY-MM-DDT00:00:00 without timezone or milliseconds
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00`;
      };
      
      const formatEndDate = (dateStr) => {
        if (!dateStr) return null;
        // Set time to 23:59:59 for end date
        const date = new Date(dateStr);
        date.setHours(23, 59, 59, 0);
        
        // Format as YYYY-MM-DDT23:59:59 without timezone or milliseconds
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T23:59:59`;
      };
      
      const startDateTime = formatStartDate(formData.startDate);
      const endDateTime = formatEndDate(formData.endDate);
      
      // Map frontend fields to backend expected fields
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        status: formData.status,
        startTime: startDateTime,
        endTime: endDateTime,
        eventType: formData.category,
        organizerId: currentUser.id
      };
      
      console.log('Sending event data:', JSON.stringify(eventData, null, 2));
      
      if (editMode && selectedEvent) {
        console.log(`Updating event ${selectedEvent.id} with formatted dates:`, 
                   `startTime=${eventData.startTime}, endTime=${eventData.endTime}`);
        await eventService.update(selectedEvent.id, eventData);
      } else {
        console.log(`Creating new event with formatted dates:`, 
                   `startTime=${eventData.startTime}, endTime=${eventData.endTime}`);
        await eventService.create(eventData);
      }
      
      // Reset form
      resetForm();
      
      // Refresh events
      fetchEvents();
    } catch (err) {
      console.error('Failed to save event:', err);
      setError(`Failed to ${editMode ? 'update' : 'create'} event. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      setLoading(true);
      await eventService.delete(eventId);
      
      // Clear selected event if it's the one being deleted
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
      
      // Refresh events
      fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('Failed to delete event. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    // Map event data to form fields, handling both naming conventions
    const startDate = event.startTime || event.startDate;
    const endDate = event.endTime || event.endDate;
    
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
      category: event.eventType || event.category,
      status: event.status
    });
    
    setSelectedEvent(event);
    setEditMode(true);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      category: 'ACADEMIC',
      status: 'SCHEDULED'
    });
    
    setSelectedEvent(null);
    setEditMode(false);
    setShowForm(false);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'ACADEMIC':
        return 'bg-blue-900 text-blue-200';
      case 'CULTURAL':
        return 'bg-purple-900 text-purple-200';
      case 'SPORTS':
        return 'bg-green-900 text-green-200';
      case 'WORKSHOP':
        return 'bg-yellow-900 text-yellow-200';
      case 'SEMINAR':
        return 'bg-indigo-900 text-indigo-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-900 text-blue-200';
      case 'ONGOING':
        return 'bg-green-900 text-green-200';
      case 'COMPLETED':
        return 'bg-gray-900 text-gray-200';
      case 'CANCELLED':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-100">Event Management</h1>
          <p className="text-primary-300 mt-2">
            Create and manage school events
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editMode) {
              resetForm();
            } else {
              setShowForm(!showForm);
              setEditMode(false);
              setSelectedEvent(null);
              setFormData({
                title: '',
                description: '',
                location: '',
                startDate: '',
                endDate: '',
                category: 'ACADEMIC',
                status: 'SCHEDULED'
              });
            }
          }}
          className="btn btn-primary"
        >
          {showForm && !editMode ? 'Cancel' : 'Create Event'}
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

      {/* Create/Edit event form */}
      {showForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">
            {editMode ? 'Edit Event' : 'Create New Event'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Event title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Event location"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input w-full h-32"
                  placeholder="Event description..."
                  required
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
                {loading ? 'Saving...' : editMode ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events list */}
      <div className="bg-primary-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-primary-700">
          <h2 className="text-lg font-semibold text-primary-100">Events</h2>
        </div>
        
        {loading && events.length === 0 ? (
          <div className="p-6 text-center text-primary-300">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-6 text-center text-primary-300">No events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-primary-750">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-200">{event.title}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeClass(event.eventType || event.category)}`}>
                        {event.eventType || event.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{event.location}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{formatDateTime(event.startTime || event.startDate)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{formatDateTime(event.endTime || event.endDate)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-primary-300 hover:text-primary-100 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event details modal could be added here if needed */}
    </div>
  );
};

export default EventManagement;