"use client"

import { getProjects } from "@/lib/api/projects"
import { useQuery } from "@tanstack/react-query"
import { ProjectCard } from "@/components/projects/ProjectCard"

export default function HomePage() {
  // Gunakan TanStack Query untuk fetch data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects", "public"],
    queryFn: getProjects,
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Jelajahi Proyek</h1>

      {isLoading && <p>Loading proyek...</p>}
      {isError && <p>Gagal memuat proyek.</p>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}