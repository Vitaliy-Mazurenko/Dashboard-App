import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useToaster } from '../components/Toaster';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const sortFields = [
  { value: 'name', label: 'Name' },
  { value: 'service', label: 'Service' },
  { value: 'capital', label: 'Capital' },
  { value: 'createdAt', label: 'Created At' },
];

function CompanyModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || { name: '', service: '', capital: '', location: '' });
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.2)', zIndex: 10 }}>
      <div style={{ background: '#fff', maxWidth: 400, margin: '80px auto', padding: 24, borderRadius: 8 }}>
        <h3>{initial ? 'Edit Company' : 'Create Company'}</h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
          <div><input placeholder="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
          <div><input placeholder="Service" value={form.service} onChange={e => setForm(f => ({...f, service: e.target.value}))} required /></div>
          <div><input placeholder="Capital" type="number" value={form.capital} onChange={e => setForm(f => ({...f, capital: e.target.value}))} required /></div>
          <div><input placeholder="Location" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} /></div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button type="submit">{initial ? 'Save' : 'Create'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompaniesListPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    name: '',
    service: '',
    capitalMin: '',
    capitalMax: '',
    createdAtMin: '',
    createdAtMax: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useQuery({
    queryKey:['companies', filters],
    queryFn: async () => {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] == null) delete params[key];
    });
    const res = await api.get('/companies', { params });
    return res.data;
},});

  const queryClient = useQueryClient();
  const { showToast } = useToaster();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const userId = user?.id || null;
  const userRole = user?.role || null;

  const createPost = async (values) => {
    return await api.post('/companies', values);
  };

  const createMutation = useMutation({
    mutationFn: createPost,
      onSuccess: () => {
        showToast('Company created', 'success');
        setModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['companies']});
      },
      onError: () => showToast('Create failed', 'error'),
  }
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }) => api.put(`/companies/${id}`, values),    

      onSuccess: () => {
        showToast('Company updated', 'success');
        setEditCompany(null);
        queryClient.invalidateQueries({ queryKey: ['companies']});
      },
      onError: () => showToast('Update failed', 'error'),
    }
  );

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/companies/${id}`),    

      onSuccess: () => {
        showToast('Company deleted', 'success');
        queryClient.invalidateQueries( {queryKey: ['companies']});
      },
      onError: () => showToast('Delete failed', 'error'),
    }
  );

  const handleChange = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value, page: 1 }));
  };
  const handleSort = e => {
    setFilters(f => ({ ...f, sortBy: e.target.value, page: 1 }));
  };
  const handleOrder = e => {
    setFilters(f => ({ ...f, sortOrder: e.target.value, page: 1 }));
  };
  const handlePage = newPage => {
    setFilters(f => ({ ...f, page: newPage }));
  };
  const handleLimit = e => {
    setFilters(f => ({ ...f, limit: e.target.value, page: 1 }));
  };

  return (
    <>
    <Navigation />
    <div style={{ maxWidth: 1000, margin: '40px auto' }}>
      <h2>Companies List</h2>
      <button style={{ marginBottom: 16 }} onClick={() => setModalOpen(true)}>Create Company</button>
      <CompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={form => createMutation.mutate(form)}
      />
      <CompanyModal
        open={!!editCompany}
        onClose={() => setEditCompany(null)}
        onSubmit={form => updateMutation.mutate({ id: editCompany.id, ...form })}
        initial={editCompany}
      />
      <form style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }} onSubmit={e => e.preventDefault()}>
        <input name="name" placeholder="Name" value={filters.name} onChange={handleChange} />
        <input name="service" placeholder="Service" value={filters.service} onChange={handleChange} />
        <input name="capitalMin" type="number" placeholder="Capital Min" value={filters.capitalMin} onChange={handleChange} />
        <input name="capitalMax" type="number" placeholder="Capital Max" value={filters.capitalMax} onChange={handleChange} />
        <input name="createdAtMin" type="date" value={filters.createdAtMin} onChange={handleChange} />
        <input name="createdAtMax" type="date" value={filters.createdAtMax} onChange={handleChange} />
        <select name="sortBy" value={filters.sortBy} onChange={handleSort}>
          {sortFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select name="sortOrder" value={filters.sortOrder} onChange={handleOrder}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <select name="limit" value={filters.limit} onChange={handleLimit}>
          {[5, 10, 20, 50].map(l => <option key={l} value={l}>{l} per page</option>)}
        </select>
      </form>
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error loading companies</div>}
      {data && (
        <>
          <table border={1} cellPadding={8} style={{ width: '100%', marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Service</th>
                <th>Capital</th>
                <th>Created At</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.companies.map(c => {
                const canEdit = userRole === 'SuperAdmin' || userRole === 'Admin' || c.ownerId === userId;
                return (
                  <tr key={c.id}>
                    <td><Link to={`/companies/${c.id}`}>{c.name}</Link></td>
                    <td>{c.service}</td>
                    <td>{c.capital}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.ownerId}</td>
                    <td>
                      {canEdit && <>
                        <button onClick={() => setEditCompany(c)}>Edit</button>
                        <button className='btn-delete' onClick={() => { if(window.confirm('Delete company?')) deleteMutation.mutate(c.id); }}>Delete</button>
                      </>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button disabled={filters.page <= 1} onClick={() => handlePage(filters.page - 1)}>Prev</button>
            <span>Page {data.page} of {Math.ceil(data.total / data.limit)}</span>
            <button disabled={data.page >= Math.ceil(data.total / data.limit)} onClick={() => handlePage(filters.page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
    </>
  );
} 