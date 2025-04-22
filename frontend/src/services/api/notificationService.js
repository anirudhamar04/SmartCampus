import axios from '../axios';

const notificationService = {
  // Get all notifications (admin access)
  getAll: () => {
    return axios.get('/api/notifications');
  },

  // Get notifications for specific user
  getByUser: (userId) => {
    return axios.get(`/api/notifications/user/${userId}`);
  },

  // Get notifications sent by a specific user
  getSentByUser: (userId) => {
    return axios.get(`/api/notifications/sent/${userId}`);
  },

  // Get unread notifications count
  getUnreadCount: (userId) => {
    return axios.get(`/api/notifications/user/${userId}/unread/count`);
  },

  // Get a single notification by ID
  getById: (id) => {
    return axios.get(`/api/notifications/${id}`);
  },

  // Create a new notification
  create: (notification) => {
    return axios.post('/api/notifications', notification);
  },

  // Mark a notification as read
  markAsRead: (id) => {
    return axios.put(`/api/notifications/${id}/read`);
  },

  // Mark all notifications as read for a user
  markAllAsRead: (userId) => {
    return axios.put(`/api/notifications/user/${userId}/read-all`);
  },

  // Update a notification
  update: (id, notification) => {
    return axios.put(`/api/notifications/${id}`, notification);
  },

  // Delete a notification
  delete: (id) => {
    return axios.delete(`/api/notifications/${id}`);
  },

  // Broadcast notification to multiple users by role
  broadcastByRole: (notification) => {
    return axios.post('/api/notifications/broadcast/role', notification);
  },

  // Get notification statistics (admin)
  getStats: () => {
    return axios.get('/api/notifications/stats');
  }
};

export default notificationService; 