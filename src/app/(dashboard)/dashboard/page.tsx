"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import Link from "next/link"

export default function DashboardPage() {
  // Ambil data user dari store
  const user = useAuthStore((state) => state.user)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Selamat Datang di Dashboard</h1>
      <p className="mt-2 text-lg">
        Halo, <span className="font-semibold">{user?.name}</span>!
      </p>
      <p>Role Anda adalah: {user?.roles[0]?.name}</p>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Navigasi Cepat</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/my-projects" className="p-4 border rounded-lg hover:bg-muted">
            Proyek Saya
          </Link>
          <Link href="/dashboard/saved-projects" className="p-4 border rounded-lg hover:bg-muted">
            Proyek Tersimpan
          </Link>
          <Link href="/dashboard/my-challenges" className="p-4 border rounded-lg hover:bg-muted">
            Challenge Saya
          </Link>
        </div>
      </div>
    </div>
  )
}