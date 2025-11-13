import { api } from '../api/axiosInstance';

export const genericService = {
  async getAll(path) {
    try {
      const { data } = await api.get(path);
      return data;
    } catch (error) {
      console.error('genericService getAll error', error);
      throw error.response?.data || error;
    }
  },

  async create(path, body) {
    try {
      const { data } = await api.post(path, body);
      return data;
    } catch (error) {
      console.error('genericService create error', error);
      throw error.response?.data || error;
    }
  },
};
