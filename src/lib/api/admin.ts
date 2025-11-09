import apiClient from './client';
import { ApiResponse, PaginatedResponse, User } from '@/types';

export const adminApi = {
  // User Management
  async getUsers(page?: number, role?: string, search?: string): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get('/admin/users', {
      params: { page, role, search },
    });
    return response.data;
  },

  async activateUser(userId: number): Promise<ApiResponse<User>> {
    const response = await apiClient.post(`/admin/users/${userId}/activate`);
    return response.data;
  },

  async deactivateUser(userId: number): Promise<ApiResponse<User>> {
    const response = await apiClient.post(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  async deleteUser(userId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Project Management (for admin)
  async getProjects(page?: number, search?: string): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/admin/projects', {
      params: { page, search },
    });
    return response.data;
  },

  async featureProject(slug: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/admin/projects/${slug}/feature`);
    return response.data;
  },

  async unfeatureProject(slug: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete(`/admin/projects/${slug}/feature`);
    return response.data;
  },

  async deleteProject(slug: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/admin/projects/${slug}`);
    return response.data;
  },
  
  // Category Management (for admin)
  async getCategories(page?: number): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/admin/categories', {
      params: { page },
    });
    return response.data;
  },
  
  async createCategory(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/admin/categories', data);
    return response.data;
  },
  
  async updateCategory(id: number, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  
  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },
  
  // Technology Management (for admin)
  async getTechnologies(page?: number): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/admin/technologies', {
      params: { page },
    });
    return response.data;
  },
  
  async createTechnology(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/admin/technologies', data);
    return response.data;
  },
  
  async updateTechnology(id: number, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/admin/technologies/${id}`, data);
    return response.data;
  },
  
  async deleteTechnology(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/admin/technologies/${id}`);
    return response.data;
  },
};