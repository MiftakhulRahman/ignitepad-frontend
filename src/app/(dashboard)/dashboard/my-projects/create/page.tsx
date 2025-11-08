"use client"

import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { useBreadcrumb } from "@/lib/hooks/use-breadcrumb"

export default function CreateProjectPage() {
  // 1. Set breadcrumb
  useBreadcrumb() // Hook akan otomatis generate dari URL

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold mb-6">Buat Proyek Baru</h1>

      {/* 2. Tampilkan Form */}
      <ProjectForm />
    </div>
  )
}