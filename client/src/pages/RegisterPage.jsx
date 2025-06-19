import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api/axios';
import { useToaster } from '../components/Toaster';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToaster();
  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await api.post('/auth/register', values);
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        showToast('Registration successful', 'success');
        navigate('/dashboard');
      } catch (e) {
        showToast(e.response?.data?.message || 'Registration failed', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Sign Up</h2>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label>Name</label>
          <input type="text" name="name" onChange={formik.handleChange} value={formik.values.name} />
          {formik.touched.name && formik.errors.name && <div style={{ color: 'red' }}>{formik.errors.name}</div>}
        </div>
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
        <button type="submit" disabled={formik.isSubmitting}>Sign Up</button>
      </form>
      <div style={{ marginTop: 16 }}>
        <span>Already have an account? </span>
        <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
} 