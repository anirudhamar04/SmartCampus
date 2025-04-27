import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-primary-300">
          Welcome, {currentUser?.fullName || 'Staff Member'}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-primary-900 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Management</h2>
          <p className="mb-4 text-primary-300">View and manage cafeteria orders from students and staff.</p>
          <Link 
            to="/staff/orders" 
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 