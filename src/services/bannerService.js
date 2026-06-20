import api from './api';

export const bannerService = {
  getAllBanners: async () => {
    const response = await api.get('/banners');
    return response.data;
  },
  
  createBanner: async (data) => {
    const response = await api.post('/admin/banners', data);
    return response.data;
  },

  updateBanner: async (id, data) => {
    const response = await api.put(`/admin/banners/${id}`, data);
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await api.delete(`/admin/banners/${id}`);
    return response.data;
  }
};
