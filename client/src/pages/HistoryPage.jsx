import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Navigation from '../components/Navigation';

export default function HistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await api.get('/history');
      return res.data;
    }
  });

  return (
    <>
    <Navigation />  
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <h2>History</h2>
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error loading history</div>}
      {data && (
        <table border={1} cellPadding={8} style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {data.map(h => (
              <tr key={h.id}>
                <td>{new Date(h.timestamp).toLocaleString()}</td>
                <td>{h.user ? `${h.user.name} (${h.user.email})` : h.userId}</td>
                <td>{h.action}</td>
                <td>{h.entity}</td>
                <td>{h.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
} 