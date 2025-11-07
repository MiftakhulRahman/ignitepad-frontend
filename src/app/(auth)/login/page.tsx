"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation" // <-- 1. Impor router
import apiClient, { apiBase } from "@/lib/api/client"
import { toast } from "react-hot-toast"
import { useAuthStore } from "@/lib/stores/auth-store" // <-- 2. Impor auth store

// Impor komponen UI
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter() // <-- 3. Inisialisasi router
  const setUser = useAuthStore((state) => state.setUser) // <-- 4. Ambil action 'setUser'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    toast.loading("Mencoba login...")

    try {
      await apiBase.get("/sanctum/csrf-cookie")
      
      const response = await apiClient.post("/auth/login", {
        email: email,
        password: password,
      })

      // 5. Berhasil! Simpan user dan token ke store
      setUser(response.data.user, response.data.access_token)
      
      toast.dismiss()
      toast.success(`Selamat datang, ${response.data.user.name}!`)
      
      // 6. Redirect ke dashboard
      router.push("/dashboard")

    } catch (error: any) {
      toast.dismiss()
      console.error("Login Gagal:", error)
      
      if (error.response?.status === 401) {
        toast.error("Login gagal: Email atau password salah.")
      } else {
        toast.error("Login gagal: Terjadi kesalahan pada server.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // ... (Kode JSX form-nya tetap sama, tidak perlu diubah) ...
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login ke Ignitepad</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda di bawah ini.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}