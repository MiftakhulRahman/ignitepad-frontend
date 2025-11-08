"use client"

import * as React from "react" // <-- 1. TAMBAHKAN IMPORT INI
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import apiClient from "@/lib/api/client"

export default function Navbar() {
  const { isAuthenticated, user, clearUser } = useAuthStore()
  const router = useRouter()

  // 2. Cek role admin (Sekarang React.useMemo akan dikenali)
  const isAdmin = React.useMemo(
    () => user?.roles.some((role) => role.name === "admin"),
    [user]
  )

  const handleLogout = async () => {
    toast.loading("Logging out...")
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.error("Logout error", error)
    } finally {
      clearUser()
      toast.dismiss()
      toast.success("Berhasil logout")
      router.push("/login")
    }
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between p-4">
        <Link href="/" className="font-bold text-xl">
          Ignitepad
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button variant="destructive" asChild>
                  <Link href="/admin/users">Admin Panel</Link>
                </Button>
              )}

              <Button variant="default" asChild>
                <Link href="/dashboard/my-projects/create">Buat Proyek</Link>
              </Button>

              <Button variant="secondary" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}