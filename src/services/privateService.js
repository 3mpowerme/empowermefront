import { api } from '../api/axiosInstance';

export const privateService = {
  async get(path) {
    try {
      privateService;

      const { data } = await api.get(path);
      return data;
    } catch (error) {
      console.error('privateService get error', error);
      throw error.response?.data || error;
    }
  },

  async create(path, body) {
    try {
      const { data } = await api.post(path, body);
      return data;
    } catch (error) {
      console.error('privateService create error', error);
      throw error.response?.data || error;
    }
  },
  async update(path, body) {
    try {
      const { data } = await api.put(path, body);
      return data;
    } catch (error) {
      console.error('privateService update error', error);
      throw error.response?.data || error;
    }
  },
  async patch(path, body) {
    try {
      const { data } = await api.patch(path, body);
      return data;
    } catch (error) {
      console.error('privateService update error', error);
      throw error.response?.data || error;
    }
  },
  async delete(path, body) {
    try {
      const { data } = await api.delete(path, body);
      return data;
    } catch (error) {
      console.error('privateService delete error', error);
      throw error.response?.data || error;
    }
  },
};
