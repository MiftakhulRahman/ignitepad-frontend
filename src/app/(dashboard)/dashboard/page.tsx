"use client"

import { useAuthStore } from "@/lib/stores/auth-store"

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
    </div>
  )
}