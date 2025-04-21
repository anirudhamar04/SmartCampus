import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        // Check if token is expired
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Set auth headers for all axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Fetch current user details
            try {
              const response = await authService.getCurrentUser();
              setCurrentUser(response.data);
              setUserRole(response.data.role);
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Failed to fetch user details:', error);
              logout();
            }
          }
        } catch (error) {
          console.error('Invalid token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      
      // Get user details right after login
      let userResponse = null;
      try {
        userResponse = await authService.getCurrentUser();
        setCurrentUser(userResponse.data);
        setUserRole(userResponse.data.role);
      } catch (error) {
        console.error('Failed to fetch user details after login:', error);
      }
      
      return { success: true, role: userResponse?.data?.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const isFaculty = () => {
    return userRole === 'FACULTY';
  };

  const isAdmin = () => {
    return userRole === 'ADMIN';
  };

  const isStudent = () => {
    return userRole === 'STUDENT';
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    userRole,
    isFaculty,
    isAdmin,
    isStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 