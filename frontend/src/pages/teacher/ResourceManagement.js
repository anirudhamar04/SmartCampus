import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Button, TextField, MenuItem, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select } from '@mui/material';
import { Add, Edit, Delete, Visibility, Download } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { resourceService, courseService } from '../../services/api';

const ResourceManagement = () => {
  // States for resources
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // States for form
  const [openForm, setOpenForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedResource, setSelectedResource] = useState(null);
  const [viewResource, setViewResource] = useState(null);
  const [openView, setOpenView] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [resourceTypes, setResourceTypes] = useState([]);
  const [courses, setCourses] = useState([]);

  // State for dropdown filter by resource type
  const [selectedResourceType, setSelectedResourceType] = useState('');

  const { currentUser } = useAuth();

  // Fetch resources and resource types on component mount
  useEffect(() => {
    fetchResources();
    fetchResourceTypes();
    fetchTeacherCourses();
  }, []);

  // Fetch all resources
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (selectedResourceType) {
        response = await resourceService.getByType(courseId, selectedResourceType);
      } else {
        response = await resourceService.getByCourse(courseId);
      }
      setResources(response.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedResourceType]);

  // Fetch resource types
  const fetchResourceTypes = async () => {
    try {
      const response = await resourceService.getResourceTypes();
      setResourceTypes(response.data);
    } catch (err) {
      setError("Failed to load resource types: " + (err.response?.data?.message || err.message));
    }
  };

  // Fetch teacher courses
  const fetchTeacherCourses = async () => {
    try {
      const response = await courseService.getByTeacher(currentUser.id);
      setCourses(response.data);
    } catch (err) {
      setError("Failed to load courses: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'resourceType':
        setResourceType(value);
        break;
      case 'courseId':
        setCourseId(value);
        break;
      case 'description':
        setDescription(value);
        break;
      default:
        break;
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Open add form
  const handleAddClick = () => {
    setFormTitle('Add New Resource');
    setFormMode('add');
    resetForm();
    setOpenForm(true);
  };

  // Open edit form
  const handleEditClick = (resource) => {
    setFormTitle('Edit Resource');
    setFormMode('edit');
    setSelectedResource(resource);
    
    // Pre-fill form fields
    setTitle(resource.title);
    setResourceType(resource.resourceType);
    setCourseId(resource.courseId);
    setDescription(resource.description);
    
    setOpenForm(true);
  };

  // View resource details
  const handleViewClick = (resource) => {
    setViewResource(resource);
    setOpenView(true);
  };

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setResourceType('');
    setCourseId('');
    setFile(null);
    setDescription('');
    setSelectedResource(null);
  };

  // Submit form - Create or Update resource
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('resourceType', resourceType);
    formData.append('courseId', courseId);
    formData.append('description', description);
    
    if (file) {
      formData.append('file', file);
    }
    
    try {
      if (formMode === 'add') {
        await resourceService.create(formData);
        setSuccess("Resource created successfully");
      } else {
        await resourceService.update(selectedResource.id, formData);
        setSuccess("Resource updated successfully");
      }
      
      fetchResources();
      setOpenForm(false);
      resetForm();
    } catch (err) {
      setError("Failed to save resource: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete resource
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      setLoading(true);
      try {
        await resourceService.delete(id);
        setSuccess("Resource deleted successfully");
        fetchResources();
      } catch (err) {
        setError("Failed to delete resource: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  // Close alerts
  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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

  const getResourceTypeBadgeClass = (type) => {
    switch (type) {
      case 'DOCUMENT':
        return 'bg-blue-900 text-blue-200';
      case 'VIDEO':
        return 'bg-red-900 text-red-200';
      case 'PRESENTATION':
        return 'bg-yellow-900 text-yellow-200';
      case 'LINK':
        return 'bg-purple-900 text-purple-200';
      case 'IMAGE':
        return 'bg-green-900 text-green-200';
      case 'AUDIO':
        return 'bg-indigo-900 text-indigo-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  // Handle resource download
  const handleDownload = async (resourceId) => {
    try {
      const response = await resourceService.download(resourceId);
      
      // Create a blob from the response data
      const blob = new Blob([response.data]);
      
      // Get the filename from the content-disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) filename = filenameMatch[1];
      }
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading resource:', err);
      setError('Failed to download resource');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-100">Resource Management</h1>
          <p className="text-primary-300 mt-2">
            Upload and manage educational resources
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="btn btn-primary"
        >
          Upload Resource
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
          <button 
            className="ml-2 text-red-200 hover:text-white" 
            onClick={handleCloseAlert}
          >
            ✕
          </button>
        </div>
      )}

      {/* Create/Edit resource form */}
      {openForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">
            {formTitle}
          </h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Resource title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="resourceType"
                    value={resourceType}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  >
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Course
                  </label>
                  <select
                    name="courseId"
                    value={courseId}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={description}
                    onChange={handleInputChange}
                    className="input w-full h-24"
                    placeholder="Resource description..."
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    File
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                    className="w-full text-primary-300 py-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Resource'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources list */}
      <div className="bg-primary-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-primary-700">
          <h2 className="text-lg font-semibold text-primary-100">Resources</h2>
        </div>
        
        {loading && resources.length === 0 ? (
          <div className="p-6 text-center text-primary-300">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="p-6 text-center text-primary-300">No resources found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {resources.map(resource => (
                  <tr key={resource.id} className="hover:bg-primary-750">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getResourceTypeIcon(resource.resourceType)}
                        <div className="ml-2 text-sm font-medium text-primary-200">{resource.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getResourceTypeBadgeClass(resource.resourceType)}`}>
                        {resource.resourceType}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{resource.course?.title || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{formatDate(resource.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(resource)}
                        className="text-primary-300 hover:text-primary-100 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(resource.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                      <IconButton 
                        aria-label="download" 
                        onClick={() => handleDownload(resource.id)}
                        title="Download resource"
                      >
                        <Download />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resource Type Filter dropdown */}
      <FormControl variant="outlined" className={classes.formControl} style={{ marginLeft: '10px' }}>
        <InputLabel>Filter by Type</InputLabel>
        <Select
          value={selectedResourceType}
          onChange={(e) => setSelectedResourceType(e.target.value)}
          label="Filter by Type"
        >
          <MenuItem value="">
            <em>All Types</em>
          </MenuItem>
          {resourceTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ResourceManagement; 