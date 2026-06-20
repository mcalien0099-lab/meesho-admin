import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Base URL for API

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    // We'll store the token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
