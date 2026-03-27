'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { AppUser } from '@/store/authStore';

type ManagedUser = AppUser & {
  phoneNumber?: string;
  authProvider: 'local' | 'google';
  wallet?: {
    id: string;
    balance: string;
    status: string;
  };
};

const emptyForm = {
  id: '',
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'USER' as 'USER' | 'ADMIN',
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const isEditing = Boolean(formData.id);

  const formTitle = useMemo(() => (isEditing ? 'Update User' : 'Create User'), [isEditing]);

  const fetchUsers = async (search = '') => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get('/admin/users', {
        params: search ? { q: search } : undefined,
      });
      setUsers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [isLoading, user]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => setFormData(emptyForm);

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        await apiClient.put(`/admin/users/${formData.id}`, {
          email: formData.email,
          username: formData.username,
          password: formData.password || undefined,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        toast.success('User updated');
      } else {
        await apiClient.post('/admin/users', {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        toast.success('User created');
      }

      resetForm();
      fetchUsers(query);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (managedUser: ManagedUser) => {
    setFormData({
      id: managedUser.id,
      email: managedUser.email,
      username: managedUser.username,
      password: '',
      firstName: managedUser.firstName || '',
      lastName: managedUser.lastName || '',
      role: managedUser.role,
    });
  };

  const toggleLock = async (managedUser: ManagedUser) => {
    try {
      const endpoint = managedUser.accountStatus === 'active' ? 'lock' : 'unlock';
      await apiClient.post(`/admin/users/${managedUser.id}/${endpoint}`);
      toast.success(managedUser.accountStatus === 'active' ? 'User locked' : 'User unlocked');
      fetchUsers(query);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const deleteUser = async (managedUser: ManagedUser) => {
    if (!window.confirm(`Delete ${managedUser.username}?`)) {
      return;
    }

    try {
      await apiClient.delete(`/admin/users/${managedUser.id}`);
      toast.success('User deleted');
      if (formData.id === managedUser.id) {
        resetForm();
      }
      fetchUsers(query);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    fetchUsers(query);
  };

  if (isLoading || user?.role !== 'ADMIN') {
    return (
      <div className="container-custom py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin</h1>
          <p className="mt-2 text-gray-600">Create, update, lock, and delete user accounts.</p>
        </div>

        <form onSubmit={runSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search username or email"
            className="input-field min-w-[260px]"
          />
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="card h-fit">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{formTitle}</h2>
            {isEditing ? (
              <button type="button" onClick={resetForm} className="text-sm font-medium text-blue-500 hover:text-blue-600">
                Clear
              </button>
            ) : null}
          </div>

          <form onSubmit={submitForm} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password {isEditing ? <span className="text-gray-400">(leave blank to keep current)</span> : null}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button type="submit" disabled={saving} className="w-full btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : formTitle}
            </button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Users</h2>

          {loadingUsers ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b text-left text-sm uppercase tracking-wide text-gray-500">
                  <th className="py-3">User</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Provider</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Wallet</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((managedUser) => (
                  <tr key={managedUser.id} className="border-b align-top">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-gray-900">{managedUser.firstName || managedUser.username}</div>
                      <div className="text-sm text-gray-500">@{managedUser.username}</div>
                      <div className="text-sm text-gray-500">{managedUser.email}</div>
                    </td>
                    <td className="py-4 pr-4 text-sm font-medium text-gray-700">{managedUser.role}</td>
                    <td className="py-4 pr-4 text-sm capitalize text-gray-600">{managedUser.authProvider}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          managedUser.accountStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : managedUser.accountStatus === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {managedUser.accountStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-600">
                      {managedUser.wallet ? `${managedUser.wallet.balance} ${managedUser.wallet.status}` : 'No wallet'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => startEdit(managedUser)} className="btn-secondary text-sm">
                          Edit
                        </button>
                        <button type="button" onClick={() => toggleLock(managedUser)} className="btn-secondary text-sm">
                          {managedUser.accountStatus === 'active' ? 'Lock' : 'Unlock'}
                        </button>
                        <button type="button" onClick={() => deleteUser(managedUser)} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}