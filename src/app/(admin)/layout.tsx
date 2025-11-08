"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import * as React from "react"
import Navbar from "@/components/layout/Navbar" // Kita pakai Navbar yang sama

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
            // 1. Cek jika tidak login
            if (!isAuthenticated) {
                router.replace("/login")
                return
            }

            // 2. Cek jika BUKAN admin
            const isAdmin = user?.roles.some((role) => role.name === "admin")
            if (!isAdmin) {
                toast.error("Anda tidak punya hak akses Admin.")
                router.replace("/dashboard") // Lempar ke dashboard biasa
                return
            }
        }
    }, [isMounted, isAuthenticated, user, router])

    // 3. Cek isAdmin di sini juga
    const isAdmin = user?.roles.some((role) => role.name === "admin")

    if (!isMounted || !isAuthenticated || !isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center">
                Memverifikasi akses...
            </div>
        )
    }

    // 4. Jika lolos, tampilkan layout
    return (
        <div>
            <Navbar />
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold text-destructive mb-4">
                    Admin Panel
                </h1>
                {/* Nanti kita tambahkan sidebar admin di sini */}
                <main>{children}</main>
            </div>
        </div>
    )
}