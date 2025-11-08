"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import * as React from "react"
// import Navbar from "@/components/layout/Navbar" // <-- HAPUS IMPORT INI

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isMounted, isAuthenticated, router])

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        Memuat...
      </div>
    )
  }

  // Jika sudah login, tampilkan 'children'-nya langsung
  // Navbar akan dirender oleh root layout (src/app/layout.tsx)
  return <>{children}</>
}