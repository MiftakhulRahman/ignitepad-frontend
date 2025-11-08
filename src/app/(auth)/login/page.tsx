"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import apiClient, { apiBase } from "@/lib/api/client"
import { toast } from "react-hot-toast"
import { useAuthStore } from "@/lib/stores/auth-store"

// Komponen UI
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

  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    toast.loading("Mencoba login...")

    try {
      // Dapatkan CSRF cookie (jika backend Laravel Sanctum)
      await apiBase.get("/sanctum/csrf-cookie")

      // Kirim data login ke backend
      const response = await apiClient.post("/auth/login", {
        email: email,
        password: password,
      })

      // Simpan user dan token ke store global
      setUser(response.data.user, response.data.access_token)

      toast.dismiss()
      toast.success(`Selamat datang, ${response.data.user.name}!`)

      // Arahkan ke dashboard
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

          {/* Bagian Footer yang sudah diubah */}
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </Button>

            {/* Link ke halaman register */}
            <p className="text-sm text-center text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-primary">
                Daftar di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
