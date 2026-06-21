import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://tripcraft-es0k.onrender.com' : ''), // Fail-safe fallback to deployed Render backend in production
  withCredentials: true, // Crucial for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token to Authorization header if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized access globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage auth indicator if unauthorized response occurs
      localStorage.removeItem('tc_authenticated');
      localStorage.removeItem('tc_token');
    }
    return Promise.reject(error);
  }
);

export default api;
