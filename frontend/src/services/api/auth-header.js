export function authHeader() {
  // Get the token from local storage
  const token = localStorage.getItem('token');
  
  // If token exists, return authorization header, otherwise empty object
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  } else {
    return {};
  }
} 