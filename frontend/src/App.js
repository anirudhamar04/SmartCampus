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
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';

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

const App = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Protected Routes - Admin & Common */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
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
      </Route>
      
      {/* Error Routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App; 