import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Pencil } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const MembershipManagement = () => {
  const [mode, setMode] = useState('add');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [membershipData, setMembershipData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    duration_months: 6,
  });
  
  const [updateData, setUpdateData] = useState({
    extend_months: 6,
    cancel: false,
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateAddForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError('All fields are mandatory');
      return false;
    }
    return true;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateAddForm()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/memberships`, formData, {
        withCredentials: true,
      });
      setSuccess(`Membership created successfully. Number: ${data.membership_number}`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        duration_months: 6,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create membership');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMembership = async () => {
    setError('');
    setSuccess('');

    if (!membershipNumber) {
      setError('Membership number is required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/memberships/${membershipNumber}`, {
        withCredentials: true,
      });
      setMembershipData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Membership not found');
      setMembershipData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!membershipNumber) {
      setError('Please fetch a membership first');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/memberships/${membershipNumber}`,
        updateData,
        { withCredentials: true }
      );
      setSuccess(data.message);
      setMembershipData(null);
      setMembershipNumber('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="membership-management-component">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setMode('add');
            setError('');
            setSuccess('');
            setMembershipData(null);
          }}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-none transition-colors ${
            mode === 'add'
              ? 'bg-[#FF4B00] text-white'
              : 'bg-[#F3F3F0] text-[#111111] hover:bg-[#E0E0D9]'
          }`}
          data-testid="add-membership-mode-button"
        >
          <Plus size={20} />
          Add Membership
        </button>
        <button
          onClick={() => {
            setMode('update');
            setError('');
            setSuccess('');
          }}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-none transition-colors ${
            mode === 'update'
              ? 'bg-[#FF4B00] text-white'
              : 'bg-[#F3F3F0] text-[#111111] hover:bg-[#E0E0D9]'
          }`}
          data-testid="update-membership-mode-button"
        >
          <Pencil size={20} />
          Update Membership
        </button>
      </div>

      {mode === 'add' ? (
        <form onSubmit={handleAddSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text" htmlFor="member-name">
                Name *
              </label>
              <input
                id="member-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                required
                data-testid="member-name-input"
              />
            </div>

            <div>
              <label className="label-text" htmlFor="member-email">
                Email *
              </label>
              <input
                id="member-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field w-full"
                required
                data-testid="member-email-input"
              />
            </div>

            <div>
              <label className="label-text" htmlFor="member-phone">
                Phone *
              </label>
              <input
                id="member-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field w-full font-['IBM_Plex_Mono']"
                required
                data-testid="member-phone-input"
              />
            </div>

            <div>
              <label className="label-text" htmlFor="member-address">
                Address *
              </label>
              <input
                id="member-address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field w-full"
                required
                data-testid="member-address-input"
              />
            </div>

            <div>
              <label className="label-text" htmlFor="duration">
                Duration *
              </label>
              <select
                id="duration"
                value={formData.duration_months}
                onChange={(e) =>
                  setFormData({ ...formData, duration_months: parseInt(e.target.value) })
                }
                className="input-field w-full"
                required
                data-testid="duration-select"
              >
                <option value="6">6 months</option>
                <option value="12">1 year</option>
                <option value="24">2 years</option>
              </select>
            </div>
          </div>

          {error && <div className="error-text" data-testid="membership-error-message">{error}</div>}
          {success && (
            <div className="text-[#14854D] text-sm font-medium" data-testid="membership-success-message">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            data-testid="submit-membership-button"
          >
            {loading ? 'Creating...' : 'Create Membership'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="label-text" htmlFor="membership-number">
              Membership Number *
            </label>
            <div className="flex gap-4">
              <input
                id="membership-number"
                type="text"
                value={membershipNumber}
                onChange={(e) => setMembershipNumber(e.target.value)}
                className="input-field flex-1 font-['IBM_Plex_Mono']"
                data-testid="membership-number-input"
              />
              <button
                onClick={handleFetchMembership}
                disabled={loading}
                className="btn-secondary"
                data-testid="fetch-membership-button"
              >
                {loading ? 'Loading...' : 'Fetch'}
              </button>
            </div>
          </div>

          {membershipData && (
            <div className="border-2 border-[#111111] p-6 bg-[#F9F9F8]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="label-text">Name</div>
                  <div className="text-base font-medium" data-testid="membership-name-display">
                    {membershipData.name}
                  </div>
                </div>
                <div>
                  <div className="label-text">Email</div>
                  <div className="text-base font-medium" data-testid="membership-email-display">
                    {membershipData.email}
                  </div>
                </div>
                <div>
                  <div className="label-text">Status</div>
                  <div
                    className="text-base font-bold uppercase"
                    data-testid="membership-status-display"
                  >
                    {membershipData.status}
                  </div>
                </div>
                <div>
                  <div className="label-text">End Date</div>
                  <div
                    className="text-base font-medium font-['IBM_Plex_Mono']"
                    data-testid="membership-end-date-display"
                  >
                    {new Date(membershipData.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div>
                  <label className="label-text">Action</label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="action"
                        checked={!updateData.cancel}
                        onChange={() => setUpdateData({ ...updateData, cancel: false })}
                        className="w-4 h-4"
                        data-testid="extend-membership-radio"
                      />
                      <span className="font-medium">Extend Membership</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="action"
                        checked={updateData.cancel}
                        onChange={() => setUpdateData({ ...updateData, cancel: true })}
                        className="w-4 h-4"
                        data-testid="cancel-membership-radio"
                      />
                      <span className="font-medium">Cancel Membership</span>
                    </label>
                  </div>
                </div>

                {!updateData.cancel && (
                  <div>
                    <label className="label-text" htmlFor="extend-duration">
                      Extend Duration
                    </label>
                    <select
                      id="extend-duration"
                      value={updateData.extend_months}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, extend_months: parseInt(e.target.value) })
                      }
                      className="input-field w-full md:w-1/2"
                      data-testid="extend-duration-select"
                    >
                      <option value="6">6 months</option>
                      <option value="12">1 year</option>
                      <option value="24">2 years</option>
                    </select>
                  </div>
                )}

                {error && <div className="error-text" data-testid="update-error-message">{error}</div>}
                {success && (
                  <div className="text-[#14854D] text-sm font-medium" data-testid="update-success-message">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  data-testid="submit-update-button"
                >
                  {loading ? 'Updating...' : 'Update Membership'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipManagement;
