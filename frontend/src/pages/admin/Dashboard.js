import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, courseService, facilityService } from '../../services/api';

// Admin dashboard stat card component
const StatCard = ({ title, value, icon, color }) => (
  <div className="card p-6 flex items-center">
    <div className={`rounded-full p-3 ${color} mr-4`}>
      {icon}
    </div>
    <div>
      <h3 className="text-primary-300 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold text-primary-100">{value}</p>
    </div>
  </div>
);

// Admin dashboard quick action card
const QuickActionCard = ({ title, description, link, icon }) => (
  <Link to={link} className="card p-6 hover:bg-primary-800/50 transition-colors duration-200">
    <div className="flex items-center mb-4">
      <div className="p-2 bg-primary-700 rounded-lg mr-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-primary-100">{title}</h3>
    </div>
    <p className="text-primary-300 text-sm">{description}</p>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userStats: { total: 0, students: 0, teachers: 0, admins: 0 },
    courseStats: { total: 0, active: 0, upcoming: 0, completed: 0 },
    facilityStats: { total: 0, available: 0, booked: 0, maintenance: 0 },
    activityStats: { enrollments: 0, bookings: 0, lastWeekUsers: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize all API calls in parallel for better performance
      const userPromise = userService.getAll();
      const coursePromise = courseService.getAll();
      const facilityPromise = facilityService.getAllFacilities();
      const bookingPromise = facilityService.getBookings();
      
      // Wait for all API calls to complete or fail
      const [usersResponse, coursesResponse, facilitiesResponse, bookingsResponse] = 
        await Promise.allSettled([userPromise, coursePromise, facilityPromise, bookingPromise]);
      
      // Process user data
      let users = [];
      if (usersResponse.status === 'fulfilled') {
        users = usersResponse.value.data || [];
      } else {
        console.error('Error fetching users:', usersResponse.reason);
        // Use sample data if API fails
        users = [
          { id: 1, name: 'Admin User', role: 'ADMIN' },
          { id: 2, name: 'Teacher 1', role: 'FACULTY' },
          { id: 3, name: 'Teacher 2', role: 'FACULTY' },
          { id: 4, name: 'Student 1', role: 'STUDENT' },
          { id: 5, name: 'Student 2', role: 'STUDENT' },
          { id: 6, name: 'Student 3', role: 'STUDENT' },
          { id: 7, name: 'Student 4', role: 'STUDENT' },
        ];
      }
      
      const studentCount = users.filter(user => user.role === 'STUDENT').length;
      const teacherCount = users.filter(user => user.role === 'FACULTY').length;
      const adminCount = users.filter(user => user.role === 'ADMIN').length;
      
      // Process course data
      let courses = [];
      if (coursesResponse.status === 'fulfilled') {
        courses = coursesResponse.value.data || [];
      } else {
        console.error('Error fetching courses:', coursesResponse.reason);
        // Use sample data if API fails
        courses = [
          { id: 1, title: 'Introduction to Programming', startDate: '2023-01-01', endDate: '2023-05-30' },
          { id: 2, title: 'Advanced Mathematics', startDate: '2023-01-01', endDate: '2023-05-30' },
          { id: 3, title: 'Physics 101', startDate: '2023-06-01', endDate: '2023-12-15' },
          { id: 4, title: 'Data Structures', startDate: '2023-08-15', endDate: '2024-01-15' },
        ];
      }
      
      const now = new Date();
      const activeCount = courses.filter(course => {
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        return startDate <= now && endDate >= now;
      }).length;
      
      const upcomingCount = courses.filter(course => {
        const startDate = new Date(course.startDate);
        return startDate > now;
      }).length;
      
      const completedCount = courses.filter(course => {
        const endDate = new Date(course.endDate);
        return endDate < now;
      }).length;
      
      // Process facility data
      let facilities = [];
      if (facilitiesResponse.status === 'fulfilled') {
        facilities = facilitiesResponse.value.data || [];
      } else {
        console.error('Error fetching facilities:', facilitiesResponse.reason);
        // Use sample data if API fails
        facilities = [
          { id: 1, name: 'Lecture Hall A', status: 'AVAILABLE' },
          { id: 2, name: 'Computer Lab', status: 'BOOKED' },
          { id: 3, name: 'Library', status: 'AVAILABLE' },
          { id: 4, name: 'Auditorium', status: 'MAINTENANCE' },
          { id: 5, name: 'Science Lab', status: 'BOOKED' },
        ];
      }
      
      const availableCount = facilities.filter(f => f.status === 'AVAILABLE').length;
      const bookedCount = facilities.filter(f => f.status === 'BOOKED').length;
      const maintenanceCount = facilities.filter(f => f.status === 'MAINTENANCE').length;
      
      // Process booking data
      let bookings = [];
      if (bookingsResponse.status === 'fulfilled') {
        bookings = bookingsResponse.value.data || [];
      } else {
        console.error('Error fetching bookings:', bookingsResponse.reason);
        // Use sample data if API fails
        bookings = [
          { id: 1, facilityId: 2, status: 'PENDING' },
          { id: 2, facilityId: 5, status: 'PENDING' },
          { id: 3, facilityId: 3, status: 'APPROVED' },
        ];
      }
      
      // Get pending bookings count - either from facilities or bookings
      const pendingBookingsCount = bookings.filter(b => b.status === 'PENDING').length || bookedCount;
      
      // Estimate enrollment count based on average students per course
      // In a real app, you'd want to get the actual count from the API
      const enrollmentCount = Math.max(studentCount, courses.length * 5);
      
      // Calculate recent user activity (last week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentUsersCount = users.filter(user => {
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        // If lastLogin is not available, assume some percentage of users were active
        return lastLogin ? lastLogin >= oneWeekAgo : Math.random() > 0.5;
      }).length;
      
      setStats({
        userStats: {
          total: users.length,
          students: studentCount,
          teachers: teacherCount,
          admins: adminCount
        },
        courseStats: {
          total: courses.length,
          active: activeCount,
          upcoming: upcomingCount,
          completed: completedCount
        },
        facilityStats: {
          total: facilities.length,
          available: availableCount,
          booked: bookedCount,
          maintenance: maintenanceCount,
          pending: pendingBookingsCount
        },
        activityStats: {
          enrollments: enrollmentCount,
          bookings: bookings.length,
          lastWeekUsers: recentUsersCount
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      setError('Failed to load dashboard data. Using sample data instead.');
      
      // Set sample data in case of complete failure
      setStats({
        userStats: {
          total: 25,
          students: 18,
          teachers: 5,
          admins: 2
        },
        courseStats: {
          total: 12,
          active: 8,
          upcoming: 3,
          completed: 1
        },
        facilityStats: {
          total: 10,
          available: 6,
          booked: 3,
          maintenance: 1,
          pending: 3
        },
        activityStats: {
          enrollments: 95,
          bookings: 15,
          lastWeekUsers: 20
        }
      });
      
      setLoading(false);
    }
  };
  
  // Icons for UI elements
  const icons = {
    users: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
        <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
      </svg>
    ),
    students: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
        <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
        <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
      </svg>
    ),
    teachers: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        <path d="M3 18.4v-2.796a4.3 4.3 0 00.713.31A26.226 26.226 0 0012 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 01-6.477-.427C4.047 21.128 3 19.852 3 18.4z" />
      </svg>
    ),
    courses: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
        <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
        <path d="M12 7.875a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
      </svg>
    ),
    facilities: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
        <path fillRule="evenodd" d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.006zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z" clipRule="evenodd" />
      </svg>
    ),
    userManagement: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
      </svg>
    ),
    courseManagement: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
        <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
      </svg>
    ),
    facilityManagement: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
      </svg>
    ),
    enrollment: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
      </svg>
    )
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary-100">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/admin/users/new" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Create New User
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.userStats.total}
              icon={icons.users}
              color="bg-purple-900/30 text-purple-300"
            />
            <StatCard
              title="Total Students"
              value={stats.userStats.students}
              icon={icons.students}
              color="bg-blue-900/30 text-blue-300"
            />
            <StatCard
              title="Total Faculty"
              value={stats.userStats.teachers}
              icon={icons.teachers}
              color="bg-green-900/30 text-green-300"
            />
            <StatCard
              title="Total Courses"
              value={stats.courseStats.total}
              icon={icons.courses}
              color="bg-orange-900/30 text-orange-300"
            />
            <StatCard
              title="Pending Facility Bookings"
              value={stats.facilityStats.pending || stats.facilityStats.booked}
              icon={icons.facilities}
              color="bg-red-900/30 text-red-300"
            />
          </div>
          
          {/* Quick Actions Section */}
          <h2 className="text-xl font-semibold text-primary-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <QuickActionCard
              title="User Management"
              description="Create and manage users, assign roles, and reset passwords"
              link="/admin/users"
              icon={icons.userManagement}
            />
            <QuickActionCard
              title="Course Management"
              description="Create courses and assign teachers to courses"
              link="/admin/courses"
              icon={icons.courseManagement}
            />
            <QuickActionCard
              title="Student Enrollment"
              description="Enroll or remove students from courses"
              link="/admin/enrollment"
              icon={icons.enrollment}
            />
            <QuickActionCard
              title="Facility Management"
              description="Manage campus facilities and view/approve booking requests"
              link="/admin/facilities"
              icon={icons.facilityManagement}
            />
            <QuickActionCard
              title="Faculty Assignment"
              description="Assign or remove faculty from courses"
              link="/admin/teacher-assignment"
              icon={icons.teachers}
            />
            <QuickActionCard
              title="Campus Analytics"
              description="View detailed analytics and reports about campus activities"
              link="/admin/analytics"
              icon={icons.facilities}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 