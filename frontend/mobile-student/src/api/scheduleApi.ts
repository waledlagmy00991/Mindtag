import { apiClient } from './client';

export const scheduleApi = {
  getWeekly: async () => {
    const response = await apiClient.get('/schedule/me');
    return response.data;
  },

  getToday: async () => {
    const response = await apiClient.get('/schedule/today');
    return response.data;
  },

  getNextLecture: async () => {
    const response = await apiClient.get('/schedule/next-lecture');
    return response.data;
  },

  createSlot: async (data: any) => {
    const response = await apiClient.post('/schedule/slots', data);
    return response.data;
  },

  updateSlot: async (id: string, data: any) => {
    const response = await apiClient.patch(`/schedule/slots/${id}`, data);
    return response.data;
  },

  deleteSlot: async (id: string) => {
    const response = await apiClient.delete(`/schedule/slots/${id}`);
    return response.data;
  },
};
