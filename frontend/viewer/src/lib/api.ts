import axios from 'axios';

// The viewer app just reads the atomic JSON file built by the CMS
const api = axios.create({
  baseURL: 'http://localhost:8000/assets', 
});

export const fetchCatalogue = async () => {
  // Add a cache buster timestamp for local dev
  const res = await api.get(`/catalogue.json?t=${new Date().getTime()}`);
  return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
};

export default api;
