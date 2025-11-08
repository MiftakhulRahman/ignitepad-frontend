import apiClient from './client';
import { ApiResponse, DashboardStats, PaginatedResponse, Project, Challenge } from '@/types';

export const dashboardApi = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  async getMyProjects(page?: number): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get('/dashboard/my-projects', {
      params: { page },
    });
    return response.data;
  },

  async getSavedProjects(page?: number): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get('/dashboard/saved-projects', {
      params: { page },
    });
    return response.data;
  },

  async getMyChallenges(page?: number): Promise<PaginatedResponse<Challenge>> {
    const response = await apiClient.get('/dashboard/my-challenges', {
      params: { page },
    });
    return response.data;
  },
};
