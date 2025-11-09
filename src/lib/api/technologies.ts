import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '@/types';

export const technologiesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/technologies');
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/technologies/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/technologies/${slug}`);
    return response.data;
  },
};