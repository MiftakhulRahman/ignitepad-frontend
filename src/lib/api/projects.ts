import apiClient from "./client"
import { User } from "@/types/models" // Kita akan buat tipe Project nanti

// Definisikan tipe data Project (simplified)
export interface Project {
  id: number
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  category: string
  tags: string[]
  tech_stack: string[]
  status: string
  visibility: string
  author: User // Relasi ke User
  stats: {
    views: number
    likes: number
    comments: number
    saves: number
  }
  content?: string // 'content' opsional
  published_at: string
  created_at: string
}

// Tipe data untuk Paginasi Laravel
export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

// Fungsi untuk mengambil semua proyek (publik)
export const getProjects = async (): Promise<PaginatedResponse<Project>> => {
  const response = await apiClient.get("/projects")
  return response.data
}

// Fungsi untuk mengambil satu proyek by slug
export const getProjectBySlug = async (slug: string): Promise<Project> => {
  const response = await apiClient.get(`/projects/${slug}`)
  return response.data.data // API kita membungkusnya di 'data'
}