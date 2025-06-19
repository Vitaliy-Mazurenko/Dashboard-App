import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <nav className='nav-bar'>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/companies">Companies</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/history">History</Link>
      <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</button>
    </nav>
  );
}