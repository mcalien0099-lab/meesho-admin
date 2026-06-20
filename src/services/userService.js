import api from './api';

export const userService = {
  getBlockedUsers: async () => {
    const response = await api.get('/admin/blocked-users');
    return response.data;
  },
  
  unblockUser: async (id) => {
    const response = await api.delete(`/admin/blocked-users/${id}`);
    return response.data;
  }
};
