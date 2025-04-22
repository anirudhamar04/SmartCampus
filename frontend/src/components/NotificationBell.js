import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // If there's an action URL, navigate to it
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-1 rounded-full text-primary-300 hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={toggleDropdown}
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-primary-800 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-primary-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-primary-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-primary-400">
              No new notifications
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b border-primary-700 hover:bg-primary-700 cursor-pointer ${
                    !notification.read ? 'bg-primary-700/50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-primary-200">{notification.title}</p>
                      <p className="text-sm text-primary-400 line-clamp-2">{notification.message}</p>
                      {notification.senderName && (
                        <p className="text-xs text-primary-500">
                          From: {notification.senderName}
                        </p>
                      )}
                      <p className="text-xs text-primary-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {notification.priority && (
                        <span
                          className={`text-xs px-2 py-1 rounded ml-2 ${
                            notification.priority === 'HIGH' || notification.priority === 'URGENT'
                              ? 'bg-red-900 text-red-200'
                              : notification.priority === 'NORMAL'
                              ? 'bg-yellow-900 text-yellow-200'
                              : 'bg-blue-900 text-blue-200'
                          }`}
                        >
                          {notification.priority}
                        </span>
                      )}
                      {notification.type && (
                        <span className="text-xs text-primary-400">
                          {notification.type}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          <div className="p-2 border-t border-primary-700 text-center">
            <button
              onClick={() => navigate('/notifications')}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 