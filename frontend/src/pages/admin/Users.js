import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { Button, Modal, Table, Form, Input, Select, message, Space, Tag, Spin } from 'antd';
import AdminLayout from '../../components/layouts/AdminLayout';

const { Option } = Select;

// Define icon components using SVG
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    form.resetFields();
    setEditMode(false);
    setSelectedUser(null);
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', // Don't populate password for security
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService.delete(userId);
      message.success('User successfully deleted');
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      message.error('Failed to delete user');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editMode) {
        await userService.update(selectedUser.id, {
          ...values,
          // Only include password if it was actually provided
          ...(!values.password && { password: undefined })
        });
        message.success('User successfully updated');
      } else {
        await userService.create(values);
        message.success('User successfully created');
      }
      
      setModalVisible(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error saving user:', err);
      message.error(`Failed to ${editMode ? 'update' : 'create'} user`);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue';
        if (role === 'ADMIN') color = 'red';
        if (role === 'FACULTY') color = 'green';
        return <Tag color={color}>{role}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'ADMIN' },
        { text: 'Faculty', value: 'FACULTY' },
        { text: 'Student', value: 'STUDENT' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditIcon />} 
            onClick={() => handleEditUser(record)}
          />
          <Button 
            icon={<DeleteIcon />} 
            danger
            onClick={() => handleDeleteUser(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout selectedKey="users">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button 
            type="primary" 
            icon={<PlusIcon />} 
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table 
            dataSource={users.map(user => ({ ...user, key: user.id }))} 
            columns={columns} 
            pagination={{ pageSize: 10 }}
            bordered
          />
        )}

        <Modal
          title={editMode ? "Edit User" : "Add New User"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter user name' }]}
            >
              <Input prefix={<UserIcon />} placeholder="Full Name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter user email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailIcon />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: !editMode, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password prefix={<LockIcon />} placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select a role">
                <Option value="ADMIN">Admin</Option>
                <Option value="FACULTY">Faculty</Option>
                <Option value="STUDENT">Student</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <div className="flex justify-end">
                <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editMode ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Users; 