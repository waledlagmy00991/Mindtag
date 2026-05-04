import { apiClient } from './client';

export const attendanceApi = {
  scanAttendance: async (data: {
    qrToken: string;
    sessionId: string;
    studentLat: number;
    studentLng: number;
    accuracy: number;
    isMockLocation: boolean;
  }) => {
    const response = await apiClient.post('/attendance/scan', data);
    return response.data;
  },

  getMyAttendance: async (params: { courseId?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/attendance/me', { params });
    return response.data;
  },

  getMySummary: async () => {
    const response = await apiClient.get('/attendance/me/summary');
    return response.data;
  },
};
