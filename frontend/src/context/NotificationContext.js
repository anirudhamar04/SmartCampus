import React, { createContext, useState, useContext, useEffect } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications on user change or when marked as read
  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
      
      // Set up interval to poll for new notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const response = await notificationService.getUnread(currentUser.id);
      setNotifications(response.data);
      setUnreadCount(response.data.length);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications');
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser?.id) return;
    
    try {
      await notificationService.markAllAsRead(currentUser.id);
      // Update all notifications in state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 