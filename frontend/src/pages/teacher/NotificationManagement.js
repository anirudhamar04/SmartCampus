import React, { useState, useEffect } from 'react';
import { notificationService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationManagement = () => {
  const { currentUser } = useAuth();
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
    category: 'ACADEMIC'
  });
  const [students, setStudents] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('sent');

  // Constants for dropdown options
  const priorityOptions = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
  const categoryOptions = ['ACADEMIC', 'ADMINISTRATIVE', 'EVENT', 'ANNOUNCEMENT', 'OTHER'];

  useEffect(() => {
    fetchNotifications();
    fetchStudents();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'sent') {
        response = await notificationService.getAllSentByUser(currentUser.id);
      } else {
        response = await notificationService.getAllForUser(currentUser.id);
      }
      
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await userService.getAllStudents();
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
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
          senderId: currentUser.id,
          recipientId: recipientId,
          priority: formData.priority,
          category: formData.category
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
        category: 'ACADEMIC'
      });
      
      setShowForm(false);
      
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error('Failed to send notification:', err);
      setError('Failed to send notification. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update notification in state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update selected notification if it's the one being marked
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(prev => ({ ...prev, read: true }));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Failed to mark notification as read.');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.delete(notificationId);
      
      // Remove notification from state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // Clear selected notification if it's the one being deleted
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError('Failed to delete notification.');
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-blue-900 text-blue-200';
      case 'NORMAL':
        return 'bg-green-900 text-green-200';
      case 'HIGH':
        return 'bg-yellow-900 text-yellow-200';
      case 'URGENT':
        return 'bg-red-900 text-red-200';
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
            Send and manage notifications to students
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

      {/* Create notification form */}
      {showForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Create New Notification</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="input w-full h-24"
                    required
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-primary-400 mt-1">
                    Hold Ctrl/Cmd to select multiple recipients
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="input w-full h-32"
                  placeholder="Type your message here..."
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
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

      {/* Tabs */}
      <div className="border-b border-primary-700">
        <div className="flex -mb-px">
          <button
            className={`mr-4 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Notifications
          </button>
          <button
            className={`mr-4 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'received'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => setActiveTab('received')}
          >
            Received Notifications
          </button>
        </div>
      </div>

      {/* Notifications list with detail view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications list */}
        <div className="lg:col-span-1 bg-primary-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-primary-700">
            <h2 className="text-lg font-semibold text-primary-100">
              {activeTab === 'sent' ? 'Sent Notifications' : 'Received Notifications'}
            </h2>
          </div>
          
          {loading && notifications.length === 0 ? (
            <div className="p-6 text-center text-primary-300">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-primary-300">No notifications found.</div>
          ) : (
            <div className="overflow-y-auto max-h-[600px]">
              <ul className="divide-y divide-primary-700">
                {notifications.map(notification => (
                  <li 
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-primary-700 ${
                      selectedNotification?.id === notification.id ? 'bg-primary-700' : ''
                    } ${!notification.read && activeTab === 'received' ? 'bg-primary-750' : ''}`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className={`font-medium truncate flex-1 ${
                        !notification.read && activeTab === 'received' ? 'text-primary-100' : 'text-primary-200'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-primary-400 text-sm truncate">
                      {activeTab === 'sent' 
                        ? `To: ${notification.recipientName || 'Unknown'}`
                        : `From: ${notification.senderName || 'Unknown'}`
                      }
                    </p>
                    <p className="text-primary-400 text-sm">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Notification details */}
        <div className="lg:col-span-2 bg-primary-800 rounded-lg overflow-hidden">
          {!selectedNotification ? (
            <div className="p-6 text-center text-primary-300">
              Select a notification to view details
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-primary-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-primary-100">{selectedNotification.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(selectedNotification.priority)}`}>
                    {selectedNotification.priority}
                  </span>
                </div>
                <div className="mt-2 text-sm text-primary-400">
                  <span>
                    {activeTab === 'sent' 
                      ? `To: ${selectedNotification.recipientName || 'Unknown'}`
                      : `From: ${selectedNotification.senderName || 'Unknown'}`
                    } | 
                  </span>
                  <span> Category: {selectedNotification.category} | </span>
                  <span> Sent: {formatDateTime(selectedNotification.createdAt)}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-md font-medium text-primary-200 mb-2">Message</h3>
                <p className="text-primary-300 whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>
              
              <div className="p-4 border-t border-primary-700 flex justify-end space-x-2">
                {activeTab === 'received' && !selectedNotification.read && (
                  <button
                    onClick={() => markAsRead(selectedNotification.id)}
                    className="btn btn-secondary text-sm"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(selectedNotification.id)}
                  className="btn btn-danger text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement; 