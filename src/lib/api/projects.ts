import apiClient from './client';
import { ApiResponse, PaginatedResponse, Project, ProjectFormData, ProjectFilters } from '@/types';

export const projectApi = {
  async getAll(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get('/projects', { params: filters });
    return response.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<Project>> {
    const response = await apiClient.get(`/projects/${slug}`);
    return response.data;
  },

  async create(data: ProjectFormData): Promise<ApiResponse<Project>> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  async update(slug: string, data: Partial<ProjectFormData>): Promise<ApiResponse<Project>> {
    const response = await apiClient.put(`/projects/${slug}`, data);
    return response.data;
  },

  async delete(slug: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/projects/${slug}`);
    return response.data;
  },

  async like(slug: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post(`/projects/${slug}/like`);
    return response.data;
  },

  async unlike(slug: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/projects/${slug}/like`);
    return response.data;
  },

  async save(slug: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post(`/projects/${slug}/save`);
    return response.data;
  },

  async unsave(slug: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/projects/${slug}/save`);
    return response.data;
  },
};
