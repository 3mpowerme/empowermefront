import { api } from '../api/axiosInstance';

export const signup = async ({ email, password, companyName, countryCode }) => {
  try {
    const response = await api.post('/auth/signup', {
      email,
      password,
      companyName,
      countryCode,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async ({ accessToken }) => {
  try {
    const response = await api.post('/auth/logout', { accessToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyEmail = async ({ email, code }) => {
  try {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const forgotPassword = async ({ email }) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const confirmForgotPassword = async ({ email, code, newPassword }) => {
  try {
    const response = await api.post('/auth/reset-password', {
      email,
      code,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const google = async ({ idToken, countryCode, companyName }) => {
  try {
    const response = await api.post('/auth/google', {
      idToken,
      countryCode,
      companyName,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;
