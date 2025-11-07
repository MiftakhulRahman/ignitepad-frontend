"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import * as React from "react"
import Navbar from "@/components/layout/Navbar" // <-- 1. IMPORT NAVBAR

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  // State untuk melacak apakah komponen sudah 'mounted' di client
  const [isMounted, setIsMounted] = React.useState(false)

  // 2. Gunakan useEffect untuk menandai bahwa kita ada di client
  React.useEffect(() => {
    setIsMounted(true)
  }, []) // Efek ini hanya jalan sekali di client

  // 3. Cek otentikasi HANYA SETELAH 'isMounted' true
  React.useEffect(() => {
    // Jika sudah mounted (client-side) DAN tidak login, baru redirect
    if (isMounted && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isMounted, isAuthenticated, router]) // Jalankan cek ini

  // 4. Tampilkan loading jika:
  //    a) Masih di server-side (isMounted == false)
  //    b) Sudah di client-side tapi belum login (sedang proses redirect)
  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        Memuat...
      </div>
    )
  }

  // 5. Jika mounted dan login, tampilkan layout dashboard
  return (
    <div>
      <Navbar /> {/* <-- 6. TAMPILKAN NAVBAR DI SINI */}
      <main>{children}</main>
    </div>
  )
}