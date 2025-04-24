import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaEdit, FaTrash, FaPaperPlane, FaExclamationCircle, FaCheckCircle, FaClock, FaCommentDots } from 'react-icons/fa';

const StudentFeedback = () => {
  const { currentUser } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [showForm, setShowForm] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);

  const categories = ['GENERAL', 'FACILITY', 'SERVICE', 'ACADEMIC', 'OTHER'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];
  const statusOptions = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchFeedbacks();
    }
  }, [currentUser, activeTab]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser || !currentUser.id) {
        setError('User information not available. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching feedbacks for user:', currentUser.id);
      const response = await feedbackService.getByUser(currentUser.id);
      console.log('Feedback response:', response);
      
      if (response && response.data) {
        setFeedbacks(response.data);
      } else {
        setFeedbacks([]);
        console.warn('No feedback data returned from API');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to fetch feedbacks. Please try again later.');
      setLoading(false);
      setFeedbacks([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      if (!currentUser || !currentUser.id) {
        setError('User information not available. Please log in again.');
        return;
      }
      
      setLoading(true);
      
      const feedbackData = {
        userId: currentUser.id,
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority
      };
      
      console.log('Submitting feedback data:', feedbackData);
      
      if (editingFeedbackId) {
        await feedbackService.update(editingFeedbackId, feedbackData);
        setSuccessMessage('Feedback updated successfully!');
      } else {
        await feedbackService.create(feedbackData);
        setSuccessMessage('Feedback submitted successfully!');
      }
      
      // Reset form
      setSubject('');
      setMessage('');
      setCategory('GENERAL');
      setPriority('MEDIUM');
      setShowForm(false);
      setEditingFeedbackId(null);
      
      // Refresh feedbacks
      fetchFeedbacks();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(`Failed to submit feedback: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setSubject(feedback.subject);
    setMessage(feedback.message);
    setCategory(feedback.category);
    setPriority(feedback.priority);
    setEditingFeedbackId(feedback.id);
    setShowForm(true);
    setSelectedFeedback(null);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setSubject('');
    setMessage('');
    setCategory('GENERAL');
    setPriority('MEDIUM');
    setEditingFeedbackId(null);
    setShowForm(false);
  };

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowForm(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-900 text-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-900 text-yellow-200';
      case 'RESOLVED':
        return 'bg-green-900 text-green-200';
      case 'CLOSED':
        return 'bg-gray-900 text-gray-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-900 text-red-200';
      case 'MEDIUM':
        return 'bg-yellow-900 text-yellow-200';
      case 'LOW':
        return 'bg-green-900 text-green-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (activeTab === 'active') {
      return ['PENDING', 'IN_PROGRESS'].includes(feedback.status);
    } else if (activeTab === 'resolved') {
      return ['RESOLVED', 'CLOSED'].includes(feedback.status);
    } else if (statusOptions.includes(activeTab)) {
      return feedback.status === activeTab;
    } else if (categories.includes(activeTab)) {
      return feedback.category === activeTab;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-100">My Feedback</h1>
        <p className="text-primary-300 mt-2">
          Submit and track your feedback
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-900 text-green-200 p-3 rounded">
          {successMessage}
        </div>
      )}

      {/* New Feedback Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setSelectedFeedback(null);
          }}
          className="btn btn-primary flex items-center"
        >
          {showForm ? 'Cancel' : 'Submit New Feedback'}
          {!showForm && <FaPaperPlane className="ml-2" />}
        </button>
      </div>

      {/* Feedback Submission Form */}
      {showForm && (
        <div className="bg-primary-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-primary-100 mb-4">
            {editingFeedbackId ? 'Edit Feedback' : 'Submit New Feedback'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-primary-200 font-medium mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input w-full"
                placeholder="Enter subject"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-primary-200 font-medium mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input w-full h-32"
                placeholder="Describe your feedback in detail"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-primary-200 font-medium mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-primary-200 font-medium mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input w-full"
                >
                  {priorities.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : (editingFeedbackId ? 'Update Feedback' : 'Submit Feedback')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-primary-700">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => { 
              setActiveTab('active');
              setSelectedFeedback(null);
            }}
          >
            Active Feedbacks
          </button>
          
          <button
            className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'resolved'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => { 
              setActiveTab('resolved');
              setSelectedFeedback(null);
            }}
          >
            Resolved Feedbacks
          </button>
          
          {/* Status tabs */}
          {statusOptions.map(status => (
            <button
              key={status}
              className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === status
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => { 
                setActiveTab(status);
                setSelectedFeedback(null);
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
          
          {/* Category tabs */}
          {categories.map(category => (
            <button
              key={category}
              className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === category
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => { 
                setActiveTab(category);
                setSelectedFeedback(null);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback list */}
        <div className="lg:col-span-1 bg-primary-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-primary-700">
            <h2 className="text-lg font-semibold text-primary-100">Feedback List</h2>
          </div>
          
          {loading && filteredFeedbacks.length === 0 ? (
            <div className="p-6 text-center text-primary-300">Loading feedback...</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="p-6 text-center text-primary-300">No feedback found.</div>
          ) : (
            <div className="overflow-y-auto max-h-[600px]">
              <ul className="divide-y divide-primary-700">
                {filteredFeedbacks.map(feedback => (
                  <li 
                    key={feedback.id}
                    className={`p-4 cursor-pointer hover:bg-primary-700 ${
                      selectedFeedback?.id === feedback.id ? 'bg-primary-700' : ''
                    }`}
                    onClick={() => handleSelectFeedback(feedback)}
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium text-primary-200 truncate flex-1">
                        {feedback.subject}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(feedback.status)}`}>
                        {feedback.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(feedback.priority)}`}>
                        {feedback.priority}
                      </span>
                      <p className="text-primary-400">
                        {formatDateTime(feedback.submissionTime)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Feedback details */}
        <div className="lg:col-span-2 bg-primary-800 rounded-lg overflow-hidden">
          {!selectedFeedback ? (
            <div className="p-6 text-center text-primary-300">
              {showForm ? 'Fill in the form to submit your feedback' : 'Select a feedback from the list to view details'}
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-primary-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-primary-100">{selectedFeedback.subject}</h2>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(selectedFeedback.status)}`}>
                      {selectedFeedback.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(selectedFeedback.priority)}`}>
                      {selectedFeedback.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-primary-400">
                  <span>Category: {selectedFeedback.category} | </span>
                  <span>Submitted: {formatDateTime(selectedFeedback.submissionTime)}</span>
                </div>
              </div>
              
              <div className="p-4 border-b border-primary-700">
                <h3 className="text-md font-medium text-primary-200 mb-2">Message</h3>
                <p className="text-primary-300 whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>
              
              {selectedFeedback.response && (
                <div className="p-4 border-b border-primary-700 bg-primary-750">
                  <h3 className="text-md font-medium text-primary-200 mb-2">Response</h3>
                  <p className="text-primary-300 whitespace-pre-wrap">{selectedFeedback.response}</p>
                  <div className="mt-2 text-xs text-primary-400">
                    <span>Responded by: {selectedFeedback.respondedByName || 'Admin'} | </span>
                    <span>Time: {formatDateTime(selectedFeedback.responseTime)}</span>
                  </div>
                </div>
              )}
              
              {['PENDING', 'IN_PROGRESS'].includes(selectedFeedback.status) && (
                <div className="p-4 flex justify-end">
                  <button
                    onClick={() => handleEdit(selectedFeedback)}
                    className="btn btn-secondary flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit Feedback
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;