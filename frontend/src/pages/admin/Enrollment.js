import React, { useState, useEffect } from 'react';
import { courseService, userService } from '../../services/api';

const CourseCard = ({ course, onManage }) => {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-primary-100">{course.title}</h3>
          <p className="text-sm text-primary-300">Course Code: {course.code}</p>
        </div>
        <button
          onClick={() => onManage(course)}
          className="btn btn-sm btn-primary"
        >
          Manage
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <h4 className="text-primary-300 text-sm">Students</h4>
          <p className="text-lg text-primary-100">{course.enrolledStudents?.length || 0}</p>
        </div>
        <div>
          <h4 className="text-primary-300 text-sm">Department</h4>
          <p className="text-primary-100">{course.department}</p>
        </div>
      </div>
      <div>
        <h4 className="text-primary-300 text-sm mb-1">Teacher</h4>
        <div className="flex items-center">
          {course.teacher ? (
            <span className="text-primary-100">{course.teacher.firstName} {course.teacher.lastName}</span>
          ) : (
            <span className="text-yellow-400">No teacher assigned</span>
          )}
        </div>
      </div>
    </div>
  );
};

const EnrollmentManager = ({ course, students, teachers, onClose, onUpdate }) => {
  const [enrolledStudents, setEnrolledStudents] = useState(course.enrolledStudents || []);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(course.teacher?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  useEffect(() => {
    // Filter out already enrolled students from available students list
    const enrolledIds = new Set(enrolledStudents.map(student => student.id));
    setAvailableStudents(students.filter(student => !enrolledIds.has(student.id)));
  }, [enrolledStudents, students]);
  
  const filteredAvailableStudents = availableStudents.filter(student => 
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEnrollStudent = async (student) => {
    try {
      setLoading(true);
      
      // Make real API call
      await courseService.enrollStudent(course.id, student.id);
      
      // Update local state
      setEnrolledStudents([...enrolledStudents, student]);
      setMessage({ text: `${student.firstName} ${student.lastName} enrolled successfully`, type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      setLoading(false);
    } catch (error) {
      console.error('Failed to enroll student:', error);
      setMessage({ text: 'Failed to enroll student', type: 'error' });
      setLoading(false);
    }
  };
  
  const handleUnenrollStudent = async (studentId) => {
    try {
      setLoading(true);
      
      // Make real API call
      await courseService.unenrollStudent(course.id, studentId);
      
      // Update local state
      setEnrolledStudents(enrolledStudents.filter(student => student.id !== studentId));
      setMessage({ text: 'Student unenrolled successfully', type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      setLoading(false);
    } catch (error) {
      console.error('Failed to unenroll student:', error);
      setMessage({ text: 'Failed to unenroll student', type: 'error' });
      setLoading(false);
    }
  };
  
  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      setMessage({ text: 'Please select a teacher to assign', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Make real API call
      await courseService.updateCourse(course.id, { teacherId: selectedTeacher });
      
      setMessage({ text: 'Teacher assigned successfully', type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      setLoading(false);
    } catch (error) {
      console.error('Failed to assign teacher:', error);
      setMessage({ text: 'Failed to assign teacher', type: 'error' });
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Make real API call to update the course with enrolled students and teacher
      await courseService.updateCourse(course.id, {
        teacherId: selectedTeacher,
        // Other course data may need to be passed as well depending on API
      });
      
      // Find the teacher object that matches the selected ID
      const teacher = teachers.find(t => t.id.toString() === selectedTeacher.toString());
      
      // Update the course object with new data
      const updatedCourse = {
        ...course,
        teacher: teacher || null,
        enrolledStudents
      };
      
      onUpdate(updatedCourse);
      onClose();
      setLoading(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      setMessage({ text: 'Failed to save changes', type: 'error' });
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-primary-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-100">
            Manage Course: {course.title}
          </h2>
          <button
            onClick={onClose}
            className="text-primary-300 hover:text-primary-100"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {message.text && (
          <div className={`px-6 py-3 ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
            {message.text}
          </div>
        )}
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Teacher Assignment Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-primary-100 mb-4">Assign Teacher</h3>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label htmlFor="teacherSelect" className="block text-primary-300 mb-2">Select Teacher</label>
                <select
                  id="teacherSelect"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="input w-full"
                >
                  <option value="">-- Select a Teacher --</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} - {teacher.department}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAssignTeacher}
                className="btn btn-primary"
                disabled={loading}
              >
                Assign
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrolled Students Section */}
            <div>
              <h3 className="text-lg font-medium text-primary-100 mb-4">
                Enrolled Students ({enrolledStudents.length})
              </h3>
              
              {enrolledStudents.length === 0 ? (
                <div className="card p-4 text-center text-primary-300">
                  No students enrolled yet
                </div>
              ) : (
                <div className="card p-2 max-h-96 overflow-y-auto">
                  {enrolledStudents.map(student => (
                    <div 
                      key={student.id} 
                      className="flex justify-between items-center p-3 border-b border-primary-800 last:border-b-0"
                    >
                      <div>
                        <p className="text-primary-100">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-primary-300">{student.email}</p>
                      </div>
                      <button
                        onClick={() => handleUnenrollStudent(student.id)}
                        className="text-red-400 hover:text-red-300"
                        disabled={loading}
                        title="Unenroll"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Available Students Section */}
            <div>
              <h3 className="text-lg font-medium text-primary-100 mb-4">
                Available Students
              </h3>
              
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full"
                />
              </div>
              
              {filteredAvailableStudents.length === 0 ? (
                <div className="card p-4 text-center text-primary-300">
                  {searchTerm ? 'No students match your search' : 'No students available'}
                </div>
              ) : (
                <div className="card p-2 max-h-96 overflow-y-auto">
                  {filteredAvailableStudents.map(student => (
                    <div 
                      key={student.id} 
                      className="flex justify-between items-center p-3 border-b border-primary-800 last:border-b-0"
                    >
                      <div>
                        <p className="text-primary-100">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-primary-300">{student.email}</p>
                      </div>
                      <button
                        onClick={() => handleEnrollStudent(student)}
                        className="text-green-400 hover:text-green-300"
                        disabled={loading}
                        title="Enroll"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-primary-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn bg-primary-800 text-primary-300 hover:bg-primary-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EnrollmentManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    averageEnrollment: 0
  });

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchEnrolledStudents(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Make real API call
      const response = await courseService.getAll();
      const courseData = response.data || [];
      setCourses(courseData);
      
      // If no course is selected and we have courses, select the first one
      if (!selectedCourse && courseData.length > 0) {
        setSelectedCourse(courseData[0]);
      }
      
      // Calculate course statistics
      const totalEnrollments = courseData.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
      const averageEnrollment = courseData.length > 0 ? totalEnrollments / courseData.length : 0;
      
      setStats({
        totalCourses: courseData.length,
        totalEnrollments,
        averageEnrollment: parseFloat(averageEnrollment.toFixed(2))
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setMessage({
        text: 'Failed to load courses. Please try again.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Make real API call to get all students
      const response = await userService.getByRole('STUDENT');
      setStudents(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setMessage({
        text: 'Failed to load students. Please try again.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async (courseId) => {
    setCourseLoading(true);
    try {
      // Make real API call to get enrolled students for a course
      const response = await courseService.getStudentsByCourse(courseId);
      setEnrolledStudents(response.data || []);
      setCourseLoading(false);
    } catch (error) {
      console.error('Failed to fetch enrolled students:', error);
      setMessage({
        text: 'Failed to load enrolled students. Please try again.',
        type: 'error'
      });
      setCourseLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      // Make real API call
      const response = await courseService.createCourse(courseData);
      
      // Add the new course to state
      const newCourse = response.data;
      setCourses([...courses, newCourse]);
      
      // Update statistics
      setStats({
        ...stats,
        totalCourses: stats.totalCourses + 1,
        // Enrollment count for new course is 0
        averageEnrollment: parseFloat((stats.totalEnrollments / (stats.totalCourses + 1)).toFixed(2))
      });
      
      setMessage({
        text: 'Course created successfully',
        type: 'success'
      });
      
      // Close modal
      setShowAddCourseModal(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to create course:', error);
      setMessage({
        text: 'Failed to create course. Please try again.',
        type: 'error'
      });
    }
  };

  const handleUpdateCourse = async (courseId, updatedData) => {
    try {
      // Make real API call
      const response = await courseService.updateCourse(courseId, updatedData);
      
      // Update the course in state
      const updatedCourse = response.data;
      setCourses(courses.map(course => 
        course.id === courseId ? updatedCourse : course
      ));
      
      // If this was the selected course, update it
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse(updatedCourse);
      }
      
      setMessage({
        text: 'Course updated successfully',
        type: 'success'
      });
      
      // Close modal
      setShowEditCourseModal(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to update course:', error);
      setMessage({
        text: 'Failed to update course. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      // Make real API call
      await courseService.delete(courseId);
      
      // Find the course to get enrollment count
      const deletedCourse = courses.find(course => course.id === courseId);
      const enrollmentCount = deletedCourse?.enrollmentCount || 0;
      
      // Remove course from state
      const updatedCourses = courses.filter(course => course.id !== courseId);
      setCourses(updatedCourses);
      
      // Update statistics
      const newTotalEnrollments = stats.totalEnrollments - enrollmentCount;
      const newTotalCourses = stats.totalCourses - 1;
      
      setStats({
        ...stats,
        totalCourses: newTotalCourses,
        totalEnrollments: newTotalEnrollments,
        averageEnrollment: newTotalCourses > 0 ? parseFloat((newTotalEnrollments / newTotalCourses).toFixed(2)) : 0
      });
      
      // If the deleted course was selected, select another one
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse(updatedCourses.length > 0 ? updatedCourses[0] : null);
      }
      
      setMessage({
        text: 'Course deleted successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to delete course:', error);
      setMessage({
        text: 'Failed to delete course. Please try again.',
        type: 'error'
      });
    }
  };

  const handleEnrollStudent = async (studentId) => {
    if (!selectedCourse) return;
    
    try {
      // Make real API call
      await courseService.enrollStudent(selectedCourse.id, studentId);
      
      // Fetch updated list of enrolled students
      fetchEnrolledStudents(selectedCourse.id);
      
      // Update the enrollment count in the selected course
      const updatedCourse = {
        ...selectedCourse,
        enrollmentCount: (selectedCourse.enrollmentCount || 0) + 1
      };
      
      // Update the course in the courses list
      setCourses(courses.map(course => 
        course.id === selectedCourse.id ? updatedCourse : course
      ));
      
      // Update selected course
      setSelectedCourse(updatedCourse);
      
      // Update statistics
      setStats({
        ...stats,
        totalEnrollments: stats.totalEnrollments + 1,
        averageEnrollment: parseFloat((stats.totalEnrollments + 1) / stats.totalCourses).toFixed(2)
      });
      
      setMessage({
        text: 'Student enrolled successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to enroll student:', error);
      setMessage({
        text: 'Failed to enroll student. Please try again.',
        type: 'error'
      });
    }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!selectedCourse) return;
    
    try {
      // Make real API call
      await courseService.unenrollStudent(selectedCourse.id, studentId);
      
      // Remove student from enrolled students list
      setEnrolledStudents(enrolledStudents.filter(student => student.id !== studentId));
      
      // Update the enrollment count in the selected course
      const updatedCourse = {
        ...selectedCourse,
        enrollmentCount: Math.max(0, (selectedCourse.enrollmentCount || 0) - 1)
      };
      
      // Update the course in the courses list
      setCourses(courses.map(course => 
        course.id === selectedCourse.id ? updatedCourse : course
      ));
      
      // Update selected course
      setSelectedCourse(updatedCourse);
      
      // Update statistics
      setStats({
        ...stats,
        totalEnrollments: stats.totalEnrollments - 1,
        averageEnrollment: parseFloat((stats.totalEnrollments - 1) / stats.totalCourses).toFixed(2)
      });
      
      setMessage({
        text: 'Student unenrolled successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to unenroll student:', error);
      setMessage({
        text: 'Failed to unenroll student. Please try again.',
        type: 'error'
      });
    }
  };

  const handleEditCourse = (course) => {
    setCourseToEdit(course);
    setShowEditCourseModal(true);
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => {
    if (!course) return false;
    
    const title = course.title || '';
    const code = course.code || '';
    const department = course.department || '';
    const term = searchTerm || '';
    
    return title.toLowerCase().includes(term.toLowerCase()) ||
           code.toLowerCase().includes(term.toLowerCase()) ||
           department.toLowerCase().includes(term.toLowerCase());
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-100">Course Enrollment Management</h1>
      </div>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
          {message.text}
        </div>
      )}
      
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex-1">
            <label htmlFor="search" className="block text-primary-300 mb-2">Search Courses</label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, code, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card p-8 text-center text-primary-300">
          {searchTerm ? 'No courses match your search criteria.' : 'No courses found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onManage={handleEditCourse}
            />
          ))}
        </div>
      )}
      
      {selectedCourse && (
        <EnrollmentManager
          course={selectedCourse}
          students={students}
          teachers={[]}
          onClose={() => setSelectedCourse(null)}
          onUpdate={handleUpdateCourse}
        />
      )}
    </div>
  );
};

export default EnrollmentManagementPage; 