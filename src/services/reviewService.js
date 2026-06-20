import api from './api';

export const reviewService = {
  getAllReviews: async () => {
    const response = await api.get('/admin/reviews');
    return response.data;
  },
  
  createReview: async (data) => {
    const response = await api.post('/admin/reviews', data);
    return response.data;
  },

  updateReview: async (id, data) => {
    const response = await api.put(`/admin/reviews/${id}`, data);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  }
};
