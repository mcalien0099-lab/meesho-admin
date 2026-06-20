import api from './api';

export const settingService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  updateSettings: async (data) => {
    // The backend uses PUT or POST for settings update. Usually it's POST to /admin/settings if it updates the global settings
    const response = await api.post('/admin/settings', data);
    return response.data;
  }
};
