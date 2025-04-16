import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

const UserRow = ({ user, onEdit, onDelete }) => {
  return (
    <tr className="border-b border-primary-800">
      <td className="py-4 px-4">{user.firstName} {user.lastName}</td>
      <td className="py-4 px-4">{user.email}</td>
      <td className="py-4 px-4">
        <span 
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'ADMIN' 
              ? 'bg-purple-900 text-purple-200' 
              : user.role === 'TEACHER' 
              ? 'bg-blue-900 text-blue-200' 
              : 'bg-green-900 text-green-200'
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <button
          onClick={() => onEdit(user)}
          className="text-primary-400 hover:text-primary-100 mr-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="text-red-500 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'STUDENT',
    password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-primary-100 mb-4">
        {user ? 'Edit User' : 'Add New User'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
        
        <div className="mb-4">
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
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="role" className="block text-primary-300 mb-2">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        
        {!user && (
          <div className="mb-4">
            <label htmlFor="password" className="block text-primary-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input w-full"
              required={!user}
              minLength="6"
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn bg-primary-800 text-primary-300 hover:bg-primary-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {user ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // Simulating API call for demo
      setTimeout(() => {
        const mockUsers = [
          { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ADMIN' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'TEACHER' },
          { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', role: 'STUDENT' },
          { id: 4, firstName: 'Alice', lastName: 'Williams', email: 'alice@example.com', role: 'STUDENT' },
          { id: 5, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', role: 'STUDENT' },
        ];
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage({
        text: 'Failed to load users. Please try again.',
        type: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleEdit = (user) => {
    setCurrentUser(user);
    setShowForm(true);
  };
  
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setUsers(users.filter(user => user.id !== userId));
        setMessage({
          text: 'User deleted successfully',
          type: 'success'
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } catch (error) {
        setMessage({
          text: 'Failed to delete user',
          type: 'error'
        });
      }
    }
  };
  
  const handleSave = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (userData.id) {
        // Update existing user
        setUsers(users.map(user => 
          user.id === userData.id ? { ...userData } : user
        ));
        setMessage({
          text: 'User updated successfully',
          type: 'success'
        });
      } else {
        // Create new user
        const newUser = {
          ...userData,
          id: Date.now() // Generate a temporary ID
        };
        setUsers([...users, newUser]);
        setMessage({
          text: 'User created successfully',
          type: 'success'
        });
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      
      // Close form
      setShowForm(false);
      setCurrentUser(null);
    } catch (error) {
      setMessage({
        text: `Failed to ${userData.id ? 'update' : 'create'} user`,
        type: 'error'
      });
    }
  };
  
  const handleAddNew = () => {
    setCurrentUser(null);
    setShowForm(true);
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.role.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-100">Users</h1>
        <button 
          onClick={handleAddNew}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
          Add User
        </button>
      </div>
      
      {message.text && (
        <div className={`p-3 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      {showForm ? (
        <UserForm 
          user={currentUser} 
          onSave={handleSave} 
          onCancel={() => {
            setShowForm(false);
            setCurrentUser(null);
          }} 
        />
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
              </div>
              <input 
                type="text" 
                className="input pl-10 w-full md:w-80"
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-primary-400">
                {searchTerm ? 'No users match your search' : 'No users found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-primary-800">
                      <th className="py-3 px-4 font-semibold text-primary-300">Name</th>
                      <th className="py-3 px-4 font-semibold text-primary-300">Email</th>
                      <th className="py-3 px-4 font-semibold text-primary-300">Role</th>
                      <th className="py-3 px-4 font-semibold text-primary-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Users; 