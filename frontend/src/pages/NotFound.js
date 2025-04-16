import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-bold text-primary-700">404</h1>
      <h2 className="text-3xl font-bold text-primary-100 mt-6 mb-3">Page Not Found</h2>
      <p className="text-primary-400 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="btn btn-primary px-8"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound; 