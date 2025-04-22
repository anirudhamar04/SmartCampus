// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Authentication constants
export const TOKEN_KEY = 'token';
export const USER_KEY = 'currentUser';

// User roles
export const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT'
};

// Resource types
export const RESOURCE_TYPES = [
  'DOCUMENT',
  'PRESENTATION',
  'VIDEO',
  'AUDIO',
  'IMAGE',
  'LINK',
  'OTHER'
]; 