import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ResourceManagement = () => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DOCUMENT',
    subject: '',
    grade: '',
    fileUrl: '',
    file: null,
    isPublic: true
  });

  // Constants for dropdown options
  const resourceTypes = ['DOCUMENT', 'VIDEO', 'PRESENTATION', 'LINK', 'IMAGE', 'AUDIO', 'OTHER'];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getAll();
      setResources(response.data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to fetch resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        file: files[0]
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData.file) {
          formDataToSend.append('file', formData.file);
        } else if (key !== 'file') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add teacher ID
      formDataToSend.append('teacherId', currentUser.id);
      
      if (editMode && selectedResource) {
        await resourceService.update(selectedResource.id, formDataToSend);
      } else {
        await resourceService.create(formDataToSend);
      }
      
      // Reset form
      resetForm();
      
      // Refresh resources
      fetchResources();
    } catch (err) {
      console.error('Failed to save resource:', err);
      setError(`Failed to ${editMode ? 'update' : 'create'} resource. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }
    
    try {
      setLoading(true);
      await resourceService.delete(resourceId);
      
      // Clear selected resource if it's the one being deleted
      if (selectedResource?.id === resourceId) {
        setSelectedResource(null);
      }
      
      // Refresh resources
      fetchResources();
    } catch (err) {
      console.error('Failed to delete resource:', err);
      setError('Failed to delete resource. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      subject: resource.subject || '',
      grade: resource.grade || '',
      fileUrl: resource.fileUrl || '',
      file: null,
      isPublic: resource.isPublic
    });
    
    setSelectedResource(resource);
    setEditMode(true);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'DOCUMENT',
      subject: '',
      grade: '',
      fileUrl: '',
      file: null,
      isPublic: true
    });
    
    setSelectedResource(null);
    setEditMode(false);
    setShowForm(false);
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
          onClick={() => {
            if (showForm && !editMode) {
              resetForm();
            } else {
              setShowForm(!showForm);
              setEditMode(false);
              setSelectedResource(null);
              resetForm();
            }
          }}
          className="btn btn-primary"
        >
          {showForm && !editMode ? 'Cancel' : 'Upload Resource'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
          <button 
            className="ml-2 text-red-200 hover:text-white" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Create/Edit resource form */}
      {showForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">
            {editMode ? 'Edit Resource' : 'Upload New Resource'}
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
                    value={formData.title}
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
                    name="type"
                    value={formData.type}
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
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Subject (e.g., Mathematics, Science)"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Grade or class level"
                  />
                </div>
                
                {formData.type === 'LINK' ? (
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="fileUrl"
                      value={formData.fileUrl}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="https://example.com/resource"
                      required={formData.type === 'LINK'}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">
                      File {!editMode && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="file"
                      name="file"
                      onChange={handleInputChange}
                      className="w-full text-primary-300 py-2"
                      required={!editMode && formData.type !== 'LINK'}
                    />
                    {editMode && (
                      <p className="text-xs text-primary-400 mt-1">
                        Leave empty to keep the current file
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="isPublic"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="form-checkbox h-4 w-4 text-primary-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-primary-300">
                    Make this resource visible to students
                  </label>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="Resource description..."
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : editMode ? 'Update Resource' : 'Upload Resource'}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Visibility</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {resources.map(resource => (
                  <tr key={resource.id} className="hover:bg-primary-750">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getResourceTypeIcon(resource.type)}
                        <div className="ml-2 text-sm font-medium text-primary-200">{resource.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getResourceTypeBadgeClass(resource.type)}`}>
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{resource.subject || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{resource.grade || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{formatDate(resource.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${resource.isPublic ? 'bg-green-900 text-green-200' : 'bg-gray-800 text-gray-300'}`}>
                        {resource.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={resource.fileUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-300 hover:text-primary-100 mr-3"
                        onClick={(e) => {
                          if (!resource.fileUrl) {
                            e.preventDefault();
                            alert('No file URL available');
                          }
                        }}
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-primary-300 hover:text-primary-100 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagement; 