import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  Challenge,
  ChallengeFormData,
  ChallengeFilters,
  ChallengeSubmission,
} from '@/types';

export const challengeApi = {
  async getAll(filters?: ChallengeFilters): Promise<PaginatedResponse<Challenge>> {
    const response = await apiClient.get('/challenges', { params: filters });
    return response.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<Challenge>> {
    const response = await apiClient.get(`/challenges/${slug}`);
    return response.data;
  },

  async create(data: ChallengeFormData): Promise<ApiResponse<Challenge>> {
    const response = await apiClient.post('/challenges', data);
    return response.data;
  },

  async update(slug: string, data: Partial<ChallengeFormData>): Promise<ApiResponse<Challenge>> {
    const response = await apiClient.put(`/challenges/${slug}`, data);
    return response.data;
  },

  async delete(slug: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/challenges/${slug}`);
    return response.data;
  },

  async join(slug: string): Promise<ApiResponse<ChallengeSubmission>> {
    const response = await apiClient.post(`/challenges/${slug}/join`);
    return response.data;
  },

  async submit(slug: string, projectId: number): Promise<ApiResponse<ChallengeSubmission>> {
    const response = await apiClient.post(`/challenges/${slug}/submit`, {
      project_id: projectId,
    });
    return response.data;
  },

  async withdraw(submissionId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/challenge-submissions/${submissionId}/withdraw`);
    return response.data;
  },

  async getSubmissions(slug: string): Promise<PaginatedResponse<ChallengeSubmission>> {
    const response = await apiClient.get(`/challenges/${slug}/submissions`);
    return response.data;
  },

  async announceWinner(
    slug: string,
    projectId: number
  ): Promise<ApiResponse<Challenge>> {
    const response = await apiClient.post(`/challenges/${slug}/announce-winner`, {
      winner_project_id: projectId,
    });
    return response.data;
  },
};
