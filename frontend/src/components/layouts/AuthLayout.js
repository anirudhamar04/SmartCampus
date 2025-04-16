import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-100">Smart Campus</h1>
          <p className="text-primary-400 mt-2">Manage your campus efficiently</p>
        </div>
        <div className="card p-6 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 