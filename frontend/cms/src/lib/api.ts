import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/admin';

// Automatically detect GitHub Codespaces environment
if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.dev')) {
  // If we are on port 3000 (CMS) in Codespaces, the backend is on port 8000.
  // The hostname looks like: some-codespace-name-3000.app.github.dev
  const host = window.location.hostname;
  if (host.includes('-3000')) {
    baseURL = `https://${host.replace('-3000', '-8000')}/admin`;
  }
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peblo_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('peblo_admin_token');
      window.dispatchEvent(new Event('auth-change'));
    }
    return Promise.reject(error);
  }
);

export default api;
