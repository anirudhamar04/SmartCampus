import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';
import { authHeader } from './auth-header';

const resourceService = {
  // Get all resources for a course
  getByCourse: (courseId) => {
    return axios.get(`${API_BASE_URL}/api/resources/course/${courseId}`, { 
      headers: authHeader() 
    });
  },
  
  // Get resources by type for a course
  getByType: (courseId, resourceType) => {
    return axios.get(`${API_BASE_URL}/api/resources/course/${courseId}/type/${resourceType}`, { 
      headers: authHeader() 
    });
  },
  
  // Get all resource types
  getResourceTypes: () => {
    return axios.get(`${API_BASE_URL}/api/resources/types`, { 
      headers: authHeader() 
    });
  },
  
  // Upload a new resource
  upload: (courseId, formData) => {
    return axios.post(`${API_BASE_URL}/api/resources/${courseId}/upload`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Download a resource
  download: (resourceId) => {
    return axios.get(`${API_BASE_URL}/api/resources/download/${resourceId}`, {
      headers: authHeader(),
      responseType: 'blob'
    });
  },
  
  // Delete a resource
  delete: (resourceId) => {
    return axios.delete(`${API_BASE_URL}/api/resources/${resourceId}`, {
      headers: authHeader()
    });
  },
  
  // Update resource metadata
  update: (resourceId, resourceData) => {
    return axios.put(`${API_BASE_URL}/api/resources/${resourceId}`, resourceData, {
      headers: authHeader()
    });
  }
};

export default resourceService; 