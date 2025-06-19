import React, { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToaster } from '../components/Toaster';
import Navigation from '../components/Navigation';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


export default function ProfilePage() {

  const token = localStorage.getItem('accessToken');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
  const queryClient = useQueryClient();
  const fileInputRef = useRef();
  const { showToast } = useToaster();

  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId
  });

  const updateMutation = useMutation({
    mutationFn: (values) => api.put(`/users/${userId}`, values),

    onSuccess: () => {
      showToast('Profile updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: () => showToast('Update failed', 'error'),
  });


  const passwordMutation = useMutation({
    mutationFn: (values) => api.put(`/users/${userId}`, values),


    onSuccess: () => showToast('Password changed', 'success'),
    onError: () => showToast('Password change failed', 'error'),
  });

  const avatarMutation = useMutation({
    mutationFn: (formData) => api.patch(`/users/${userId}/avatar`, formData),

    onSuccess: () => {
      showToast('Avatar updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: () => showToast('Avatar update failed', 'error'),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => api.delete(`/users/${userId}/avatar`),

    onSuccess: () => {
      showToast('Avatar deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: () => showToast('Avatar delete failed', 'error'),
  });

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <>
    <Navigation />  
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h2>Profile</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Avatar:</strong><br />
        {data.avatar ? (
          <img src={`${API_URL}/${data.avatar.replace(/\\/g, '/')}`} alt="avatar" style={{ maxWidth: 100, maxHeight: 100, borderRadius: '50%' }} />
        ) : (
          <span>No avatar</span>
        )}
        <div style={{ marginTop: 8 }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*"
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                const formData = new FormData();
                formData.append('avatar', file);
                avatarMutation.mutate(formData);
              }
            }}
          />
          <button onClick={() => fileInputRef.current.click()}>Upload/Change</button>
          {data.avatar && <button onClick={() => deleteAvatarMutation.mutate()}>Delete</button>}
        </div>
      </div>
      <form onSubmit={e => {
        e.preventDefault();
        const form = e.target;
        updateMutation.mutate({
          name: form.name.value,
          email: form.email.value,
        });
      }}>
        <div>
          <label>Name</label>
          <input name="name" defaultValue={data.name} />
        </div>
        <div>
          <label>Email</label>
          <input name="email" defaultValue={data.email} />
        </div>
        <button type="submit" disabled={updateMutation.isLoading}>Save</button>
      </form>
      <h3 style={{ marginTop: 32 }}>Change Password</h3>
      <form onSubmit={e => {
        e.preventDefault();
        const form = e.target;
        if (form.newPassword.value !== form.confirmPassword.value) {
          showToast('Passwords do not match', 'error');
          return;
        }
        passwordMutation.mutate({
          password: form.newPassword.value,
          currentPassword: form.currentPassword.value,
        });
      }}>
        <div>
          <label>Current Password</label>
          <input name="currentPassword" type="password" required />
        </div>
        <div>
          <label>New Password</label>
          <input name="newPassword" type="password" required />
        </div>
        <div>
          <label>Confirm Password</label>
          <input name="confirmPassword" type="password" required />
        </div>
        <button type="submit" disabled={passwordMutation.isLoading}>Change Password</button>
      </form>
    </div>
    </>
  );
} 