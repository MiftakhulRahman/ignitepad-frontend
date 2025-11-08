"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import {
  RegisterSchema,
  registerSchema,
} from "@/lib/validations/auth.schema"
import { registerUser } from "@/lib/api/auth" // Kita tidak perlu checkUsername di sini dulu

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "", // <-- Tambah
      password: "",
      password_confirmation: "",
      nim: "",
      nidn: "",
    },
  })

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true)
    toast.loading("Membuat akun...")

    try {
      const response = await registerUser(data)

      setUser(response.user, response.access_token)
      toast.dismiss()
      toast.success(`Selamat datang, ${response.user.name}!`)
      router.push("/dashboard")
    } catch (error: any) {
      toast.dismiss()
      console.error("Registrasi Gagal:", error)
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        // Tampilkan semua error validasi
        Object.keys(errors).forEach((key) => {
          // Set error di form
          form.setError(key as keyof RegisterSchema, {
            type: "server",
            message: errors[key][0],
          })
          // Tampilkan toast
          toast.error(errors[key][0])
        })
      } else {
        toast.error("Registrasi gagal: Terjadi kesalahan.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>
            Isi data di bawah untuk mendaftar.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* --- FIELD BARU USERNAME --- */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username_unik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nama@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm font-medium">
                Isi salah satu (NIM untuk Mahasiswa, NIDN untuk Dosen):
              </p>
              <FormField
                control={form.control}
                name="nim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIM (Mahasiswa)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nidn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIDN (Dosen)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 00123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Mendaftar..." : "Daftar"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-primary">
                  Login di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}