import React, { useState, useEffect } from 'react';
import { courseService, userService } from '../../services/api';

const EnrollmentManagement = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  useEffect(() => {
    fetchCoursesAndStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchEnrolledStudents(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (students.length > 0 && enrolledStudents.length >= 0) {
      updateAvailableStudents();
    }
  }, [students, enrolledStudents, searchTerm]);

  const fetchCoursesAndStudents = async () => {
    setLoading(true);
    try {
      // Fetch all courses
      const coursesResponse = await courseService.getAll();
      const coursesData = coursesResponse.data || [];
      setCourses(coursesData);
      
      // Fetch all students
      const studentsResponse = await userService.getByRole('STUDENT');
      setStudents(studentsResponse.data || []);

      // Select first course by default if available
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load courses and students. Please try again later.');
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async (courseId) => {
    try {
      const response = await courseService.getStudentsByCourse(courseId);
      setEnrolledStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      setError('Failed to load enrolled students. Please try again later.');
    }
  };

  const updateAvailableStudents = () => {
    // Get IDs of enrolled students
    const enrolledIds = enrolledStudents.map(student => student.id);
    
    // Filter available students - those who are not already enrolled
    let available = students.filter(student => !enrolledIds.includes(student.id));
    
    // Apply search filter if search term exists
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      available = available.filter(student => 
        student.fullName.toLowerCase().includes(search) ||
        student.username.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search)
      );
    }
    
    setAvailableStudents(available);
  };

  const handleCourseSelect = (e) => {
    const courseId = parseInt(e.target.value, 10);
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEnrollStudent = async (studentId) => {
    if (!selectedCourse) return;
    
    try {
      await courseService.enrollStudent(selectedCourse.id, studentId);
      
      // Refresh enrolled students list
      await fetchEnrolledStudents(selectedCourse.id);
      
      setActionResult({
        type: 'success',
        message: 'Student enrolled successfully!'
      });
      
      // Clear action result after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error enrolling student:', error);
      setActionResult({
        type: 'error',
        message: `Failed to enroll student: ${error.response?.data?.message || 'Unknown error'}`
      });
    }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!selectedCourse) return;
    
    try {
      await courseService.unenrollStudent(selectedCourse.id, studentId);
      
      // Refresh enrolled students list
      await fetchEnrolledStudents(selectedCourse.id);
      
      setActionResult({
        type: 'success',
        message: 'Student unenrolled successfully!'
      });
      
      // Clear action result after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error unenrolling student:', error);
      setActionResult({
        type: 'error',
        message: `Failed to unenroll student: ${error.response?.data?.message || 'Unknown error'}`
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary-100 mb-8">Enrollment Management</h1>
      
      {actionResult && (
        <div className={`p-4 mb-6 rounded ${actionResult.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {actionResult.message}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <div>
          {/* Course Selection */}
          <div className="mb-8">
            <label className="block text-primary-300 mb-2" htmlFor="courseSelect">
              Select Course
            </label>
            <select
              id="courseSelect"
              className="w-full md:w-1/2 p-3 bg-primary-800 border border-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedCourse?.id || ''}
              onChange={handleCourseSelect}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enrolled Students */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary-100">
                    Enrolled Students ({enrolledStudents.length} / {selectedCourse.capacity || 'Unlimited'})
                  </h2>
                </div>
                
                <div className="bg-primary-800 rounded-lg shadow overflow-hidden">
                  {enrolledStudents.length === 0 ? (
                    <div className="p-6 text-center text-primary-300">
                      No students enrolled in this course yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-primary-700">
                      {enrolledStudents.map(student => (
                        <li key={student.id} className="p-4 hover:bg-primary-700/50 flex justify-between items-center">
                          <div>
                            <div className="text-primary-100 font-medium">{student.fullName}</div>
                            <div className="text-primary-400 text-sm">{student.email}</div>
                          </div>
                          <button
                            onClick={() => handleUnenrollStudent(student.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Unenroll
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Available Students */}
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-primary-100 mb-2">Available Students</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search students..."
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
                </div>
                
                <div className="bg-primary-800 rounded-lg shadow overflow-hidden">
                  {availableStudents.length === 0 ? (
                    <div className="p-6 text-center text-primary-300">
                      {searchTerm ? 
                        "No students found matching your search criteria." : 
                        "All students are already enrolled in this course."}
                    </div>
                  ) : (
                    <ul className="divide-y divide-primary-700">
                      {availableStudents.map(student => (
                        <li key={student.id} className="p-4 hover:bg-primary-700/50 flex justify-between items-center">
                          <div>
                            <div className="text-primary-100 font-medium">{student.fullName}</div>
                            <div className="text-primary-400 text-sm">{student.email}</div>
                          </div>
                          <button
                            onClick={() => handleEnrollStudent(student.id)}
                            className="text-green-400 hover:text-green-300"
                            disabled={enrolledStudents.length >= selectedCourse.capacity}
                          >
                            Enroll
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement; 