import React, { useState, useEffect } from 'react';
import { lessonService, resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LessonPlanning = () => {
  const { currentUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [viewLessonDetails, setViewLessonDetails] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    date: '',
    duration: 60,
    objectives: '',
    materials: '',
    procedure: '',
    assessment: '',
    homework: '',
    notes: '',
    attachedResources: []
  });
  const [selectedTab, setSelectedTab] = useState('upcoming');

  useEffect(() => {
    fetchLessons();
    fetchResources();
  }, [selectedTab]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedTab === 'upcoming') {
        response = await lessonService.getUpcomingLessons(currentUser.id);
      } else if (selectedTab === 'past') {
        response = await lessonService.getPastLessons(currentUser.id);
      } else {
        response = await lessonService.getAllLessons(currentUser.id);
      }
      
      setLessons(response.data);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
      setError('Failed to fetch lessons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await resourceService.getTeacherResources(currentUser.id);
      setResources(response.data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to fetch resources. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === 'duration') {
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

  const handleResourceSelection = (e) => {
    const options = e.target.options;
    const selectedResources = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedResources.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      attachedResources: selectedResources
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const lessonData = {
        ...formData,
        teacherId: currentUser.id
      };
      
      if (editMode && selectedLesson) {
        await lessonService.update(selectedLesson.id, lessonData);
      } else {
        await lessonService.create(lessonData);
      }
      
      // Reset form
      resetForm();
      
      // Refresh lessons
      fetchLessons();
    } catch (err) {
      console.error('Failed to save lesson plan:', err);
      setError(`Failed to ${editMode ? 'update' : 'create'} lesson plan. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson plan?')) {
      return;
    }
    
    try {
      setLoading(true);
      await lessonService.delete(lessonId);
      
      // Clear selected lesson if it's the one being deleted
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
        resetForm();
      }
      
      // Refresh lessons
      fetchLessons();
    } catch (err) {
      console.error('Failed to delete lesson plan:', err);
      setError('Failed to delete lesson plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setFormData({
      title: lesson.title,
      subject: lesson.subject || '',
      grade: lesson.grade || '',
      date: formatDateForInput(lesson.date),
      duration: lesson.duration || 60,
      objectives: lesson.objectives || '',
      materials: lesson.materials || '',
      procedure: lesson.procedure || '',
      assessment: lesson.assessment || '',
      homework: lesson.homework || '',
      notes: lesson.notes || '',
      attachedResources: lesson.attachedResources || []
    });
    
    setSelectedLesson(lesson);
    setEditMode(true);
    setShowForm(true);
    setViewLessonDetails(false);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (lesson) => {
    setSelectedLesson(lesson);
    setViewLessonDetails(true);
    setShowForm(false);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const duplicateLesson = (lesson) => {
    const newLesson = {
      ...lesson,
      title: `Copy of ${lesson.title}`,
      date: '',
    };
    
    delete newLesson.id;
    delete newLesson.createdAt;
    delete newLesson.updatedAt;
    
    setFormData({
      title: newLesson.title,
      subject: newLesson.subject || '',
      grade: newLesson.grade || '',
      date: '',
      duration: newLesson.duration || 60,
      objectives: newLesson.objectives || '',
      materials: newLesson.materials || '',
      procedure: newLesson.procedure || '',
      assessment: newLesson.assessment || '',
      homework: newLesson.homework || '',
      notes: newLesson.notes || '',
      attachedResources: newLesson.attachedResources || []
    });
    
    setSelectedLesson(null);
    setEditMode(false);
    setShowForm(true);
    setViewLessonDetails(false);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      grade: '',
      date: '',
      duration: 60,
      objectives: '',
      materials: '',
      procedure: '',
      assessment: '',
      homework: '',
      notes: '',
      attachedResources: []
    });
    
    setSelectedLesson(null);
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

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    } else {
      return `${mins}m`;
    }
  };

  const getLessonStatusClass = (date) => {
    if (!date) return 'bg-gray-700 text-gray-300';
    
    const lessonDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lessonDate.getTime() === today.getTime()) {
      return 'bg-yellow-900 text-yellow-200'; // Today
    } else if (lessonDate < today) {
      return 'bg-gray-700 text-gray-300'; // Past
    } else {
      return 'bg-blue-900 text-blue-200'; // Upcoming
    }
  };

  const getLessonStatusText = (date) => {
    if (!date) return 'No Date';
    
    const lessonDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lessonDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (lessonDate < today) {
      return 'Past';
    } else {
      return 'Upcoming';
    }
  };

  const getResourceById = (resourceId) => {
    return resources.find(resource => resource.id === resourceId) || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-100">Lesson Planning</h1>
          <p className="text-primary-300 mt-2">
            Create and manage your classroom lesson plans
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editMode) {
              resetForm();
            } else {
              setShowForm(!showForm);
              setEditMode(false);
              setSelectedLesson(null);
              resetForm();
              setViewLessonDetails(false);
            }
          }}
          className="btn btn-primary"
        >
          {showForm && !editMode ? 'Cancel' : 'Create Lesson Plan'}
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

      {/* Create/Edit lesson form */}
      {showForm && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">
            {editMode ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Lesson title"
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
                  placeholder="e.g., Mathematics, Science"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Grade/Class
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Grade 8, Class 10"
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
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Attach Resources
                </label>
                <select
                  multiple
                  name="attachedResources"
                  value={formData.attachedResources}
                  onChange={handleResourceSelection}
                  className="input w-full h-24"
                >
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.title} ({resource.type})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-primary-400 mt-1">
                  Hold Ctrl/Cmd to select multiple resources.
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Learning Objectives <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="Describe what students will learn from this lesson"
                  required
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Materials Needed
                </label>
                <textarea
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="List materials needed for the lesson"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Procedure/Activities <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="procedure"
                  value={formData.procedure}
                  onChange={handleInputChange}
                  className="input w-full h-32"
                  placeholder="Step-by-step procedure of the lesson"
                  required
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Assessment/Evaluation
                </label>
                <textarea
                  name="assessment"
                  value={formData.assessment}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="How will you assess student understanding?"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Homework/Assignment
                </label>
                <textarea
                  name="homework"
                  value={formData.homework}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="Homework or assignments to be given"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input w-full h-24"
                  placeholder="Any additional notes or reminders"
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
                {loading ? 'Saving...' : editMode ? 'Update Lesson Plan' : 'Save Lesson Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson details view */}
      {viewLessonDetails && selectedLesson && (
        <div className="bg-primary-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary-100">
              {selectedLesson.title}
            </h2>
            <div>
              <button
                onClick={() => setViewLessonDetails(false)}
                className="btn btn-secondary btn-sm mr-2"
              >
                Back to List
              </button>
              <button
                onClick={() => handleEdit(selectedLesson)}
                className="btn btn-primary btn-sm mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => duplicateLesson(selectedLesson)}
                className="btn btn-secondary btn-sm"
              >
                Duplicate
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-750 p-3 rounded">
              <p className="text-sm text-primary-400">Subject</p>
              <p className="text-primary-200">{selectedLesson.subject || 'N/A'}</p>
            </div>
            <div className="bg-primary-750 p-3 rounded">
              <p className="text-sm text-primary-400">Grade/Class</p>
              <p className="text-primary-200">{selectedLesson.grade || 'N/A'}</p>
            </div>
            <div className="bg-primary-750 p-3 rounded">
              <p className="text-sm text-primary-400">Date & Duration</p>
              <p className="text-primary-200">
                {formatDate(selectedLesson.date)} | {formatDuration(selectedLesson.duration)}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-primary-200 mb-2 border-b border-primary-700 pb-1">
                Learning Objectives
              </h3>
              <p className="text-primary-300 whitespace-pre-wrap">{selectedLesson.objectives || 'None specified'}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-primary-200 mb-2 border-b border-primary-700 pb-1">
                Materials Needed
              </h3>
              <p className="text-primary-300 whitespace-pre-wrap">{selectedLesson.materials || 'None specified'}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-primary-200 mb-2 border-b border-primary-700 pb-1">
                Procedure/Activities
              </h3>
              <p className="text-primary-300 whitespace-pre-wrap">{selectedLesson.procedure || 'None specified'}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-primary-200 mb-2 border-b border-primary-700 pb-1">
                Assessment/Evaluation
              </h3>
              <p className="text-primary-300 whitespace-pre-wrap">{selectedLesson.assessment || 'None specified'}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-primary-200 mb-2 border-b border-primary-700 pb-1">
                Homework/Assignment
              </h3>
              <p className="text-primary-300 whitespace-pre-wrap">{selectedLesson.homework || 'None specified'}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-primary-200 mb-2 border-b border-primary-700 pb-1">
                Additional Notes
              </h3>
              <p className="text-primary-300 whitespace-pre-wrap">{selectedLesson.notes || 'None specified'}</p>
            </div>
            
            {selectedLesson.attachedResources && selectedLesson.attachedResources.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-primary-200 mb-2 border-b border-primary-700 pb-1">
                  Attached Resources
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedLesson.attachedResources.map(resourceId => {
                    const resource = getResourceById(resourceId);
                    return resource ? (
                      <li key={resourceId} className="text-primary-300">
                        <a
                          href={resource.fileUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-300 hover:text-primary-100"
                        >
                          {resource.title} ({resource.type})
                        </a>
                      </li>
                    ) : (
                      <li key={resourceId} className="text-primary-400">
                        Resource not found (ID: {resourceId})
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      {!viewLessonDetails && (
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

      {/* Lessons list */}
      {!viewLessonDetails && (
        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-primary-700">
            <h2 className="text-lg font-semibold text-primary-100">Lesson Plans</h2>
          </div>
          
          {loading && lessons.length === 0 ? (
            <div className="p-6 text-center text-primary-300">Loading lesson plans...</div>
          ) : lessons.length === 0 ? (
            <div className="p-6 text-center text-primary-300">
              No lesson plans found. {selectedTab === 'upcoming' ? 'Create a new lesson plan to get started.' : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Grade/Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-700">
                  {lessons.map(lesson => (
                    <tr key={lesson.id} className="hover:bg-primary-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-200">{lesson.title}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{lesson.subject || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{lesson.grade || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{formatDate(lesson.date)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-300">{formatDuration(lesson.duration)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getLessonStatusClass(lesson.date)}`}>
                          {getLessonStatusText(lesson.date)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(lesson)}
                          className="text-primary-300 hover:text-primary-100 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="text-primary-300 hover:text-primary-100 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => duplicateLesson(lesson)}
                          className="text-primary-300 hover:text-primary-100 mr-3"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
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

export default LessonPlanning; 