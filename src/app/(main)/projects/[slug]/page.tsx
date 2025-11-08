"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getProjectBySlug, Project } from "@/lib/api/projects"
import { useBreadcrumb } from "@/lib/hooks/use-breadcrumb"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import {
  LikeButton,
  SaveButton,
} from "@/components/projects/ProjectInteractionButtons"
import { Bookmark, Edit, Share2 } from "lucide-react" // 1. Impor ikon Edit
import { Button } from "@/components/ui/button"
import { CommentSection } from "@/components/comments/CommentSection"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { useAuthStore } from "@/lib/stores/auth-store" // 2. Impor auth store
import Link from "next/link" // 3. Impor Link

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuthStore() // 4. Ambil user yang sedang login

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery<Project>({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug,
  })

  useBreadcrumb(project)

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading project details...</div>
  }

  if (isError || !project) {
    return <div className="container mx-auto p-4">Proyek tidak ditemukan.</div>
  }

  // 5. Cek apakah user login adalah pemilik proyek
  const isOwner = user?.id === project.author.id

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">{project.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Oleh: {project.author.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 6. Tampilkan tombol Edit jika 'isOwner' */}
          {isOwner && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/my-projects/edit/${project.slug}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          <LikeButton
            slug={project.slug}
            initialLikes={project.stats.likes}
          />
          <SaveButton
            slug={project.slug}
            initialSaves={project.stats.saves}
          />
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <article className="prose dark:prose-invert mt-8 max-w-none">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {project.content}
        </ReactMarkdown>
      </article>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Komentar ({project.stats.comments})</h2>
        <CommentSection slug={project.slug} /> 
      </div>
    </div>
  )
}