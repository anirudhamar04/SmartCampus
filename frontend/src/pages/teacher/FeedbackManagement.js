import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FeedbackManagement = () => {
  const { currentUser } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');

  // Status options for feedback
  const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  // Category options for filtering
  const categoryOptions = ['GENERAL', 'FACILITY', 'SERVICE', 'OTHER'];

  useEffect(() => {
    fetchFeedback();
  }, [activeTab]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      let response;

      if (activeTab === 'all') {
        response = await feedbackService.getAll();
      } else if (statusOptions.includes(activeTab)) {
        response = await feedbackService.getByStatus(activeTab);
      } else if (categoryOptions.includes(activeTab)) {
        response = await feedbackService.getByCategory(activeTab);
      }

      setFeedbackList(response.data);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setError('Failed to fetch feedback. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedFeedback(null);
    setResponseText('');
  };

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || '');
  };

  const handleResponseChange = (e) => {
    setResponseText(e.target.value);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    
    if (!selectedFeedback || !responseText.trim()) return;
    
    try {
      setLoading(true);
      const response = await feedbackService.respond(
        selectedFeedback.id,
        responseText,
        currentUser.id
      );
      
      // Update the feedback in the list
      setFeedbackList(prev => 
        prev.map(feedback => 
          feedback.id === selectedFeedback.id ? response.data : feedback
        )
      );
      
      // Update selected feedback
      setSelectedFeedback(response.data);
      
      // Show success message (could add a toast notification here)
    } catch (err) {
      console.error('Failed to respond to feedback:', err);
      setError('Failed to respond to feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedFeedback) return;
    
    try {
      setLoading(true);
      const response = await feedbackService.updateStatus(
        selectedFeedback.id,
        newStatus,
        responseText,
        currentUser.id
      );
      
      // Update the feedback in the list
      setFeedbackList(prev => 
        prev.map(feedback => 
          feedback.id === selectedFeedback.id ? response.data : feedback
        )
      );
      
      // Update selected feedback
      setSelectedFeedback(response.data);
      
      // Refetch feedback if we're filtering by status
      if (statusOptions.includes(activeTab)) {
        fetchFeedback();
      }
    } catch (err) {
      console.error('Failed to update feedback status:', err);
      setError('Failed to update feedback status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN':
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-100">Feedback Management</h1>
        <p className="text-primary-300 mt-2">
          View and respond to student feedback
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-primary-700">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-100'
                : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
            }`}
            onClick={() => handleTabChange('all')}
          >
            All Feedback
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
              onClick={() => handleTabChange(status)}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
          
          {/* Category tabs */}
          {categoryOptions.map(category => (
            <button
              key={category}
              className={`mr-2 py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === category
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => handleTabChange(category)}
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
          
          {loading && feedbackList.length === 0 ? (
            <div className="p-6 text-center text-primary-300">Loading feedback...</div>
          ) : feedbackList.length === 0 ? (
            <div className="p-6 text-center text-primary-300">No feedback found.</div>
          ) : (
            <div className="overflow-y-auto max-h-[600px]">
              <ul className="divide-y divide-primary-700">
                {feedbackList.map(feedback => (
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
                    <p className="text-primary-400 text-sm truncate">
                      From: {feedback.userName}
                    </p>
                    <p className="text-primary-400 text-sm">
                      {formatDateTime(feedback.submissionTime)}
                    </p>
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
              Select a feedback from the list to view details
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-primary-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-primary-100">{selectedFeedback.subject}</h2>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(selectedFeedback.status)}`}>
                    {selectedFeedback.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 text-sm text-primary-400">
                  <span>From: {selectedFeedback.userName} | </span>
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
                  <h3 className="text-md font-medium text-primary-200 mb-2">Previous Response</h3>
                  <p className="text-primary-300 whitespace-pre-wrap">{selectedFeedback.response}</p>
                  <div className="mt-2 text-xs text-primary-400">
                    <span>Responded by: {selectedFeedback.respondedByName || 'Unknown'} | </span>
                    <span>Time: {formatDateTime(selectedFeedback.responseTime)}</span>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-md font-medium text-primary-200 mb-2">Add Response</h3>
                <form onSubmit={handleSubmitResponse}>
                  <textarea
                    value={responseText}
                    onChange={handleResponseChange}
                    className="input w-full h-32"
                    placeholder="Type your response here..."
                  ></textarea>
                  
                  <div className="mt-4 flex justify-between">
                    <div className="space-x-2">
                      {statusOptions.map(status => (
                        <button
                          key={status}
                          type="button"
                          className={`px-3 py-1.5 rounded text-xs font-medium ${
                            status === selectedFeedback.status 
                              ? getStatusBadgeClass(status) 
                              : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                          }`}
                          onClick={() => handleUpdateStatus(status)}
                        >
                          Mark as {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !responseText.trim()}
                    >
                      {loading ? 'Sending...' : 'Send Response'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement; 