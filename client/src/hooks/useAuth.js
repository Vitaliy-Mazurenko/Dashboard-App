import { useState, useEffect } from 'react';
import authService from '../utils/authService';

export function useAuth() {
  const [state, setState] = useState({
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getCurrentUser(),
  });

  useEffect(() => {
    return authService.subscribe((snapshot) => setState(snapshot));
  }, []);

  return state;
}