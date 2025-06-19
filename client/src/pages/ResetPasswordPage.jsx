import React, { useState } from 'react';
import api from '../api/axios';
import { useToaster } from '../components/Toaster';

export default function ResetPasswordPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToaster();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { emailOrUsername });
      showToast('If this account exists, a reset link has been sent.', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to send reset link', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', borderRadius: 6, padding: 32 }}>
      <h2 style={{ fontWeight: 700 }}>Reset Password</h2>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Please enter your username or email address. You will receive a link to create a new password via email.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>
            Username or Email Address <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className='button-psw'
          >
            GET NEW PASSWORD
          </button>
          <a
            href="/login"
           className='button-back' 
          >
            Go back
          </a>
        </div>
      </form>
    </div>
  );
} 