import React, { useState, useEffect } from 'react';
import { assignmentService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AssignmentManagement = () => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    totalPoints: 100,
    assignedTo: [], // Student IDs
    attachmentUrl: '',
    attachment: null
  });
  const [selectedTab, setSelectedTab] = useState('active');
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] = useState([]);

  // Constants for assignment status
  const statusOptions = ['DRAFT', 'ASSIGNED', 'GRADED', 'ARCHIVED'];

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
  }, [selectedTab]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedTab === 'active') {
        response = await assignmentService.getActiveAssignments(currentUser.id);
      } else if (selectedTab === 'past') {
        response = await assignmentService.getPastAssignments(currentUser.id);
      } else if (selectedTab === 'draft') {
        response = await assignmentService.getDraftAssignments(currentUser.id);
      } else {
        response = await assignmentService.getAllAssignments(currentUser.id);
      }
      
      setAssignments(response.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to fetch assignments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await userService.getByRole('STUDENT');
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to fetch students. Please try again later.');
    }
  };

  const fetchAssignmentSubmissions = async (assignmentId) => {
    try {
      setLoading(true);
      const response = await assignmentService.getSubmissions(assignmentId);
      setSelectedAssignmentSubmissions(response.data);
      setShowSubmissions(true);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to fetch assignment submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        attachment: files[0]
      });
    } else if (name === 'totalPoints') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleStudentSelection = (e) => {
    const options = e.target.options;
    const selectedStudents = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedStudents.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      assignedTo: selectedStudents
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'attachment' && formData.attachment) {
          formDataToSend.append('attachment', formData.attachment);
        } else if (key === 'assignedTo') {
          // Handle array of student IDs
          formData.assignedTo.forEach(studentId => {
            formDataToSend.append('assignedTo', studentId);
          });
        } else if (key !== 'attachment') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add teacher ID
      formDataToSend.append('teacherId', currentUser.id);
      
      // Determine status based on form state
      const status = formData.assignedTo.length > 0 ? 'ASSIGNED' : 'DRAFT';
      formDataToSend.append('status', status);
      
      if (editMode && selectedAssignment) {
        await assignmentService.update(selectedAssignment.id, formDataToSend);
      } else {
        await assignmentService.create(formDataToSend);
      }
      
      // Reset form
      resetForm();
      
      // Refresh assignments
      fetchAssignments();
    } catch (err) {
      console.error('Failed to save assignment:', err);
      setError(`Failed to ${editMode ? 'update' : 'create'} assignment. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    try {
      setLoading(true);
      await assignmentService.delete(assignmentId);
      
      // Clear selected assignment if it's the one being deleted
      if (selectedAssignment?.id === assignmentId) {
        setSelectedAssignment(null);
        resetForm();
      }
      
      // Refresh assignments
      fetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      setError('Failed to delete assignment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (assignmentId) => {
    try {
      setLoading(true);
      await assignmentService.updateStatus(assignmentId, 'ARCHIVED');
      
      // Refresh assignments
      fetchAssignments();
    } catch (err) {
      console.error('Failed to archive assignment:', err);
      setError('Failed to archive assignment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject || '',
      dueDate: formatDateForInput(assignment.dueDate),
      totalPoints: assignment.totalPoints || 100,
      assignedTo: assignment.assignedTo || [],
      attachmentUrl: assignment.attachmentUrl || '',
      attachment: null
    });
    
    setSelectedAssignment(assignment);
    setEditMode(true);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      setLoading(true);
      await assignmentService.gradeSubmission(submissionId, grade, feedback);
      
      // Refresh submissions
      if (selectedAssignment) {
        fetchAssignmentSubmissions(selectedAssignment.id);
      }
    } catch (err) {
      console.error('Failed to grade submission:', err);
      setError('Failed to grade submission. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      dueDate: '',
      totalPoints: 100,
      assignedTo: [],
      attachmentUrl: '',
      attachment: null
    });
    
    setSelectedAssignment(null);
    setEditMode(false);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-700 text-gray-300';
      case 'ASSIGNED':
        return 'bg-blue-900 text-blue-200';
      case 'GRADED':
        return 'bg-green-900 text-green-200';
      case 'ARCHIVED':
        return 'bg-purple-900 text-purple-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  const getSubmissionStatusBadgeClass = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-900 text-yellow-200';
      case 'LATE':
        return 'bg-red-900 text-red-200';
      case 'GRADED':
        return 'bg-green-900 text-green-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  const isAssignmentPastDue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-100">Assignment Management</h1>
          <p className="text-primary-300 mt-2">
            Create, assign, and grade student assignments
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editMode) {
              resetForm();
            } else {
              setShowForm(!showForm);
              setEditMode(false);
              setSelectedAssignment(null);
              resetForm();
              setShowSubmissions(false);
            }
          }}
          className="btn btn-primary"
        >
          {showForm && !editMode ? 'Cancel' : 'Create Assignment'}
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

      {/* Create/Edit assignment form */}
      {showForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">
            {editMode ? 'Edit Assignment' : 'Create New Assignment'}
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
                    placeholder="Assignment title"
                    required
                  />
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
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    name="totalPoints"
                    value={formData.totalPoints}
                    onChange={handleInputChange}
                    className="input w-full"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Assign To Students
                  </label>
                  <select
                    multiple
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleStudentSelection}
                    className="input w-full h-24"
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-primary-400 mt-1">
                    Hold Ctrl/Cmd to select multiple students. Leave empty to save as draft.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Attachment
                  </label>
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleInputChange}
                    className="w-full text-primary-300 py-2"
                  />
                  {editMode && formData.attachmentUrl && (
                    <p className="text-xs text-primary-400 mt-1">
                      Current file: {formData.attachmentUrl.split('/').pop()}
                    </p>
                  )}
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
                  className="input w-full h-32"
                  placeholder="Assignment instructions and details..."
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
                {loading ? 'Saving...' : 
                  formData.assignedTo.length > 0 
                    ? (editMode ? 'Update & Assign' : 'Save & Assign') 
                    : (editMode ? 'Update as Draft' : 'Save as Draft')
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submissions view */}
      {showSubmissions && selectedAssignment && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary-100">
              Submissions for: {selectedAssignment.title}
            </h2>
            <button
              onClick={() => {
                setShowSubmissions(false);
                setSelectedAssignmentSubmissions([]);
              }}
              className="btn btn-secondary btn-sm"
            >
              Back to Assignments
            </button>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-primary-300">Loading submissions...</div>
          ) : selectedAssignmentSubmissions.length === 0 ? (
            <div className="p-6 text-center text-primary-300">No submissions found for this assignment.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Submission Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-700">
                  {selectedAssignmentSubmissions.map(submission => (
                    <tr key={submission.id} className="hover:bg-primary-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-200">
                          {submission.studentName}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">
                          {formatDate(submission.submissionDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSubmissionStatusBadgeClass(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {submission.fileUrl ? (
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-300 hover:text-primary-100"
                          >
                            View Submission
                          </a>
                        ) : (
                          <span className="text-primary-400">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {submission.status === 'GRADED' ? (
                          <div className="text-sm text-primary-300">
                            {submission.grade}/{selectedAssignment.totalPoints}
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max={selectedAssignment.totalPoints}
                            className="input input-sm w-16"
                            defaultValue={submission.grade || ''}
                            placeholder="Grade"
                            onChange={(e) => submission.tempGrade = e.target.value}
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {submission.status !== 'GRADED' ? (
                          <button
                            onClick={() => handleGradeSubmission(
                              submission.id, 
                              submission.tempGrade || 0,
                              ''
                            )}
                            className="text-primary-300 hover:text-primary-100"
                            disabled={!submission.tempGrade}
                          >
                            Grade
                          </button>
                        ) : (
                          <span className="text-primary-400">Graded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      {!showSubmissions && (
        <div className="border-b border-primary-700">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`mr-4 py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTab === 'active'
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => setSelectedTab('active')}
            >
              Active
            </button>
            <button
              className={`mr-4 py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTab === 'past'
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => setSelectedTab('past')}
            >
              Past
            </button>
            <button
              className={`mr-4 py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTab === 'draft'
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => setSelectedTab('draft')}
            >
              Drafts
            </button>
            <button
              className={`mr-4 py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => setSelectedTab('all')}
            >
              All
            </button>
          </div>
        </div>
      )}

      {/* Assignments list */}
      {!showSubmissions && (
        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-primary-700">
            <h2 className="text-lg font-semibold text-primary-100">Assignments</h2>
          </div>
          
          {loading && assignments.length === 0 ? (
            <div className="p-6 text-center text-primary-300">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="p-6 text-center text-primary-300">
              No assignments found. {selectedTab === 'active' ? 'Create a new assignment to get started.' : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Submissions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-700">
                  {assignments.map(assignment => (
                    <tr key={assignment.id} className="hover:bg-primary-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-200">{assignment.title}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{assignment.subject || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isAssignmentPastDue(assignment.dueDate) ? 'text-red-400' : 'text-primary-300'}`}>
                          {formatDate(assignment.dueDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">
                          {assignment.submissionCount || 0}/{assignment.assignedCount || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => fetchAssignmentSubmissions(assignment.id)}
                          className="text-primary-300 hover:text-primary-100 mr-3"
                          disabled={assignment.status === 'DRAFT'}
                        >
                          View Submissions
                        </button>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="text-primary-300 hover:text-primary-100 mr-3"
                        >
                          Edit
                        </button>
                        {assignment.status !== 'ARCHIVED' ? (
                          <button
                            onClick={() => handleArchive(assignment.id)}
                            className="text-yellow-400 hover:text-yellow-300 mr-3"
                          >
                            Archive
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDelete(assignment.id)}
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
      )}
    </div>
  );
};

export default AssignmentManagement; 