// src/lib/axiosInstance.ts
// Single configured Axios instance used throughout the app.
// Automatically redirects to /admin-login on 401 responses.

import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
});

// ── Request interceptor: attach auth token if present ────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-logout on 401 ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      // Redirect to login without triggering React Router
      // (safe even if called outside component tree)
      if (window.location.pathname !== '/admin-login') {
        window.location.replace('/admin-login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
