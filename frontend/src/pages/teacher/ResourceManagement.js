import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resourceService, courseService } from '../../services/api';

const ResourceManagement = () => {
  // Resource state
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Alert states
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  
  // Filter state
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState([]);
  const [courses, setCourses] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceType: '',
    courseId: '',
    file: null
  });
  const [selectedResource, setSelectedResource] = useState(null);
  
  const { currentUser } = useAuth();

  // Load resources and metadata on component mount
  useEffect(() => {
    const initializePage = async () => {
      if (currentUser && currentUser.id) {
        await Promise.all([
          fetchResources(),
          fetchResourceTypes(),
          fetchTeacherCourses()
        ]);
      }
    };
    
    initializePage();
  }, [currentUser]);

  // Fetch resources based on filters
  const fetchResources = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;
    
    setLoading(true);
    try {
      let response;
      if (selectedResourceType && formData.courseId) {
        response = await resourceService.getByType(formData.courseId, selectedResourceType);
      } else if (formData.courseId) {
        response = await resourceService.getByCourse(formData.courseId);
      } else {
        // If no course is selected, get all resources for this teacher
        response = await resourceService.getByTeacher(currentUser.id);
      }
      setResources(response?.data || []);
    } catch (error) {
      console.error('Resource fetching error:', error);
      showAlert(`Error loading resources: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedResourceType, formData.courseId, currentUser]);

  // Fetch resource types
  const fetchResourceTypes = async () => {
    try {
      const response = await resourceService.getResourceTypes();
      setResourceTypes(response.data || []);
    } catch (error) {
      showAlert(`Error loading resource types: ${error.message}`, 'error');
    }
  };

  // Fetch courses taught by current teacher
  const fetchTeacherCourses = async () => {
    try {
      let response;
      
      // Check if the method exists, otherwise use a fallback method
      if (typeof courseService.getByTeacher === 'function') {
        response = await courseService.getByTeacher(currentUser.id);
      } else if (typeof courseService.getCoursesByTeacher === 'function') {
        // Try alternative method name that might exist
        response = await courseService.getCoursesByTeacher(currentUser.id);
      } else if (typeof courseService.getAll === 'function') {
        // Fallback to getting all courses if teacher-specific endpoint isn't available
        response = await courseService.getAll();
        // Filter courses by teacher if possible
        if (response.data && Array.isArray(response.data)) {
          response.data = response.data.filter(course => 
            course.teacherId === currentUser.id || 
            (course.teachers && course.teachers.includes(currentUser.id))
          );
        }
      } else {
        // Last resort fallback
        console.warn('No course fetching method available in courseService');
        response = { data: [] };
      }
      
      setCourses(response.data || []);
      
      // Set first course as default if available
      if (response.data?.length > 0) {
        setFormData(prev => ({ ...prev, courseId: response.data[0].id }));
      }
    } catch (error) {
      console.error('Course fetching error:', error);
      showAlert(`Error loading courses: ${error.message}`, 'error');
    }
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // File input change handler
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  // Open modal to create a new resource
  const handleCreateResource = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      resourceType: resourceTypes.length > 0 ? resourceTypes[0] : '',
      courseId: courses.length > 0 ? courses[0].id : '',
      file: null
    });
    setModalOpen(true);
  };

  // Open modal to edit an existing resource
  const handleEditResource = (resource) => {
    setModalMode('edit');
    setSelectedResource(resource);
    setFormData({
      title: resource.title || '',
      description: resource.description || '',
      resourceType: resource.resourceType || '',
      courseId: resource.courseId || '',
      file: null // We don't pre-populate the file
    });
    setModalOpen(true);
  };

  // Submit form to create or update a resource
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to perform this action');
      }
      
      // Check if currentUser has the necessary permissions (teacher role)
      if (!currentUser || !currentUser.id) {
        throw new Error('User information not available. Please log in again.');
      }
      
      if (currentUser.role !== 'TEACHER' && currentUser.role !== 'ADMIN') {
        throw new Error('Only teachers and administrators can manage resources');
      }
      
      // Validate form data
      if (!formData.title || !formData.resourceType || !formData.courseId) {
        throw new Error('Please fill all required fields');
      }
      
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('resourceType', formData.resourceType);
      formPayload.append('courseId', formData.courseId);
      formPayload.append('uploadedById', currentUser.id);
      
      if (formData.file) {
        // Check file size - 10MB limit
        if (formData.file.size > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit');
        }
        formPayload.append('file', formData.file);
      } else if (formData.resourceType !== 'LINK') {
        // For LINK resources, we set the URL in the description field
        if (formData.resourceType === 'LINK' && !formData.description.trim().startsWith('http')) {
          // If it's a LINK but URL doesn't start with http
          throw new Error('For LINK resources, please provide a valid URL in the description field (starting with http:// or https://)');
        } else if (formData.resourceType !== 'LINK') {
          // For non-LINK resources, we need a file
          throw new Error('Please select a file to upload');
        }
      }
      
      let response;
      if (modalMode === 'create') {
        console.log('Submitting resource creation with data:', {
          title: formData.title,
          description: formData.description,
          resourceType: formData.resourceType,
          courseId: formData.courseId,
          uploadedById: currentUser.id,
          file: formData.file ? formData.file.name : 'No file'
        });
        
        response = await resourceService.create(formPayload);
        showAlert('Resource created successfully', 'success');
      } else {
        response = await resourceService.update(selectedResource.id, formPayload);
        showAlert('Resource updated successfully', 'success');
      }
      
      console.log('Server response:', response);
      fetchResources();
      setModalOpen(false);
    } catch (error) {
      console.error('Resource submission error:', error);
      let errorMessage = 'Error saving resource';
      
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action. Please check if your login session is still valid.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
          // Redirect to login after a short delay
          setTimeout(() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }, 3000);
        } else if (error.response.data && error.response.data.message) {
          // Use error message from server if available
          errorMessage = `Server error: ${error.response.data.message}`;
        } else {
          errorMessage = `Server error (${error.response.status}): ${error.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete a resource
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }
    
    setLoading(true);
    try {
      await resourceService.delete(resourceId);
      showAlert('Resource deleted successfully', 'success');
      fetchResources();
    } catch (error) {
      showAlert(`Error deleting resource: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Download a resource
  const handleDownload = async (resourceId) => {
    try {
      const response = await resourceService.download(resourceId);
      
      // Create a blob from the response data
      const blob = new Blob([response.data]);
      
      // Extract filename from headers or use default
      let filename = 'download';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link and trigger click
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showAlert('Download started', 'success');
    } catch (error) {
      showAlert(`Error downloading resource: ${error.message}`, 'error');
    }
  };

  // Show alert message
  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  // Get icon for resource type
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'DOCUMENT':
        return '📄';
      case 'VIDEO':
        return '🎬';
      case 'PRESENTATION':
        return '📊';
      case 'LINK':
        return '🔗';
      case 'IMAGE':
        return '🖼️';
      case 'AUDIO':
        return '🔊';
      default:
        return '📦';
    }
  };

  // Get color classes for resource type badge
  const getResourceTypeBadgeClasses = (type) => {
    switch (type) {
      case 'DOCUMENT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'VIDEO':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PRESENTATION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LINK':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'IMAGE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'AUDIO':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">Resource Management</h1>
          <p className="text-zinc-600 dark:text-zinc-300 mt-2">
            Upload and manage educational resources for your courses
          </p>
        </div>
        <button
          onClick={handleCreateResource}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          Upload Resource
        </button>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-lg mb-6 ${
          alert.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 
          alert.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 
          'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Course</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title || course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Resource Type</label>
            <select
              value={selectedResourceType}
              onChange={(e) => setSelectedResourceType(e.target.value)}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
            >
              <option value="">All Types</option>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchResources}
              className="w-full p-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">Resources</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
            No resources found. Use the button above to upload new resources.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getResourceTypeIcon(resource.resourceType)}</span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">{resource.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getResourceTypeBadgeClasses(resource.resourceType)}`}>
                        {resource.resourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {resource.course?.title || resource.courseName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(resource.uploadDate || resource.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditResource(resource)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit resource"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete resource"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownload(resource.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Download resource"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => !loading && setModalOpen(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-zinc-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-zinc-800 px-4 pt-5 pb-4 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white" id="modal-title">
                        {modalMode === 'create' ? 'Upload New Resource' : 'Edit Resource'}
                      </h3>
                      <div className="mt-6 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="resourceType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Resource Type
                          </label>
                          <select
                            id="resourceType"
                            name="resourceType"
                            value={formData.resourceType}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Type</option>
                            {resourceTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="courseId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Course
                          </label>
                          <select
                            id="courseId"
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.title || course.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            required
                            className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            File
                          </label>
                          <div className="flex items-center">
                            <label className="cursor-pointer bg-white dark:bg-zinc-700 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-600">
                              <span>Select File</span>
                              <input 
                                type="file" 
                                className="sr-only" 
                                onChange={handleFileChange}
                              />
                            </label>
                            {formData.file && (
                              <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                                {formData.file.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {formData.resourceType === 'LINK' ? 
                              'For links, enter the URL in the description field. File upload is optional.' : 
                              'Upload a file for this resource.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Resource'
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-zinc-300 dark:border-zinc-600 shadow-sm px-4 py-2 bg-white dark:bg-zinc-800 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement; 