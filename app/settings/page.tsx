'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.put('/users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input-field bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Security</h2>

            <button type="button" className="btn-secondary mb-4">
              Change Password
            </button>
            <button type="button" className="btn-secondary">
              Enable Two-Factor Authentication
            </button>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>

            <div className="space-y-4">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="ml-2">Email me on large transfers</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="ml-2">Email me on successful withdrawals</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4" />
                <span className="ml-2">Marketing emails and updates</span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border border-red-200 bg-red-50">
            <h2 className="text-2xl font-bold mb-6 text-red-600">Danger Zone</h2>

            <button type="button" className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Close Account
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
