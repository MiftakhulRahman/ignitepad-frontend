import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '@/types';

export const categoriesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/categories/${slug}`);
    return response.data;
  },
};