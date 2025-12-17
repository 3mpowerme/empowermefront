import { api } from '../api/axiosInstance';

export const privateService = {
  async get(path, config) {
    try {
      const { data } = await api.get(path, config);
      return data;
    } catch (error) {
      console.error('privateService get error', error);
      throw error.response?.data || error;
    }
  },

  async create(path, body, config) {
    try {
      const { data } = await api.post(path, body, config);
      return data;
    } catch (error) {
      console.error('privateService create error', error);
      throw error.response?.data || error;
    }
  },

  async upload(path, formData, config) {
    try {
      const { data } = await api.post(path, formData, {
        ...(config || {}),
        headers: {
          ...((config && config.headers) || {}),
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      console.error('privateService upload error', error);
      throw error.response?.data || error;
    }
  },

  async update(path, body, config) {
    try {
      const { data } = await api.put(path, body, config);
      return data;
    } catch (error) {
      console.error('privateService update error', error);
      throw error.response?.data || error;
    }
  },

  async patch(path, body, config) {
    try {
      const { data } = await api.patch(path, body, config);
      return data;
    } catch (error) {
      console.error('privateService update error', error);
      throw error.response?.data || error;
    }
  },

  async delete(path, config) {
    try {
      const { data } = await api.delete(path, config);
      return data;
    } catch (error) {
      console.error('privateService delete error', error);
      throw error.response?.data || error;
    }
  },
};
