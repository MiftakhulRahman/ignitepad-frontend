// src/lib/api/comments.ts

import { PaginatedResponse } from "./projects"
import apiClient from "./client"
import { User } from "@/types/models"

// ==============================
// 💬 Interface Komentar
// ==============================
export interface Comment {
  id: number
  body: string
  parent_id: number | null
  stats: {
    likes: number
    replies: number
  }
  created_at: string
  author: User
  replies: Comment[]
}

// ==============================
// 📦 Ambil komentar untuk proyek
// ==============================
export const getComments = async (
  slug: string
): Promise<PaginatedResponse<Comment>> => {
  const response = await apiClient.get(`/projects/${slug}/comments`)
  return response.data
}

// ==============================
// 📝 Posting komentar baru
// ==============================
export const postComment = async ({
  slug,
  body,
  parentId,
}: {
  slug: string
  body: string
  parentId?: number | null
}): Promise<Comment> => {
  const response = await apiClient.post(`/projects/${slug}/comments`, {
    body: body,
    parent_id: parentId,
  })
  return response.data.data // Resource tunggal dibungkus 'data'
}

// ==============================
// ❤️ Like & Unlike Komentar
// ==============================

interface CommentLikeResponse {
  message: string
  like_count: number
}

// --- FUNGSI LIKE KOMENTAR ---
export const likeComment = async (commentId: number): Promise<CommentLikeResponse> => {
  const response = await apiClient.post(`/comments/${commentId}/like`)
  return response.data
}

// --- FUNGSI UNLIKE KOMENTAR ---
export const unlikeComment = async (commentId: number): Promise<CommentLikeResponse> => {
  const response = await apiClient.delete(`/comments/${commentId}/like`)
  return response.data
}
