import { User } from "@/types/models"
import apiClient, { apiBase } from "./client"
import { RegisterSchema } from "../validations/auth.schema"

interface RegisterResponse {
  user: User
  access_token: string
}

export const registerUser = async (
  data: RegisterSchema
): Promise<RegisterResponse> => {
  await apiBase.get("/sanctum/csrf-cookie")
  const response = await apiClient.post<RegisterResponse>("/auth/register", data)
  return response.data
}

// FUNGSI BARU
export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean; message: string }> => {
  const response = await apiClient.post("/auth/check-username", { username })
  return response.data
}