import { apiClient } from './client';
import { getDevicePayload } from '../utils/device';

export const authApi = {
  login: async (email: string, password: string) => {
    const devicePayload = await getDevicePayload();
    const response = await apiClient.post('/auth/login', {
      email,
      password,
      ...devicePayload,
    });
    return response.data;
  },

  register: async (data: any) => {
    const devicePayload = await getDevicePayload();
    const response = await apiClient.post('/auth/register', {
      ...data,
      ...devicePayload,
    });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  updateFcmToken: async (fcmToken: string) => {
    const response = await apiClient.post('/auth/fcm-token', { fcmToken });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
};
