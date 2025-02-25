// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authorization
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      // Add userId to the body for contact operations that require user identification
      if (
        ['post', 'put', 'delete'].includes(config.method) && 
        !config.url.includes('/auth/')
      ) {
        config.data = {
          ...config.data,
          userId: userData.userId
        };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;