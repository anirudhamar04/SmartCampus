import React, { useState, useEffect } from 'react';
import { examService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ExamManagement = () => {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    totalMarks: 100,
    passingMarks: 40,
    examinees: [], // Student IDs
    questionPaperUrl: '',
    questionPaper: null,
    instructions: ''
  });
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [showResults, setShowResults] = useState(false);
  const [examResults, setExamResults] = useState([]);

  // Constants for exam status
  const statusOptions = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, [selectedTab]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedTab === 'upcoming') {
        response = await examService.getUpcomingExams(currentUser.id);
      } else if (selectedTab === 'past') {
        response = await examService.getPastExams(currentUser.id);
      } else if (selectedTab === 'cancelled') {
        response = await examService.getCancelledExams(currentUser.id);
      } else {
        response = await examService.getAllExams(currentUser.id);
      }
      
      setExams(response.data);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError('Failed to fetch exams. Please try again later.');
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

  const fetchExamResults = async (examId) => {
    try {
      setLoading(true);
      const response = await examService.getExamResults(examId);
      setExamResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to fetch exam results:', err);
      setError('Failed to fetch exam results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        questionPaper: files[0]
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'totalMarks' || name === 'passingMarks') {
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
      examinees: selectedStudents
    });
  };

  const validateForm = () => {
    // Check if end time is after start time
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    
    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return false;
    }
    
    // Check if date is in the past
    const examDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (examDate < today) {
      setError('Exam date cannot be in the past.');
      return false;
    }
    
    // Check if passing marks are less than total marks
    if (formData.passingMarks > formData.totalMarks) {
      setError('Passing marks cannot be greater than total marks.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'questionPaper' && formData.questionPaper) {
          formDataToSend.append('questionPaper', formData.questionPaper);
        } else if (key === 'examinees') {
          // Handle array of student IDs
          formData.examinees.forEach(studentId => {
            formDataToSend.append('examinees', studentId);
          });
        } else if (key !== 'questionPaper') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add teacher ID
      formDataToSend.append('teacherId', currentUser.id);
      
      // Determine status as SCHEDULED by default for new exams
      if (!editMode) {
        formDataToSend.append('status', 'SCHEDULED');
      }
      
      if (editMode && selectedExam) {
        await examService.update(selectedExam.id, formDataToSend);
      } else {
        await examService.create(formDataToSend);
      }
      
      // Reset form
      resetForm();
      
      // Refresh exams
      fetchExams();
    } catch (err) {
      console.error('Failed to save exam:', err);
      setError(`Failed to ${editMode ? 'update' : 'create'} exam. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }
    
    try {
      setLoading(true);
      await examService.delete(examId);
      
      // Clear selected exam if it's the one being deleted
      if (selectedExam?.id === examId) {
        setSelectedExam(null);
        resetForm();
      }
      
      // Refresh exams
      fetchExams();
    } catch (err) {
      console.error('Failed to delete exam:', err);
      setError('Failed to delete exam. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelExam = async (examId) => {
    if (!window.confirm('Are you sure you want to cancel this exam?')) {
      return;
    }
    
    try {
      setLoading(true);
      await examService.updateStatus(examId, 'CANCELLED');
      
      // Refresh exams
      fetchExams();
    } catch (err) {
      console.error('Failed to cancel exam:', err);
      setError('Failed to cancel exam. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exam) => {
    setFormData({
      title: exam.title,
      description: exam.description || '',
      subject: exam.subject || '',
      date: formatDateForInput(exam.date),
      startTime: exam.startTime || '',
      endTime: exam.endTime || '',
      location: exam.location || '',
      totalMarks: exam.totalMarks || 100,
      passingMarks: exam.passingMarks || 40,
      examinees: exam.examinees || [],
      questionPaperUrl: exam.questionPaperUrl || '',
      questionPaper: null,
      instructions: exam.instructions || ''
    });
    
    setSelectedExam(exam);
    setEditMode(true);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateResult = async (resultId, marks, remarks) => {
    try {
      setLoading(true);
      await examService.updateResult(resultId, marks, remarks);
      
      // Refresh results
      if (selectedExam) {
        fetchExamResults(selectedExam.id);
      }
    } catch (err) {
      console.error('Failed to update result:', err);
      setError('Failed to update result. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      totalMarks: 100,
      passingMarks: 40,
      examinees: [],
      questionPaperUrl: '',
      questionPaper: null,
      instructions: ''
    });
    
    setSelectedExam(null);
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // If it's already in HH:MM format
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's an ISO date string
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-900 text-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-900 text-yellow-200';
      case 'COMPLETED':
        return 'bg-green-900 text-green-200';
      case 'CANCELLED':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-primary-800 text-primary-200';
    }
  };

  const determineExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    const startTime = new Date(`${exam.date}T${exam.startTime}`);
    const endTime = new Date(`${exam.date}T${exam.endTime}`);
    
    if (exam.status === 'CANCELLED') {
      return 'CANCELLED';
    }
    
    if (now > endTime) {
      return 'COMPLETED';
    }
    
    if (now >= startTime && now <= endTime) {
      return 'IN_PROGRESS';
    }
    
    return 'SCHEDULED';
  };

  const getResultStatusBadgeClass = (marks, passingMarks) => {
    if (marks >= passingMarks) {
      return 'bg-green-900 text-green-200';
    } else {
      return 'bg-red-900 text-red-200';
    }
  };

  const isExamEditable = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    const startTime = new Date(`${exam.date}T${exam.startTime}`);
    
    return exam.status !== 'CANCELLED' && now < startTime;
  };

  const isExamCancellable = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    const startTime = new Date(`${exam.date}T${exam.startTime}`);
    
    return exam.status !== 'CANCELLED' && now < startTime;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-100">Exam Management</h1>
          <p className="text-primary-300 mt-2">
            Schedule, organize, and grade student exams
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editMode) {
              resetForm();
            } else {
              setShowForm(!showForm);
              setEditMode(false);
              setSelectedExam(null);
              resetForm();
              setShowResults(false);
            }
          }}
          className="btn btn-primary"
        >
          {showForm && !editMode ? 'Cancel' : 'Schedule Exam'}
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

      {/* Create/Edit exam form */}
      {showForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">
            {editMode ? 'Edit Exam' : 'Schedule New Exam'}
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
                    placeholder="Exam title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Subject (e.g., Mathematics, Science)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="input w-full"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Exam location"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">
                      Total Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      className="input w-full"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">
                      Passing Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={formData.passingMarks}
                      onChange={handleInputChange}
                      className="input w-full"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Question Paper
                  </label>
                  <input
                    type="file"
                    name="questionPaper"
                    onChange={handleInputChange}
                    className="w-full text-primary-300 py-2"
                  />
                  {editMode && formData.questionPaperUrl && (
                    <p className="text-xs text-primary-400 mt-1">
                      Current file: {formData.questionPaperUrl.split('/').pop()}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Assign To Students <span className="text-red-500">*</span>
                  </label>
                  <select
                    multiple
                    name="examinees"
                    value={formData.examinees}
                    onChange={handleStudentSelection}
                    className="input w-full h-24"
                    required
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-primary-400 mt-1">
                    Hold Ctrl/Cmd to select multiple students.
                  </p>
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
                  placeholder="Exam description and syllabus..."
                  required
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Instructions for Students
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="Instructions for students (e.g., bring calculators, no phones allowed)"
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
                {loading ? 'Saving...' : editMode ? 'Update Exam' : 'Schedule Exam'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exam results view */}
      {showResults && selectedExam && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary-100">
              Results for: {selectedExam.title}
            </h2>
            <button
              onClick={() => {
                setShowResults(false);
                setExamResults([]);
              }}
              className="btn btn-secondary btn-sm"
            >
              Back to Exams
            </button>
          </div>
          
          <div className="bg-primary-750 p-3 rounded mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-primary-400">Subject</p>
                <p className="text-primary-200">{selectedExam.subject}</p>
              </div>
              <div>
                <p className="text-sm text-primary-400">Date & Time</p>
                <p className="text-primary-200">
                  {formatDate(selectedExam.date)} | {formatTime(selectedExam.startTime)} - {formatTime(selectedExam.endTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-primary-400">Marks</p>
                <p className="text-primary-200">
                  Total: {selectedExam.totalMarks} | Passing: {selectedExam.passingMarks}
                </p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-primary-300">Loading results...</div>
          ) : examResults.length === 0 ? (
            <div className="p-6 text-center text-primary-300">No results found for this exam.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Percentage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Remarks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-700">
                  {examResults.map(result => (
                    <tr key={result.id} className="hover:bg-primary-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-200">
                          {result.studentName}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.status === 'ABSENT' 
                            ? 'bg-red-900 text-red-200'
                            : result.marks >= selectedExam.passingMarks
                              ? 'bg-green-900 text-green-200'
                              : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {result.status === 'ABSENT' 
                            ? 'Absent' 
                            : result.marks >= selectedExam.passingMarks
                              ? 'Pass'
                              : 'Fail'
                          }
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {result.status !== 'ABSENT' ? (
                          result.isGraded ? (
                            <div className="text-sm text-primary-300">
                              {result.marks}/{selectedExam.totalMarks}
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={selectedExam.totalMarks}
                              className="input input-sm w-16"
                              defaultValue={result.marks || ''}
                              placeholder="Marks"
                              onChange={(e) => result.tempMarks = e.target.value}
                            />
                          )
                        ) : (
                          <span className="text-primary-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {result.status !== 'ABSENT' && result.isGraded ? (
                          <div className="text-sm text-primary-300">
                            {((result.marks / selectedExam.totalMarks) * 100).toFixed(2)}%
                          </div>
                        ) : (
                          <span className="text-primary-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {result.isGraded ? (
                          <div className="text-sm text-primary-300">
                            {result.remarks || '-'}
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="input input-sm w-full"
                            placeholder="Remarks"
                            onChange={(e) => result.tempRemarks = e.target.value}
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {!result.isGraded && result.status !== 'ABSENT' ? (
                          <button
                            onClick={() => handleUpdateResult(
                              result.id, 
                              result.tempMarks || 0,
                              result.tempRemarks || ''
                            )}
                            className="text-primary-300 hover:text-primary-100"
                            disabled={!result.tempMarks}
                          >
                            Save Marks
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateResult(
                              result.id, 
                              null,
                              null
                            )}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            Edit
                          </button>
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
      {!showResults && (
        <div className="border-b border-primary-700">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`mr-4 py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTab === 'upcoming'
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => setSelectedTab('upcoming')}
            >
              Upcoming
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
                selectedTab === 'cancelled'
                  ? 'border-primary-500 text-primary-100'
                  : 'border-transparent text-primary-400 hover:text-primary-300 hover:border-primary-700'
              }`}
              onClick={() => setSelectedTab('cancelled')}
            >
              Cancelled
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

      {/* Exams list */}
      {!showResults && (
        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-primary-700">
            <h2 className="text-lg font-semibold text-primary-100">Exams</h2>
          </div>
          
          {loading && exams.length === 0 ? (
            <div className="p-6 text-center text-primary-300">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="p-6 text-center text-primary-300">
              No exams found. {selectedTab === 'upcoming' ? 'Schedule a new exam to get started.' : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-700">
                  {exams.map(exam => (
                    <tr key={exam.id} className="hover:bg-primary-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-200">{exam.title}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{exam.subject}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{formatDate(exam.date)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">
                          {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{exam.location}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(determineExamStatus(exam))}`}>
                          {determineExamStatus(exam)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {exam.status === 'COMPLETED' || (determineExamStatus(exam) === 'COMPLETED') ? (
                          <button
                            onClick={() => fetchExamResults(exam.id)}
                            className="text-primary-300 hover:text-primary-100 mr-3"
                          >
                            View Results
                          </button>
                        ) : null}
                        
                        {exam.questionPaperUrl && (
                          <a
                            href={exam.questionPaperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-300 hover:text-primary-100 mr-3"
                          >
                            View Paper
                          </a>
                        )}
                        
                        {isExamEditable(exam) && (
                          <button
                            onClick={() => handleEdit(exam)}
                            className="text-primary-300 hover:text-primary-100 mr-3"
                          >
                            Edit
                          </button>
                        )}
                        
                        {isExamCancellable(exam) && (
                          <button
                            onClick={() => handleCancelExam(exam.id)}
                            className="text-yellow-400 hover:text-yellow-300 mr-3"
                          >
                            Cancel
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(exam.id)}
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

export default ExamManagement; 