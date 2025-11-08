"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "react-hot-toast"
// (Import Navbar sudah dihapus)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.replace("/login")
        return
      }

      const isAdmin = user?.roles.some((role) => role.name === "admin")
      if (!isAdmin) {
        toast.error("Anda tidak punya hak akses Admin.")
        router.replace("/dashboard")
        return
      }
    }
  }, [isMounted, isAuthenticated, user, router])

  const isAdmin = user?.roles.some((role) => role.name === "admin")

  if (!isMounted || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        Memverifikasi akses...
      </div>
    )
  }

  // Tampilkan isi admin (Navbar akan dirender oleh root layout)
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-destructive mb-4">
        Admin Panel
      </h1>
      <main>{children}</main>
    </div>
  )
}