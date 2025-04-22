import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';
import { authHeader } from './auth-header';

const courseService = {
  // Get all courses
  getAll: () => {
    return axios.get(`${API_BASE_URL}/api/courses`, {
      headers: authHeader()
    });
  },
  
  // Get a specific course
  getById: (courseId) => {
    return axios.get(`${API_BASE_URL}/api/courses/${courseId}`, {
      headers: authHeader()
    });
  },
  
  // Get courses by teacher
  getByTeacher: () => {
    return axios.get(`${API_BASE_URL}/api/courses/teacher`, {
      headers: authHeader()
    });
  },
  
  // Get courses a student is enrolled in
  getEnrolledCourses: () => {
    return axios.get(`${API_BASE_URL}/api/courses/enrolled`, {
      headers: authHeader()
    });
  },
  
  // Create a new course
  create: (courseData) => {
    return axios.post(`${API_BASE_URL}/api/courses`, courseData, {
      headers: authHeader()
    });
  },
  
  // Update a course
  update: (courseId, courseData) => {
    return axios.put(`${API_BASE_URL}/api/courses/${courseId}`, courseData, {
      headers: authHeader()
    });
  },
  
  // Delete a course
  delete: (courseId) => {
    return axios.delete(`${API_BASE_URL}/api/courses/${courseId}`, {
      headers: authHeader()
    });
  },
  
  // Enroll in a course
  enroll: (courseCode) => {
    return axios.post(`${API_BASE_URL}/api/courses/enroll`, { courseCode }, {
      headers: authHeader()
    });
  },
  
  // Unenroll from a course
  unenroll: (courseId) => {
    return axios.post(`${API_BASE_URL}/api/courses/${courseId}/unenroll`, {}, {
      headers: authHeader()
    });
  }
};

export default courseService; 