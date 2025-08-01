// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  timeout: 10000,
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejador global de errores
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.detail || 
                   error.response?.data?.error || 
                   'Error en la solicitud';
    
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;