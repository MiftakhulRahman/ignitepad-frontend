import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User } from '@/types/models' // Impor tipe data kita

// Definisikan bentuk state dan action
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User, token: string) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  // Gunakan middleware 'persist'
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Action untuk set user saat login
      setUser: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      
      // Action untuk clear user saat logout
      clearUser: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'ignitepad-auth-storage', // Nama key di localStorage
      storage: createJSONStorage(() => localStorage), // (default)
    }
  )
)