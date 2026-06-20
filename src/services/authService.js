import api from './api';

export const authService = {
  login: async (credentials) => {
    // Expected credentials: { email, password }
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },
  
  verify: async () => {
    const response = await api.get('/admin/verify');
    return response.data;
  }
};
