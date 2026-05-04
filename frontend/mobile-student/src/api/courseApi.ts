import { apiClient } from './client';

export const courseApi = {
  getCourses: (params?: { search?: string; department?: string; page?: number; limit?: number }) => 
    apiClient.get('/courses', { params }),
  
  getCourseById: (id: string) => 
    apiClient.get(`/courses/${id}`),
    
  enroll: (courseId: string) => 
    apiClient.post(`/courses/${courseId}/enroll`),
    
  unenroll: (courseId: string) => 
    apiClient.delete(`/courses/${courseId}/enroll`),

  getMyEnrollments: () =>
    apiClient.get('/courses/enrolled'), // Custom endpoint if available, or filter /courses
};
