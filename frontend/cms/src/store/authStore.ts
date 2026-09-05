import { useState, useEffect } from 'react';

// Simple global state using event listeners to sync across components without Context boilerplate
let globalToken = localStorage.getItem('peblo_admin_token');

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('peblo_admin_token', token);
  } else {
    localStorage.removeItem('peblo_admin_token');
  }
  globalToken = token;
  window.dispatchEvent(new Event('auth-change'));
};

export const useAuthStore = () => {
  const [token, setTokenState] = useState(globalToken);

  useEffect(() => {
    const handleAuthChange = () => setTokenState(globalToken);
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  return { token, setToken };
};
