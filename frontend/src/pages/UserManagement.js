import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Pencil } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const UserManagement = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('new');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/users`, { withCredentials: true });
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u.id === userId);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('Name is mandatory');
      return false;
    }
    if (!formData.email) {
      setError('Email is mandatory');
      return false;
    }
    if (mode === 'new' && !formData.password) {
      setError('Password is mandatory for new users');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'new') {
        await axios.post(`${API_BASE}/api/users`, formData, { withCredentials: true });
        setSuccess('User created successfully');
      } else {
        if (!selectedUserId) {
          setError('Please select a user to update');
          setLoading(false);
          return;
        }
        await axios.put(`${API_BASE}/api/users/${selectedUserId}`, formData, {
          withCredentials: true,
        });
        setSuccess('User updated successfully');
      }
      
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
      setSelectedUserId('');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="user-management-page">
      <header className="bg-white border-b-2 border-[#111111]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline flex items-center gap-2"
            data-testid="back-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="user-management-title">
            User Management
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="bg-white border-2 border-[#111111] p-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setMode('new');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  role: 'user',
                });
                setSelectedUserId('');
                setError('');
                setSuccess('');
              }}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-none transition-colors ${
                mode === 'new'
                  ? 'bg-[#FF4B00] text-white'
                  : 'bg-[#F3F3F0] text-[#111111] hover:bg-[#E0E0D9]'
              }`}
              data-testid="new-user-mode-button"
            >
              <Plus size={20} />
              New User
            </button>
            <button
              onClick={() => {
                setMode('existing');
                setError('');
                setSuccess('');
              }}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-none transition-colors ${
                mode === 'existing'
                  ? 'bg-[#FF4B00] text-white'
                  : 'bg-[#F3F3F0] text-[#111111] hover:bg-[#E0E0D9]'
              }`}
              data-testid="existing-user-mode-button"
            >
              <Pencil size={20} />
              Existing User
            </button>
          </div>

          {mode === 'existing' && (
            <div className="mb-6">
              <label className="label-text" htmlFor="select-user">
                Select User to Update
              </label>
              <select
                id="select-user"
                value={selectedUserId}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="input-field w-full"
                data-testid="user-select-dropdown"
              >
                <option value="">-- Select a user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-text" htmlFor="user-name">
                  Name *
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  required
                  data-testid="user-name-input"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="user-email">
                  Email *
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full"
                  required
                  data-testid="user-email-input"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="user-password">
                  Password {mode === 'new' ? '*' : '(leave blank to keep current)'}
                </label>
                <input
                  id="user-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field w-full"
                  required={mode === 'new'}
                  data-testid="user-password-input"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="user-role">
                  Role *
                </label>
                <select
                  id="user-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field w-full"
                  required
                  data-testid="user-role-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {error && <div className="error-text" data-testid="user-error-message">{error}</div>}
            {success && (
              <div className="text-[#14854D] text-sm font-medium" data-testid="user-success-message">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              data-testid="submit-user-button"
            >
              {loading ? 'Processing...' : mode === 'new' ? 'Create User' : 'Update User'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
