import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService, courseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AttendanceManagement = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  
  // Status options for attendance
  const statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE'];

  // Fetch teacher's courses on component mount
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getMyCourses();
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to fetch your courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, []);

  const fetchEnrolledStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getStudentsByCourse(selectedCourse);
      setStudents(response.data);
      
      // Initialize attendance data for each student
      const initialAttendanceData = response.data.map(student => ({
        userId: student.id,
        status: 'PRESENT',
        checkInTime: new Date().toISOString(),
        location: 'Classroom',
        remarks: ''
      }));
      
      setAttendanceData(initialAttendanceData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch enrolled students:', err);
      setError('Failed to fetch enrolled students. Please try again later.');
      setLoading(false);
    }
  }, [selectedCourse]);

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchEnrolledStudents();
    }
  }, [selectedCourse, fetchEnrolledStudents]);

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      // Convert date to start and end of day
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      
      console.log('Fetching attendance records between:', start.toISOString(), 'and', end.toISOString());
      
      const response = await attendanceService.getByDateRange(
        start.toISOString(),
        end.toISOString()
      );
      
      console.log('Attendance records response:', response.data);
      
      // Filter attendance records for the selected course
      const filteredRecords = response.data.filter(record => 
        record.courseId.toString() === selectedCourse.toString()
      );
      
      console.log('Filtered attendance records for course:', filteredRecords);
      
      setAttendanceRecords(filteredRecords);
      
      // Pre-fill attendance data with existing records only if not already set
      // This prevents resetting student data when just refreshing records
      if (filteredRecords.length > 0 && students.length > 0 && 
          (attendanceData.length === 0 || attendanceData.every(record => !record.id))) {
        const updatedAttendanceData = students.map(student => {
          // Backend uses studentId not userId
          const existingRecord = filteredRecords.find(record => 
            record.studentId.toString() === student.id.toString()
          );
          
          if (existingRecord) {
            return {
              id: existingRecord.id,
              userId: student.id,
              status: existingRecord.status,
              checkInTime: existingRecord.date,
              location: 'Classroom',
              remarks: existingRecord.remarks || ''
            };
          } else {
            return {
              userId: student.id,
              status: 'PRESENT',
              checkInTime: new Date().toISOString(),
              location: 'Classroom',
              remarks: ''
            };
          }
        });
        
        setAttendanceData(updatedAttendanceData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch attendance records:', err);
      setError('Failed to fetch attendance records. Please try again later.');
      setLoading(false);
    }
  }, [selectedCourse, selectedDate, students]);

  // Fetch existing attendance records when date or course changes
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchAttendanceRecords();
    }
  }, [selectedCourse, selectedDate, fetchAttendanceRecords]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleAttendanceChange = (studentIndex, field, value) => {
    setAttendanceData(prevData => {
      const newData = [...prevData];
      newData[studentIndex] = {
        ...newData[studentIndex],
        [field]: value
      };
      return newData;
    });
  };

  const submitAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create/update attendance records for each student
      const promises = attendanceData.map(record => {
        // Format date properly - convert from YYYY-MM-DD to full ISO date
        const dateObj = new Date(selectedDate);
        dateObj.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        
        const formattedDate = dateObj.toISOString();
        
        // Prepare data with correct field names for the backend
        const attendancePayload = {
          studentId: record.userId, // Convert userId to studentId
          courseId: selectedCourse,
          date: formattedDate,      // Use date instead of attendanceDate
          status: record.status,
          remarks: record.remarks || '',
          recordedById: currentUser.id
        };
        
        // If record has an ID, it already exists and needs to be updated
        if (record.id) {
          console.log('Updating attendance record:', record.id, attendancePayload);
          return attendanceService.update(record.id, attendancePayload);
        } else {
          // Otherwise create new record
          console.log('Creating new attendance record:', attendancePayload);
          return attendanceService.create(attendancePayload);
        }
      });
      
      const results = await Promise.all(promises);
      console.log('Attendance update results:', results);
      
      // Update the attendance data with new IDs from created records
      // but don't reload the full student list
      const updatedAttendanceData = attendanceData.map((record, index) => {
        if (!record.id && results[index]?.data?.id) {
          return {
            ...record,
            id: results[index].data.id
          };
        }
        return record;
      });
      
      setAttendanceData(updatedAttendanceData);
      
      // Update attendance records display without reloading all student data
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      
      const updatedRecords = await attendanceService.getByDateRange(
        start.toISOString(),
        end.toISOString()
      );
      
      const filteredRecords = updatedRecords.data.filter(record => 
        record.courseId === selectedCourse
      );
      
      setAttendanceRecords(filteredRecords);
      setLoading(false);
      
      // Show success message or handle UI feedback
      alert('Attendance submitted successfully!');
    } catch (err) {
      console.error('Failed to submit attendance:', err);
      setError('Failed to submit attendance. Please try again.');
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-100">Attendance Management</h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* Course and Date Selection */}
      <div className="bg-primary-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-primary-100 mb-3">Select Course and Date</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-primary-300 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="input w-full"
              disabled={loading}
            >
              <option value="">Select a Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-primary-300 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="input w-full"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Student Attendance Form */}
      {selectedCourse && students.length > 0 ? (
        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-primary-100 p-4 border-b border-primary-700">
            Mark Attendance
          </h2>
          
          {loading ? (
            <div className="p-6 text-center text-primary-300">Loading student data...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-primary-100">Student</th>
                      <th className="px-4 py-3 text-left text-primary-100">Status</th>
                      <th className="px-4 py-3 text-left text-primary-100">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-700">
                    {students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-primary-700">
                        <td className="px-4 py-3 text-primary-200">
                          {student.fullName}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="input input-sm"
                            value={attendanceData[index]?.status || 'PRESENT'}
                            onChange={(e) => handleAttendanceChange(index, 'status', e.target.value)}
                            disabled={loading}
                          >
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            className="input input-sm w-full"
                            value={attendanceData[index]?.remarks || ''}
                            onChange={(e) => handleAttendanceChange(index, 'remarks', e.target.value)}
                            placeholder="Optional remarks"
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-primary-700 flex justify-end">
                <button
                  onClick={submitAttendance}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : selectedCourse ? (
        <div className="bg-primary-800 p-6 rounded-lg text-center text-primary-300">
          No students enrolled in this course.
        </div>
      ) : (
        <div className="bg-primary-800 p-6 rounded-lg text-center text-primary-300">
          Please select a course to view and mark attendance.
        </div>
      )}

      {/* View Previous Attendance Records */}
      {selectedCourse && attendanceRecords.length > 0 && (
        <div className="bg-primary-800 rounded-lg overflow-hidden mt-6">
          <h2 className="text-xl font-semibold text-primary-100 p-4 border-b border-primary-700">
            Existing Attendance Records for {selectedDate}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-700">
                <tr>
                  <th className="px-4 py-3 text-left text-primary-100">Student</th>
                  <th className="px-4 py-3 text-left text-primary-100">Status</th>
                  <th className="px-4 py-3 text-left text-primary-100">Check-in Time</th>
                  <th className="px-4 py-3 text-left text-primary-100">Recorded By</th>
                  <th className="px-4 py-3 text-left text-primary-100">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-primary-700">
                    <td className="px-4 py-3 text-primary-200">{record.studentName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.status === 'PRESENT' ? 'bg-green-900 text-green-200' :
                        record.status === 'ABSENT' ? 'bg-red-900 text-red-200' :
                        record.status === 'LATE' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-orange-900 text-orange-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary-300">{formatDateTime(record.date)}</td>
                    <td className="px-4 py-3 text-primary-300">{record.recordedByName || 'N/A'}</td>
                    <td className="px-4 py-3 text-primary-300">{record.remarks || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement; 