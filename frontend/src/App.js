import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
//import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/UserManagement';
import AdminCourses from './pages/admin/CourseManagement';
import AdminEnrollment from './pages/admin/EnrollmentManagement';
import AdminFacilities from './pages/admin/FacilityManagement';
import AdminTeacherAssignment from './pages/admin/TeacherAssignment';
import AdminAnalytics from './pages/admin/Analytics';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import AttendanceManagement from './pages/teacher/AttendanceManagement';
import FeedbackManagement from './pages/teacher/FeedbackManagement';
import NotificationManagement from './pages/teacher/NotificationManagement';
import EventManagement from './pages/teacher/EventManagement';
import ResourceManagement from './pages/teacher/ResourceManagement';
import FacilityBooking from './pages/teacher/FacilityBooking';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import CourseResources from './pages/student/CourseResources';
import StudentAttendance from './pages/student/Attendance';
import StudentEvents from './pages/student/Events';
import StudentFeedback from './pages/student/Feedback';
import StudentFacilityBooking from './pages/student/FacilityBooking';
import StudentCafeteria from './pages/student/Cafeteria';
import LostAndFound from './pages/student/LostAndFound';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import OrderManagement from './pages/staff/OrderManagement';

// Error Pages
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Home route component that redirects to role-specific dashboard
const HomeRedirect = () => {
  const { userRole, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  switch (userRole) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" />;
    case 'FACULTY':
      return <Navigate to="/teacher/dashboard" />;
    case 'STUDENT':
      return <Navigate to="/student/dashboard" />;
    case 'STAFF':
      return <Navigate to="/staff/dashboard" />;
    default:
      return <Navigate to="/profile" />;
  }
};

const App = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Root Route with Role-based Redirect */}
      <Route path="/" element={<HomeRedirect />} />
      
      {/* Protected Routes - Admin */}
      <Route element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/enrollment" element={<AdminEnrollment />} />
        <Route path="/admin/facilities" element={<AdminFacilities />} />
        <Route path="/admin/teacher-assignment" element={<AdminTeacherAssignment />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Route>
      
      {/* Protected Routes - Common */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} />
      </Route>
      
      {/* Teacher Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/attendance" element={<AttendanceManagement />} />
        <Route path="/teacher/feedback" element={<FeedbackManagement />} />
        <Route path="/teacher/notifications" element={<NotificationManagement />} />
        <Route path="/teacher/events" element={<EventManagement />} />
        <Route path="/teacher/resources" element={<ResourceManagement />} />
        <Route path="/teacher/facilities" element={<FacilityBooking />} />
      </Route>
      
      {/* Student Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses/:courseId/resources" element={<CourseResources />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/events" element={<StudentEvents />} />
        <Route path="/student/feedback" element={<StudentFeedback />} />
        <Route path="/student/facilities" element={<StudentFacilityBooking />} />
        <Route path="/student/cafeteria" element={<StudentCafeteria />} />
        <Route path="/student/lost-and-found" element={<LostAndFound />} />
      </Route>
      
      {/* Staff Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['STAFF']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/orders" element={<OrderManagement />} />
      </Route>
      
      {/* Error Routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App; 