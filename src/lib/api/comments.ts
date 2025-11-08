import apiClient from './client';
import { ApiResponse, PaginatedResponse, Comment, CommentFormData } from '@/types';

export const commentApi = {
  async getByProject(projectSlug: string, page?: number): Promise<PaginatedResponse<Comment>> {
    const response = await apiClient.get(`/projects/${projectSlug}/comments`, {
      params: { page },
    });
    return response.data;
  },

  async create(projectSlug: string, data: CommentFormData): Promise<ApiResponse<Comment>> {
    const response = await apiClient.post(`/projects/${projectSlug}/comments`, data);
    return response.data;
  },

  async update(commentId: number, data: { body: string }): Promise<ApiResponse<Comment>> {
    const response = await apiClient.put(`/comments/${commentId}`, data);
    return response.data;
  },

  async delete(commentId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },

  async like(commentId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.post(`/comments/${commentId}/like`);
    return response.data;
  },

  async unlike(commentId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/comments/${commentId}/like`);
    return response.data;
  },
};
