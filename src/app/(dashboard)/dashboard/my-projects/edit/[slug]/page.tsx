"use client"

import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { getProjectBySlug, Project } from "@/lib/api/projects"
import { useBreadcrumb } from "@/lib/hooks/use-breadcrumb"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export default function EditProjectPage() {
  const params = useParams()
  const slug = params.slug as string

  // 1. Ambil data proyek yang mau diedit
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug,
  })

  // 2. Set breadcrumb (kita akan update config-nya nanti)
  useBreadcrumb(project)

  if (isLoading || !project) {
    return <div className="container mx-auto py-8">Memuat data proyek...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold mb-6">Edit Proyek</h1>

      {/* 3. Berikan 'initialData' ke ProjectForm */}
      <ProjectForm initialData={project} />
    </div>
  )
}