import api from './api';

export const orderService = {
  getAllOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  }
};
