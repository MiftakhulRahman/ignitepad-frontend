"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getProjectBySlug } from "@/lib/api/projects"
import { useBreadcrumb } from "@/lib/hooks/use-breadcrumb" // <-- 1. Impor hook
import { Breadcrumb } from "@/components/layout/Breadcrumb" // <-- 2. Impor komponen

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug, // Hanya jalankan jika slug ada
  })

  // 3. Gunakan hook untuk mengisi data breadcrumb secara dinamis
  useBreadcrumb(project)

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading project details...</div>
  }

  if (isError || !project) {
    return <div className="container mx-auto p-4">Proyek tidak ditemukan.</div>
  }

  return (
    <div className="container mx-auto py-8">
      {/* 4. Tampilkan komponen Breadcrumb */}
      <Breadcrumb />

      <h1 className="text-4xl font-bold">{project.title}</h1>
      <p className="text-lg text-muted-foreground mt-2">
        Oleh: {project.author.name}
      </p>

      {/* Nanti kita render 'content' (Markdown) di sini */}
      <div className="prose dark:prose-invert mt-8 max-w-none">
        {project.content}
      </div>
    </div>
  )
}