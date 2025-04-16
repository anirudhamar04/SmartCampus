import React, { useState, useEffect } from 'react';
import { attendanceService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AttendanceManagement = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [newAttendance, setNewAttendance] = useState({
    userId: '',
    checkInTime: new Date().toISOString().slice(0, 16),
    checkOutTime: null,
    location: 'Classroom',
    status: 'PRESENT',
    remarks: ''
  });

  // Status options for attendance
  const statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE'];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await userService.getByRole('STUDENT');
        setStudents(response.data);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError('Failed to fetch students. Please try again later.');
      }
    };

    const fetchAttendance = async () => {
      try {
        // Convert dates to ISO strings with time for API request
        const start = new Date(dateFilter.startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(dateFilter.endDate);
        end.setHours(23, 59, 59, 999);
        
        const response = await attendanceService.getByDateRange(
          start.toISOString(),
          end.toISOString()
        );
        setAttendanceRecords(response.data);
      } catch (err) {
        console.error('Failed to fetch attendance records:', err);
        setError('Failed to fetch attendance records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchStudents();
    fetchAttendance();
  }, [dateFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAttendance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await attendanceService.create(newAttendance);
      
      // Add the new record to the attendance list
      setAttendanceRecords(prev => [response.data, ...prev]);
      
      // Reset form
      setNewAttendance({
        userId: '',
        checkInTime: new Date().toISOString().slice(0, 16),
        checkOutTime: null,
        location: 'Classroom',
        status: 'PRESENT',
        remarks: ''
      });
      
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create attendance record:', err);
      setError('Failed to create attendance record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const attendanceToUpdate = attendanceRecords.find(record => record.id === id);
      
      if (!attendanceToUpdate) return;
      
      const updatedData = {
        ...attendanceToUpdate,
        status: newStatus
      };
      
      const response = await attendanceService.update(id, updatedData);
      
      // Update the record in the attendance list
      setAttendanceRecords(prev => 
        prev.map(record => record.id === id ? response.data : record)
      );
    } catch (err) {
      console.error('Failed to update attendance record:', err);
      setError('Failed to update attendance status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Record New Attendance'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* New Attendance Form */}
      {showForm && (
        <div className="bg-primary-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-primary-100 mb-4">Record New Attendance</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-primary-300 mb-2">Student</label>
                <select
                  name="userId"
                  value={newAttendance.userId}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-primary-300 mb-2">Status</label>
                <select
                  name="status"
                  value={newAttendance.status}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-primary-300 mb-2">Check-in Time</label>
                <input
                  type="datetime-local"
                  name="checkInTime"
                  value={newAttendance.checkInTime}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-primary-300 mb-2">Check-out Time (Optional)</label>
                <input
                  type="datetime-local"
                  name="checkOutTime"
                  value={newAttendance.checkOutTime || ''}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-primary-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newAttendance.location}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                  placeholder="e.g., Classroom, Lab, etc."
                />
              </div>

              <div>
                <label className="block text-primary-300 mb-2">Remarks (Optional)</label>
                <input
                  type="text"
                  name="remarks"
                  value={newAttendance.remarks || ''}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Any additional notes"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-primary-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-primary-100 mb-3">Filter Attendance Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-primary-300 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateFilter.startDate}
              onChange={handleDateFilterChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-primary-300 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateFilter.endDate}
              onChange={handleDateFilterChange}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-primary-800 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold text-primary-100 p-4 border-b border-primary-700">
          Attendance Records
        </h2>
        
        {loading ? (
          <div className="p-6 text-center text-primary-300">Loading attendance records...</div>
        ) : attendanceRecords.length === 0 ? (
          <div className="p-6 text-center text-primary-300">No attendance records found for the selected date range.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-700">
                <tr>
                  <th className="px-4 py-3 text-left text-primary-100">Student</th>
                  <th className="px-4 py-3 text-left text-primary-100">Status</th>
                  <th className="px-4 py-3 text-left text-primary-100">Check-in Time</th>
                  <th className="px-4 py-3 text-left text-primary-100">Check-out Time</th>
                  <th className="px-4 py-3 text-left text-primary-100">Location</th>
                  <th className="px-4 py-3 text-left text-primary-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-primary-700">
                    <td className="px-4 py-3 text-primary-200">{record.userName}</td>
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
                    <td className="px-4 py-3 text-primary-300">{formatDateTime(record.checkInTime)}</td>
                    <td className="px-4 py-3 text-primary-300">{formatDateTime(record.checkOutTime)}</td>
                    <td className="px-4 py-3 text-primary-300">{record.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <select
                          className="input input-sm"
                          value={record.status}
                          onChange={(e) => handleUpdateStatus(record.id, e.target.value)}
                        >
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement; 