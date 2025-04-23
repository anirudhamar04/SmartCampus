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
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [showForm, setShowForm] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);

  const categories = ['GENERAL', 'FACILITY', 'SERVICE', 'ACADEMIC', 'OTHER'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchFeedbacks();
    }
  }, [currentUser]);

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-zinc-100 text-zinc-800';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    });
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (activeTab === 'active') {
      return ['PENDING', 'IN_PROGRESS'].includes(feedback.status);
    } else if (activeTab === 'resolved') {
      return ['RESOLVED', 'CLOSED'].includes(feedback.status);
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-800">My Feedback</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors flex items-center"
        >
          {showForm ? 'Cancel' : 'Submit New Feedback'}
          {!showForm && <FaPaperPlane className="ml-2" />}
        </button>
      </div>
      
      {/* Success or Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <FaCheckCircle className="mr-2" />
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}

      {/* Feedback Submission Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingFeedbackId ? 'Edit Feedback' : 'Submit New Feedback'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-zinc-700 font-medium mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="Enter subject"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-zinc-700 font-medium mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 min-h-[120px]"
                placeholder="Describe your feedback in detail"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                  {priorities.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri.charAt(0) + pri.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
              >
                {editingFeedbackId ? 'Update Feedback' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'active' ? 'text-black border-b-2 border-black' : 'text-zinc-500'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Feedbacks
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'resolved' ? 'text-black border-b-2 border-black' : 'text-zinc-500'}`}
          onClick={() => setActiveTab('resolved')}
        >
          Resolved Feedbacks
        </button>
      </div>

      {/* Feedbacks List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-zinc-600">Loading feedbacks...</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-10 bg-zinc-50 rounded-lg">
          <p className="text-zinc-500">No feedbacks found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{feedback.subject}</h3>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(feedback.status)}`}>
                    {feedback.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(feedback.priority)}`}>
                    {feedback.priority}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-zinc-600 mb-2">
                  <span className="font-medium">Category:</span> {feedback.category}
                </p>
                <p className="text-zinc-700 whitespace-pre-line">{feedback.message}</p>
              </div>
              
              <div className="flex items-center text-sm text-zinc-500 mb-4">
                <FaClock className="mr-1" />
                <span>Submitted: {formatDate(feedback.submissionTime)}</span>
              </div>
              
              {feedback.response && (
                <div className="mt-4 bg-zinc-50 p-3 rounded-md">
                  <div className="flex items-center text-zinc-700 font-medium mb-2">
                    <FaCommentDots className="mr-2 text-black" />
                    <span>Response from {feedback.respondedByName || 'Admin'}</span>
                  </div>
                  <p className="text-zinc-700 whitespace-pre-line">{feedback.response}</p>
                  {feedback.responseTime && (
                    <div className="mt-2 text-xs text-zinc-500">
                      {formatDate(feedback.responseTime)}
                    </div>
                  )}
                </div>
              )}
              
              {['PENDING', 'IN_PROGRESS'].includes(feedback.status) && (
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(feedback)}
                    className="p-2 text-zinc-600 hover:bg-zinc-50 rounded-md transition-colors"
                    title="Edit feedback"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFeedback; 