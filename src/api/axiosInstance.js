import axios from 'axios';
import { storage } from '../utils/storage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  try {
    const accessToken = storage.getItem('auth')?.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch (e) {
    console.error('Error adding accessToken', e);
  }
  return config;
});
