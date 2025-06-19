import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api/axios';
import { useToaster } from '../components/Toaster';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToaster();
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await api.post('/auth/login', values);
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        showToast('Login successful', 'success');
        navigate('/dashboard');
      } catch (e) {
        showToast(e.response?.data?.message || 'Login failed', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Sign In</h2>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" name="email" onChange={formik.handleChange} value={formik.values.email} />
          {formik.touched.email && formik.errors.email && <div style={{ color: 'red' }}>{formik.errors.email}</div>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" onChange={formik.handleChange} value={formik.values.password} />
          {formik.touched.password && formik.errors.password && <div style={{ color: 'red' }}>{formik.errors.password}</div>}
        </div>
        <button type="submit" disabled={formik.isSubmitting}>Sign In</button>
      </form>
      <div style={{ marginTop: 16 }}>
        <span>Don't have an account? </span>
        <Link to="/register">Sign Up</Link>
      </div>
      <div style={{ marginTop: 16 }}>
        <span>Forgot password? </span>
        <a href="/password">Reset Password</a>
      </div>
    </div>
  );
} 