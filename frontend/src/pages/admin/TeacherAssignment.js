import React, { useState, useEffect } from 'react';
import { courseService, userService } from '../../services/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TeacherAssignment = () => {
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Set up axios interceptor to ensure auth headers are always included
  useEffect(() => {
    // Set up a direct API check to confirm admin rights and fix permissions
    const checkAdminPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set default auth headers for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error setting default headers:', error);
      }
    };
    
    checkAdminPermissions();
    
    // Configure axios to always include auth token
    const interceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token'); // Use token from localStorage
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    
    // Clean up interceptor on component unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    console.log('Auth context:', auth); // Debug what's available in the auth context
    if (currentUser) {
      // Check if the user has admin privileges
      if (currentUser.role === 'ADMIN') {
        console.log('User has ADMIN role, proceeding with data fetch');
        fetchCoursesAndTeachers();
      } else {
        setError('Access denied. Only administrators can access this page.');
        setLoading(false);
      }
    } else {
      setError('Authentication required. Please log in.');
      setLoading(false);
    }
  }, [currentUser, retryCount]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignedTeachers(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (teachers.length > 0 && assignedTeachers.length >= 0) {
      console.log('Updating available teachers', { 
        teachers: teachers.length, 
        assignedTeachers: assignedTeachers.length,
        teachersList: teachers,
        assignedTeachersList: assignedTeachers
      });
      updateAvailableTeachers();
    } else {
      console.log('Not updating available teachers', { 
        teachersLength: teachers.length, 
        assignedTeachersLength: assignedTeachers.length 
      });
    }
  }, [teachers, assignedTeachers, searchTerm]);

  const getAuthToken = () => {
    // Helper function to get token consistently
    return localStorage.getItem('token');
  };

  // Teacher data normalization helper
  const normalizeTeacherData = (teacher) => {
    if (!teacher) return null;
    
    // Ensure consistent data shape regardless of API source
    return {
      id: teacher.id,
      fullName: teacher.fullName || teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
      email: teacher.email || '',
      username: teacher.username || teacher.email || ''
    };
  };

  const fetchCoursesAndTeachers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Directly call the course API first - this seems less likely to have permission issues
      const coursesResponse = await axios.get('http://localhost:8080/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const coursesData = coursesResponse.data || [];
      setCourses(coursesData);
      
      // Now try to get teachers
      try {
        const teachersResponse = await axios.get('http://localhost:8080/api/users/role/FACULTY', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Normalize teacher data to ensure consistent format
        const normalizedTeachers = (teachersResponse.data || [])
          .map(normalizeTeacherData)
          .filter(teacher => teacher !== null);
        
        console.log('Normalized teachers from direct API:', normalizedTeachers);
        setTeachers(normalizedTeachers);
      } catch (teacherError) {
        console.error('Error fetching teachers directly:', teacherError);
        // Try fallback method - get all users and filter only teachers
        try {
          const allUsersResponse = await axios.get('http://localhost:8080/api/users', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Filter users with role 'FACULTY' and normalize
          const teacherUsers = (allUsersResponse.data || [])
            .filter(user => user.role === 'FACULTY')
            .map(normalizeTeacherData)
            .filter(teacher => teacher !== null);
            
          console.log('Fetched teachers using fallback method:', teacherUsers);
          setTeachers(teacherUsers);
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          setTeachers([]); // Set empty array as last resort
          // Show warning but don't block the UI completely
          setActionResult({
            type: 'error',
            message: 'Could not load teachers. Some functionality may be limited.'
          });
        }
      }

      // Select first course by default if available
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchCoursesAndTeachers:', error);
      handleApiError(error, 'Failed to load courses and teachers');
    }
  };

  const fetchAssignedTeachers = async (courseId) => {
    try {
      const token = getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // If the course already has assignedTeachers in the course object
      if (selectedCourse && selectedCourse.assignedTeachers) {
        const normalizedTeachers = selectedCourse.assignedTeachers
          .map(normalizeTeacherData)
          .filter(teacher => teacher !== null);
        setAssignedTeachers(normalizedTeachers);
      } else {
        // Use direct axios call instead of service
        try {
          const response = await axios.get(`http://localhost:8080/api/courses/${courseId}/teachers`, {
            headers
          });
          const normalizedTeachers = (response.data || [])
            .map(normalizeTeacherData)
            .filter(teacher => teacher !== null);
          setAssignedTeachers(normalizedTeachers);
        } catch (error) {
          console.error('Direct API call failed, trying fallback:', error);
          
          // Fallback: If course has teachers property
          if (selectedCourse && selectedCourse.teachers) {
            const normalizedTeachers = selectedCourse.teachers
              .map(normalizeTeacherData)
              .filter(teacher => teacher !== null);
            setAssignedTeachers(normalizedTeachers);
          } else {
            setAssignedTeachers([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching assigned teachers:', error);
      handleApiError(error, 'Failed to load assigned teachers');
    }
  };

  const handleApiError = (error, defaultMessage) => {
    setLoading(false);
    if (error.response) {
      // Log detailed error information for debugging
      console.error('API Error Details:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          break;
        case 403:
          setError('Access denied. You do not have permission to perform this action. Please ensure you have admin privileges.');
          break;
        case 404:
          setError('The requested resource was not found.');
          break;
        case 500:
          setError('Server error. Please try again later.');
          break;
        default:
          setError(error.response.data?.message || defaultMessage);
      }
    } else if (error.request) {
      // Network error
      setError('Network error. Please check your connection and try again.');
    } else {
      setError(error.message || defaultMessage);
    }
  };

  const updateAvailableTeachers = () => {
    try {
      // Get IDs of assigned teachers (handle potential undefined values)
      const assignedIds = (assignedTeachers || []).map(teacher => teacher?.id).filter(id => id !== undefined);
      
      console.log('Assigned IDs:', assignedIds);
      
      // Filter available teachers - those who are not already assigned
      // Make sure to handle potential missing IDs or other issues
      let available = teachers.filter(teacher => 
        teacher && teacher.id && !assignedIds.includes(teacher.id)
      );
      
      console.log('Available before search:', available.length);
      
      // Apply search filter if search term exists
      if (searchTerm && searchTerm.trim() !== '') {
        const search = searchTerm.toLowerCase();
        available = available.filter(teacher => 
          (teacher.fullName && teacher.fullName.toLowerCase().includes(search)) ||
          (teacher.username && teacher.username.toLowerCase().includes(search)) ||
          (teacher.email && teacher.email.toLowerCase().includes(search))
        );
      }
      
      console.log('Final available teachers:', available.length);
      setAvailableTeachers(available);
    } catch (error) {
      console.error('Error in updateAvailableTeachers:', error);
      // Set empty array as fallback
      setAvailableTeachers([]);
    }
  };

  const handleCourseSelect = (e) => {
    const courseId = parseInt(e.target.value, 10);
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAssignTeacher = async (teacherId) => {
    if (!selectedCourse) return;
    
    try {
      const token = getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Use direct axios call instead of service
      await axios.post(
        `http://localhost:8080/api/courses/${selectedCourse.id}/teachers/${teacherId}`,
        {}, // Empty body
        { headers }
      );
      
      // Refresh assigned teachers list
      await fetchAssignedTeachers(selectedCourse.id);
      
      setActionResult({
        type: 'success',
        message: 'Teacher assigned successfully!'
      });
      
      // Clear action result after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error assigning teacher:', error);
      handleApiError(error, 'Failed to assign teacher');
      setActionResult({
        type: 'error',
        message: `Failed to assign teacher: ${error.response?.data?.message || 'Unknown error'}`
      });
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!selectedCourse) return;
    
    try {
      const token = getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Use direct axios call instead of service
      await axios.delete(
        `http://localhost:8080/api/courses/${selectedCourse.id}/teachers/${teacherId}`,
        { headers }
      );
      
      // Refresh assigned teachers list
      await fetchAssignedTeachers(selectedCourse.id);
      
      setActionResult({
        type: 'success',
        message: 'Teacher removed successfully!'
      });
      
      // Clear action result after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error removing teacher:', error);
      handleApiError(error, 'Failed to remove teacher');
      setActionResult({
        type: 'error',
        message: `Failed to remove teacher: ${error.response?.data?.message || 'Unknown error'}`
      });
    }
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prevCount => prevCount + 1);
    }
  };

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  const handleRefreshToken = async () => {
    try {
      // Instead of using getToken, let's use the auth.login method if available or just refresh the page
      if (auth.refreshToken) {
        await auth.refreshToken();
      } else {
        // Force a refresh to get a new token
        window.location.reload();
      }
      setRetryCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      handleLogin();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary-100 mb-8">Teacher Assignment</h1>
      
      {actionResult && (
        <div className={`p-4 mb-6 rounded ${actionResult.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {actionResult.message}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 text-red-300 text-center p-4 rounded mb-4">
          <p className="mb-2">{error}</p>
          <div className="flex justify-center space-x-4 mt-3">
            <button 
              onClick={handleRetry} 
              disabled={retryCount >= MAX_RETRIES}
              className="px-4 py-2 bg-primary-700 hover:bg-primary-600 rounded text-primary-100 disabled:opacity-50"
            >
              {retryCount >= MAX_RETRIES ? 'Max retries reached' : 'Retry'}
            </button>
            {error.includes('Access denied') && (
              <>
                <button 
                  onClick={handleRefreshToken}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-green-100"
                >
                  Refresh Access
                </button>
                <button 
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded text-blue-100"
                >
                  Return to Login
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Course Selection */}
          <div className="mb-8">
            <label className="block text-primary-300 mb-2" htmlFor="courseSelect">
              Select Course
            </label>
            <select
              id="courseSelect"
              className="w-full md:w-1/2 p-3 bg-primary-800 border border-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedCourse?.id || ''}
              onChange={handleCourseSelect}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Assigned Teachers */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary-100">
                    Assigned Teachers ({assignedTeachers.length})
                  </h2>
                </div>
                
                <div className="bg-primary-800 rounded-lg shadow overflow-hidden">
                  {assignedTeachers.length === 0 ? (
                    <div className="p-6 text-center text-primary-300">
                      No teachers assigned to this course yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-primary-700">
                      {assignedTeachers.map(teacher => (
                        <li key={teacher.id} className="p-4 hover:bg-primary-700/50 flex justify-between items-center">
                          <div>
                            <div className="text-primary-100 font-medium">{teacher.fullName || "Unknown Teacher"}</div>
                            <div className="text-primary-400 text-sm">{teacher.email || "No email available"}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveTeacher(teacher.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Available Teachers */}
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-primary-100 mb-2">Available Teachers</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search teachers..."
                      className="w-full p-3 bg-primary-800 border border-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-400">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-800 rounded-lg shadow overflow-hidden">
                  {availableTeachers.length === 0 ? (
                    <div className="p-6 text-center text-primary-300">
                      {searchTerm ? 
                        "No teachers found matching your search criteria." : 
                        "All teachers are already assigned to this course."}
                    </div>
                  ) : (
                    <ul className="divide-y divide-primary-700">
                      {availableTeachers.map(teacher => (
                        <li key={teacher.id} className="p-4 hover:bg-primary-700/50 flex justify-between items-center">
                          <div>
                            <div className="text-primary-100 font-medium">{teacher.fullName || "Unknown Teacher"}</div>
                            <div className="text-primary-400 text-sm">{teacher.email || "No email available"}</div>
                          </div>
                          <button
                            onClick={() => handleAssignTeacher(teacher.id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            Assign
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignment; 