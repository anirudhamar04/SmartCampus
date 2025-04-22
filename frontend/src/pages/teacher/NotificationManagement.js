import React, { useState, useEffect, useCallback } from 'react';
import { notificationService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const NotificationManagement = () => {
  const { currentUser } = useAuth();
  const { fetchNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientType: 'STUDENT',
    recipients: [], // Array of user IDs
    priority: 'NORMAL',
    type: 'ACADEMIC'
  });
  const [students, setStudents] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('sent');

  // Constants for dropdown options
  const priorityOptions = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
  const typeOptions = ['ACADEMIC', 'ADMINISTRATIVE', 'EVENT', 'ANNOUNCEMENT', 'OTHER'];

  const fetchAllNotifications = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'sent') {
        // This endpoint would need to be implemented in the backend
        response = await notificationService.getAll();
        // Filter for notifications created by the current user
        const sentNotifications = response.data.filter(
          notification => notification.createdById === currentUser.id
        );
        setNotifications(sentNotifications);
      } else {
        response = await notificationService.getByUser(currentUser.id);
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentUser.id]);

  useEffect(() => {
    fetchAllNotifications();
    fetchStudents();
  }, [activeTab, fetchAllNotifications]);

  const fetchStudents = async () => {
    try {
      const response = await userService.getByRole('STUDENT');
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to fetch students. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRecipientChange = (e) => {
    const options = e.target.options;
    const selectedRecipients = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedRecipients.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      recipients: selectedRecipients
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim() || formData.recipients.length === 0) {
      setError('Please fill all required fields and select at least one recipient.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Send notification to each recipient
      const promises = formData.recipients.map(recipientId => 
        notificationService.create({
          title: formData.title,
          message: formData.message,
          recipientId: recipientId,
          type: formData.type,
          priority: formData.priority,
          // Add action URL if needed
          actionUrl: formData.actionUrl || null
        })
      );
      
      await Promise.all(promises);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        recipientType: 'STUDENT',
        recipients: [],
        priority: 'NORMAL',
        type: 'ACADEMIC',
        actionUrl: ''
      });
      
      setShowForm(false);
      
      // Refresh notifications
      fetchAllNotifications();
      // Also refresh the global notifications
      fetchNotifications();
      
      // Show success message
      alert('Notifications sent successfully!');
    } catch (err) {
      console.error('Failed to send notification:', err);
      setError('Failed to send notification. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.delete(id);
      
      // Update the notifications list
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      
      // If the deleted notification was selected, clear the selection
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      
      // Refresh global notifications
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError('Failed to delete notification. Please try again.');
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'bg-red-900 text-red-200';
      case 'NORMAL':
        return 'bg-green-900 text-green-200';
      case 'LOW':
        return 'bg-blue-900 text-blue-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-100">Notification Management</h1>
          <p className="text-primary-300 mt-2">
            Create and manage notifications for students
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Create Notification'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            className="text-red-200 hover:text-white" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-primary-700 mb-4">
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 border-b-2 font-medium ${
              activeTab === 'sent'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-200'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Notifications
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium ${
              activeTab === 'received'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-200'
            }`}
            onClick={() => setActiveTab('received')}
          >
            Received Notifications
          </button>
        </div>
      </div>

      {/* Create notification form */}
      {showForm && (
        <div className="bg-primary-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-primary-100 mb-4">Create New Notification</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Notification title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">Action URL (Optional)</label>
                  <input
                    type="text"
                    name="actionUrl"
                    value={formData.actionUrl || ''}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="/teacher/resources"
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    Relative URL where recipients will be directed when clicking the notification.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Recipients <span className="text-red-500">*</span>
                  </label>
                  <select
                    multiple
                    name="recipients"
                    value={formData.recipients}
                    onChange={handleRecipientChange}
                    className="input w-full h-40"
                    required
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} ({student.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-primary-400 mt-1">
                    Hold Ctrl (or Cmd) to select multiple students.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="input w-full h-32"
                    placeholder="Notification message"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-primary-800 rounded-lg shadow">
        <div className="p-4 border-b border-primary-700">
          <h2 className="text-xl font-semibold text-primary-100">
            {activeTab === 'sent' ? 'Sent Notifications' : 'Received Notifications'}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-primary-300">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-primary-300">
            No notifications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-700">
                <tr>
                  <th className="px-4 py-3 text-left text-primary-300">Title</th>
                  <th className="px-4 py-3 text-left text-primary-300">
                    {activeTab === 'sent' ? 'Recipient' : 'From'}
                  </th>
                  <th className="px-4 py-3 text-left text-primary-300">Type</th>
                  <th className="px-4 py-3 text-left text-primary-300">Priority</th>
                  <th className="px-4 py-3 text-left text-primary-300">Date</th>
                  <th className="px-4 py-3 text-left text-primary-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {notifications.map(notification => (
                  <tr key={notification.id} className="hover:bg-primary-700/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-primary-200">{notification.title}</div>
                      <div className="text-sm text-primary-400 truncate max-w-xs">
                        {notification.message}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-primary-300">
                      {activeTab === 'sent' 
                        ? notification.recipientName 
                        : notification.senderName || 'System'}
                    </td>
                    <td className="px-4 py-3 text-primary-300">
                      {notification.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityBadgeClass(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary-300 whitespace-nowrap">
                      {formatDateTime(notification.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedNotification(notification)}
                        className="text-primary-400 hover:text-primary-200 mr-2"
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {activeTab === 'sent' && (
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-primary-100">{selectedNotification.title}</h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-primary-400 hover:text-primary-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-primary-400 text-sm">
                  {activeTab === 'sent' ? 'Recipient' : 'From'}:
                </p>
                <p className="text-primary-200">
                  {activeTab === 'sent' 
                    ? selectedNotification.recipientName 
                    : selectedNotification.senderName || 'System'}
                </p>
              </div>
              <div>
                <p className="text-primary-400 text-sm">Date:</p>
                <p className="text-primary-200">
                  {formatDateTime(selectedNotification.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-primary-400 text-sm">Type:</p>
                <p className="text-primary-200">{selectedNotification.type}</p>
              </div>
              <div>
                <p className="text-primary-400 text-sm">Priority:</p>
                <p className="text-primary-200">
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityBadgeClass(selectedNotification.priority)}`}>
                    {selectedNotification.priority}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-primary-400 text-sm">Message:</p>
              <div className="bg-primary-900 p-4 rounded mt-1 text-primary-200 whitespace-pre-wrap">
                {selectedNotification.message}
              </div>
            </div>
            
            {selectedNotification.actionUrl && (
              <div className="mb-4">
                <p className="text-primary-400 text-sm">Action URL:</p>
                <a 
                  href={selectedNotification.actionUrl} 
                  className="text-blue-400 hover:text-blue-300"
                >
                  {selectedNotification.actionUrl}
                </a>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedNotification(null)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement; 