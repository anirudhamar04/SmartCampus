import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        text: 'Profile updated successfully',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      return setMessage({
        text: 'New passwords do not match',
        type: 'error'
      });
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setMessage({
        text: 'Password updated successfully',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.message || 'Failed to update password',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary-100 mb-6">Profile</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-primary-800">
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-100 border-b-2 border-primary-400'
                : 'text-primary-400 hover:text-primary-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Personal Info
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary-100 border-b-2 border-primary-400'
                : 'text-primary-400 hover:text-primary-300'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>
      </div>
      
      {message.text && (
        <div className={`p-3 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Profile Information Form */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-primary-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-primary-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-primary-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                required
                disabled
              />
              <p className="text-primary-400 text-sm mt-1">
                Email cannot be changed
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
      
      {/* Change Password Form */}
      {activeTab === 'password' && (
        <div className="card p-6">
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-primary-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-primary-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="input w-full"
                minLength="6"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-primary-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full"
                minLength="6"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile; 