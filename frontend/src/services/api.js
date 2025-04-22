import axios from 'axios';

// Base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request data for debugging
    if (config.method === 'post' || config.method === 'put') {
      console.log(`API ${config.method.toUpperCase()} request to ${config.url}:`, config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User services
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`)
};

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me')
};

// Course services
export const courseService = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getStudentsByCourse: (courseId) => api.get(`/courses/${courseId}/students`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  enrollStudent: (courseId, studentId) => api.post(`/courses/${courseId}/students/${studentId}`),
  unenrollStudent: (courseId, studentId) => api.delete(`/courses/${courseId}/students/${studentId}`),
  getCoursesByStudent: (studentId) => api.get(`/courses/student/${studentId}`)
};

// Attendance services
export const attendanceService = {
  getAll: () => api.get('/attendance'),
  getById: (id) => api.get(`/attendance/${id}`),
  getByUser: (userId) => api.get(`/attendance/user/${userId}`),
  getByDateRange: (start, end) => api.get(`/attendance/date-range?start=${start}&end=${end}`),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data)
};

// Feedback services
export const feedbackService = {
  getAll: () => api.get('/feedback'),
  getById: (id) => api.get(`/feedback/${id}`),
  getByUser: (userId) => api.get(`/feedback/user/${userId}`),
  getByStatus: (status) => api.get(`/feedback/status/${status}`),
  getByCategory: (category) => api.get(`/feedback/category/${category}`),
  create: (data) => api.post('/feedback', data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  respond: (id, response, responderId) => 
    api.post(`/feedback/${id}/respond?response=${encodeURIComponent(response)}&responderId=${responderId}`),
  updateStatus: (id, status, response, respondedById) => 
    api.put(`/feedback/${id}/status?status=${status}${response ? `&response=${encodeURIComponent(response)}` : ''}${respondedById ? `&respondedById=${respondedById}` : ''}`)
};

// Notification services
export const notificationService = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  getUnread: (userId) => api.get(`/notifications/user/${userId}/unread`),
  create: (data) => api.post('/notifications', data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`)
};

// Event services
export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  getUpcoming: () => api.get('/events/upcoming'),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  registerParticipant: (eventId, userId) => api.post(`/events/${eventId}/participants/${userId}`),
  removeParticipant: (eventId, userId) => api.delete(`/events/${eventId}/participants/${userId}`),
  getParticipants: (eventId) => api.get(`/events/${eventId}/participants`)
};

// Resource services
export const resourceService = {
  getAll: () => api.get('/course-resources/all'),
  getById: (id) => api.get(`/course-resources/${id}`),
  getByCourse: (courseId) => api.get(`/course-resources/course/${courseId}`),
  getByTeacher: (teacherId) => api.get(`/course-resources/teacher/${teacherId}`),
  getResourceTypes: () => api.get('/course-resources/resource-types'),
  create: (data) => api.post('/course-resources', data),
  update: (id, data) => api.put(`/course-resources/${id}`, data),
  delete: (id) => api.delete(`/course-resources/${id}`),
  download: (id) => api.get(`/course-resources/download/${id}`, { responseType: 'blob' }),
  getByType: (courseId, resourceType) => api.get(`/course-resources/course/${courseId}/type/${resourceType}`),
  getTeacherCourses: (teacherId) => api.get(`/course-resources/teacher/${teacherId}/courses`)
};

// Facility services
export const facilityService = {
  getAll: () => api.get('/facilities'),
  getById: (id) => api.get(`/facilities/${id}`),
  getByType: (type) => api.get(`/facilities/type/${type}`),
  getAvailable: () => api.get('/facilities/available'),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  book: (facilityId, data) => api.post(`/facilities/${facilityId}/bookings`, data),
  getBookings: (facilityId) => api.get(`/facilities/${facilityId}/bookings`),
  cancelBooking: (bookingId) => api.delete(`/facilities/bookings/${bookingId}`)
};

// Cafeteria services
export const cafeteriaService = {
  getAllItems: () => api.get('/cafeteria/items'),
  getItemById: (id) => api.get(`/cafeteria/items/${id}`),
  getItemsByCategory: (category) => api.get(`/cafeteria/items/category/${category}`),
  createOrder: (data) => api.post('/cafeteria/orders', data),
  getOrdersByUser: (userId) => api.get(`/cafeteria/orders/user/${userId}`),
  getOrderById: (id) => api.get(`/cafeteria/orders/${id}`),
  getOrdersByStatus: (status) => api.get(`/cafeteria/orders/status/${status}`),
  updateOrderStatus: (id, status) => api.put(`/cafeteria/orders/${id}/status?status=${status}`)
};

export default api; 