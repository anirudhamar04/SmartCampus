import React, { useState, useEffect } from 'react';
import { attendanceService, courseService, refreshAuthToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [overallAttendance, setOverallAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Make sure auth token is set for API calls
    refreshAuthToken();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      setError('You must be logged in to view attendance data');
      setLoading(false);
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const fetchCourses = async () => {
      try {
        console.log('Fetching courses for user:', currentUser?.id);
        setLoading(true);
        
        // Verify token exists
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          setError('Authentication required. Please log in.');
          logout();
          navigate('/login');
          return [];
        }
        
        const response = await courseService.getMyCourses();
        console.log('Courses fetched successfully:', response.data);
        setCourses(response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching courses:', err);
        
        // Handle different error types
        if (err.response) {
          // The request was made and the server responded with a status code
          if (err.response.status === 403) {
            console.log('403 Forbidden error received');
            setError('You do not have permission to access this data. Please check if you are logged in correctly.');
            // If there's an auth issue, prompt re-login
            setTimeout(() => {
              logout();
              navigate('/login');
            }, 3000);
          } else if (err.response.status === 401) {
            console.log('401 Unauthorized error received');
            setError('Your session has expired. Please log in again.');
            // If unauthorized, log out immediately
            logout();
            navigate('/login');
          } else {
            setError(`Failed to load courses: ${err.response.data?.message || 'Unknown error'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('Could not connect to the server. Please check your internet connection and try again.');
        } else {
          // Something happened in setting up the request
          setError('Failed to load courses. Please try again later.');
        }
        return [];
      }
    };

    const fetchAttendanceData = async (courses) => {
      try {
        if (!currentUser?.id) return;
        
        const studentId = currentUser.id;
        
        // Fetch overall attendance percentage
        const overallResponse = await attendanceService.getOverallAttendancePercentage(studentId);
        setOverallAttendance(overallResponse.data);
        
        // Fetch attendance for each course
        const attendancePromises = courses.map(course => 
          attendanceService.getCourseAttendancePercentage(studentId, course.id)
            .then(response => ({ 
              courseId: course.id, 
              data: response.data 
            }))
            .catch(err => {
              console.error(`Error fetching attendance for course ${course.id}:`, err);
              return { 
                courseId: course.id, 
                data: { 
                  percentage: 0, 
                  attendedClasses: 0, 
                  totalClasses: 0,
                  error: true
                } 
              };
            })
        );
        
        const attendanceResults = await Promise.all(attendancePromises);
        
        // Convert array to object with courseId as key
        const attendanceMap = {};
        attendanceResults.forEach(result => {
          attendanceMap[result.courseId] = result.data;
        });
        
        setAttendanceData(attendanceMap);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        
        // Handle authentication errors consistently
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Your session has expired or you do not have permission to access this data.');
          logout();
          navigate('/login');
        } else {
          setError('Failed to load attendance data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const coursesData = await fetchCourses();
      // Only fetch attendance data if we got courses successfully
      if (coursesData && coursesData.length > 0) {
        await fetchAttendanceData(coursesData);
      } else {
        setLoading(false);
      }
    };

    init();
  }, [currentUser, isAuthenticated, logout, navigate]);

  // Get status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-600';
    if (percentage >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="my-6">
        <h1 className="text-3xl font-bold mb-4">
          My Attendance
        </h1>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Overall Attendance Card */}
            {overallAttendance && (
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold">Overall Attendance</h2>
                </div>
                <div className="border-b border-gray-200 mb-4"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Attendance Percentage
                      </p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`${getStatusBgColor(overallAttendance.percentage)} h-2.5 rounded-full`} 
                            style={{ width: `${Math.min(overallAttendance.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span 
                          className={`text-2xl font-bold ${getStatusColor(overallAttendance.percentage)}`}
                        >
                          {overallAttendance.percentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        Classes Attended
                      </p>
                      <p className="text-2xl">
                        {overallAttendance.attendedClasses} / {overallAttendance.totalClasses}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course-wise Attendance */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <h2 className="text-xl font-semibold">Course-wise Attendance</h2>
              </div>
              <div className="border-b border-gray-200 mb-4"></div>
              
              {courses.length === 0 ? (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded" role="alert">
                  <span>You are not enrolled in any courses yet.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes Attended</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => {
                        const attendance = attendanceData[course.id] || {
                          percentage: 0,
                          attendedClasses: 0,
                          totalClasses: 0
                        };
                        
                        return (
                          <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{course.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{course.faculty}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{attendance.attendedClasses}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{attendance.totalClasses}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className={`font-bold ${getStatusColor(attendance.percentage)}`}
                              >
                                {attendance.percentage.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {attendance.percentage >= 75 ? (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-green-600">Good</span>
                                </div>
                              ) : attendance.percentage >= 60 ? (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-yellow-600">Warning</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-red-600">Critical</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance; 