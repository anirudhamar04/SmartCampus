import React, { useState, useEffect } from 'react';
import { courseService, userService } from '../../services/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    courseCode: '',
    description: '',
    department: '',
    credits: 3,
    semester: 'FALL_2023',
    startDate: '',
    endDate: '',
    capacity: 30,
    location: '',
    schedule: '',
    assignedTeachers: []
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, semesterFilter, courses]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await courseService.getAll();
      setCourses(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await userService.getByRole('TEACHER');
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    
    // Filter by semester
    if (semesterFilter !== 'ALL') {
      filtered = filtered.filter(course => course.semester === semesterFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(search) ||
        course.courseCode.toLowerCase().includes(search) ||
        course.department?.toLowerCase().includes(search)
      );
    }
    
    setFilteredCourses(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSemesterFilterChange = (e) => {
    setSemesterFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle special case for credits and capacity which should be numbers
    if (name === 'credits' || name === 'capacity') {
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

  const handleTeacherSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => {
      const teacherId = parseInt(option.value, 10);
      const teacher = teachers.find(t => t.id === teacherId);
      return {
        id: teacherId,
        fullName: teacher.fullName,
        username: teacher.username,
        email: teacher.email,
        role: teacher.role
      };
    });
    
    setFormData({
      ...formData,
      assignedTeachers: selectedOptions
    });
  };

  const openCreateModal = () => {
    setCurrentCourse(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    setFormData({
      name: '',
      courseCode: '',
      description: '',
      department: '',
      credits: 3,
      semester: 'FALL_2023',
      startDate: today,
      endDate: nextYear.toISOString().split('T')[0],
      capacity: 30,
      location: '',
      schedule: '',
      assignedTeachers: []
    });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setCurrentCourse(course);
    setFormData({
      name: course.name,
      courseCode: course.courseCode,
      description: course.description || '',
      department: course.department || '',
      credits: course.credits || 3,
      semester: course.semester || 'FALL_2023',
      startDate: course.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: course.endDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      capacity: course.capacity || 30,
      location: course.location || '',
      schedule: course.schedule || '',
      assignedTeachers: course.assignedTeachers || []
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCourse(null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentCourse) {
        // Update existing course
        await courseService.update(currentCourse.id, formData);
        setMessage({ type: 'success', text: 'Course updated successfully!' });
      } else {
        // Create new course
        await courseService.create(formData);
        setMessage({ type: 'success', text: 'Course created successfully!' });
      }
      
      // Refresh the course list
      fetchCourses();
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error('Error saving course:', error);
      setMessage({
        type: 'error',
        text: `Failed to ${currentCourse ? 'update' : 'create'} course. ${error.response?.data?.message || 'Please try again.'}`
      });
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await courseService.delete(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
        alert(`Failed to delete course: ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary-100">Course Management</h1>
        <button 
          onClick={openCreateModal}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
          Create New Course
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search courses..."
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
        <select
          className="p-3 bg-primary-800 border border-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
          value={semesterFilter}
          onChange={handleSemesterFilterChange}
        >
          <option value="ALL">All Semesters</option>
          <option value="FALL_2023">Fall 2023</option>
          <option value="SPRING_2024">Spring 2024</option>
          <option value="SUMMER_2024">Summer 2024</option>
          <option value="FALL_2024">Fall 2024</option>
        </select>
      </div>

      {/* Course Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-primary-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-primary-700">
            <thead className="bg-primary-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Course Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Enrolled</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-primary-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-100">{course.courseCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{course.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{course.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{course.semester}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{course.credits}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{course.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-300">{course.enrollmentCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(course)} 
                        className="text-primary-300 hover:text-primary-100 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)} 
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-primary-300">
                    No courses found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Course Form Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-70" onClick={closeModal}></div>
          <div className="relative bg-primary-800 rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-primary-100 mb-4">
                {currentCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="name">
                      Course Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="courseCode">
                      Course Code
                    </label>
                    <input
                      type="text"
                      id="courseCode"
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      required
                    />
                  </div>
                
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="department">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="semester">
                      Semester
                    </label>
                    <select
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      required
                    >
                      <option value="FALL_2023">Fall 2023</option>
                      <option value="SPRING_2024">Spring 2024</option>
                      <option value="SUMMER_2024">Summer 2024</option>
                      <option value="FALL_2024">Fall 2024</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="credits">
                      Credits
                    </label>
                    <input
                      type="number"
                      id="credits"
                      name="credits"
                      value={formData.credits}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      min="1"
                      max="6"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="capacity">
                      Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="location">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-primary-300 mb-2" htmlFor="schedule">
                      Schedule
                    </label>
                    <input
                      type="text"
                      id="schedule"
                      name="schedule"
                      value={formData.schedule}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                      placeholder="e.g., MWF 10:00-11:15"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-primary-300 mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-primary-300 mb-2" htmlFor="assignedTeachers">
                    Assigned Teachers
                  </label>
                  <select
                    id="assignedTeachers"
                    name="assignedTeachers"
                    multiple
                    value={formData.assignedTeachers.map(t => t.id)}
                    onChange={handleTeacherSelection}
                    className="w-full p-2 bg-primary-700 border border-primary-600 rounded"
                    size="4"
                  >
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-primary-400 mt-1">Hold Ctrl/Cmd to select multiple teachers</p>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-primary-700 text-primary-300 rounded hover:bg-primary-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500"
                  >
                    {currentCourse ? 'Update Course' : 'Create Course'}
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

export default CourseManagement; 