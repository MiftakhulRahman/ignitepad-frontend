"use client"

import { useParams, notFound } from "next/navigation" // <-- 1. Impor notFound
import { useQuery } from "@tanstack/react-query"
import { getPublicProfile, PublicProfile } from "@/lib/api/profile"
import { useBreadcrumb } from "@/lib/hooks/use-breadcrumb"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { Github, Linkedin, Globe } from "lucide-react"

export default function ProfilePage() {
  const params = useParams()

  const rawParam = params.username as string

  // --- PERBAIKAN DI SINI ---
  // 2. Cek apakah parameter DIAWALI dengan @
  //    Kita juga dekode untuk menangani '%40'
  const decodedParam = decodeURIComponent(rawParam || "")

  if (!decodedParam || !decodedParam.startsWith("@")) {
    // 3. Jika tidak, panggil notFound()
    notFound()
  }

  // 4. Jika lolos, hilangkan '@' untuk dikirim ke API
  const username = decodedParam.substring(1)
  // --- AKHIR PERBAIKAN ---


  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<PublicProfile>({
    queryKey: ["profile", username],
    queryFn: () => getPublicProfile(username),
    enabled: !!username,
  })

  useBreadcrumb(user)

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading profile...</div>
  }

  if (isError || !user) {
    // Ini akan menangani jika user 'miftakhulrahman' tidak ada di DB
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb />

      <div className="flex flex-col md:flex-row items-center gap-8">
        <Avatar className="h-32 w-32">
          <AvatarImage src={user.avatar || ""} />
          <AvatarFallback className="text-4xl">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <p className="text-xl text-muted-foreground">@{user.username}</p>
          <p className="text-lg text-muted-foreground mt-2">
            {user.nim ? `NIM: ${user.nim}` : `NIDN: ${user.nidn}`}
          </p>
          <p className="mt-4 max-w-lg">{user.bio}</p>
          <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
            {/* ... (link sosial tetap sama) ... */}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Proyek Milik {user.name}</h2>
        {user.projects && user.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{user.name} belum memublikasikan proyek.</p>
        )}
      </div>
    </div>
  )
}