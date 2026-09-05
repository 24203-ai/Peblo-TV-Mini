import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/admin';

// If running in GitHub Codespaces, dynamically map to the backend's forwarded port
if (apiUrl.includes('localhost') && window.location.hostname.includes('github.dev')) {
  // Codespace URLs look like: https://<codespace>-3000.app.github.dev
  // We replace the frontend port (3000) with the backend port (8000)
  apiUrl = window.location.origin.replace('-3000', '-8000') + '/admin';
}

const api = axios.create({
  baseURL: apiUrl,
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
