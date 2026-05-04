import { apiClient } from './client';

export const notificationApi = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications'); // Matching controller route
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};
