import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Navigation from '../components/Navigation';

export default function DashboardPage() {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'User', password: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
    const res = await api.get('/dashboard');
    return res.data;
},});


  React.useEffect(() => {
    if (data && data.admins) {
      setUsersLoading(true);
      api.get('/users')
        .then(res => setUsers(res.data))
        .catch(e => setUsersError(e.response?.data?.message || 'Error'))
        .finally(() => setUsersLoading(false));
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error loading dashboard</div>;

  const isUser = data && data.companies && !('totalUsers' in data);
  const isSuperAdmin = data && data.admins;

  const openCreateModal = () => {
    setEditUser(null);
    setForm({ name: '', email: '', role: 'User', password: '' });
    setUserModalOpen(true);
  };
  const openEditModal = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setUserModalOpen(true);
  };
  const closeModal = () => {
    setUserModalOpen(false);
    setEditUser(null);
  };
  const handleFormChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleUserSave = async e => {
    e.preventDefault();
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, { ...form, password: undefined });
      } else {
        await api.post('/users', form);
      }

      const res = await api.get('/users');
      setUsers(res.data);
      closeModal();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };
  const handleUserDelete = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  return (
    <>
    <Navigation />
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <h2>Dashboard</h2>

      <div style={{ marginTop: 24 }}>
        {isUser && (
          <>
            <h3>Your Companies</h3>
            <ul>
              {data.companies.map(c => (
                <li key={c.id}>{c.name} — Capital: {c.capital}</li>
              ))}
            </ul>
          </>
        )}
        {!isUser && (
          <>
            <div>
              <strong>Total Users:</strong> {data.totalUsers}
            </div>
            <div>
              <strong>Total Companies:</strong> {data.totalCompanies}
            </div>
            <h3>Companies</h3>
            <ul>
              {data.companies.map(c => (
                <li key={c.id}>{c.name} — Capital: {c.capital}</li>
              ))}
            </ul>
            {isSuperAdmin && (
              <>
                <h3>Admins</h3>
                <ul>
                  {data.admins.map(a => (
                    <li key={a.id}>{a.name} ({a.email})</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
      {isSuperAdmin && (
        <div style={{ marginTop: 40 }}>
          <h3>Users Management</h3>
          <button variant="contained" color="primary" onClick={openCreateModal} style={{ marginBottom: 16 }}>Create User</button>
          {usersLoading && <div>Loading users...</div>}
          {usersError && <div style={{ color: 'red' }}>{usersError}</div>}
          <table border={1} cellPadding={8} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button size="small" onClick={() => openEditModal(u)}>Edit</button>
                    <button className='btn-delete' size="small" color="error" onClick={() => handleUserDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {userModalOpen && (
            <div
              style={{
                position: 'fixed',
                left: 0, top: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={closeModal}
            >
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  maxWidth: 400,
                  borderRadius: 8,
                  minWidth: 300
                }}
                onClick={e => e.stopPropagation()}
              >
                <form onSubmit={handleUserSave}>
                  <h3 style={{
                  color: 'black'}}>{editUser ? 'Edit User' : 'Create User'}</h3>
                  <div>
                    <label style={{
                  color: 'black'}}>Name</label>
                    <input name="name" value={form.name} onChange={handleFormChange} required />
                  </div>
                  <div>
                    <label style={{
                  color: 'black'}}>Email</label>
                    <input name="email" value={form.email} onChange={handleFormChange} required type="email" />
                  </div>
                  <div>
                    <label style={{
                  color: 'black'}}>Role</label>
                    <select name="role" value={form.role} onChange={handleFormChange} required>
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  {!editUser && (
                    <div>
                      <label>Password</label>
                      <input name="password" value={form.password} onChange={handleFormChange} required type="password" />
                    </div>
                  )}
                  <div style={{ marginTop: 16 }}>
                    <button type="submit">Save</button>
                    <button type="button" onClick={closeModal} style={{ marginLeft: 8 }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
} 