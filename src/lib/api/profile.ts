import { Project } from "./projects"
import apiClient from "./client"
import { User } from "@/types/models"

export interface PublicProfile extends User {
  projects: Project[]
}

// Ganti 'userId: string' menjadi 'username: string'
export const getPublicProfile = async (
  username: string
): Promise<PublicProfile> => {
  // Ubah rute ke /profiles/@{username}
  const response = await apiClient.get(`/profiles/@${username}`)
  return response.data.data // Resource tunggal dibungkus 'data'
}