import { Project } from "@/lib/api/projects"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Eye, Heart, MessageSquare } from "lucide-react"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    // 1. Hapus <Link> yang membungkus <Card>
    <Card className="flex flex-col h-full transition-all hover:shadow-md w-full">
      <CardHeader>
        {/* 2. Jadikan Judul sebagai Link ke Proyek */}
        <Link href={`/projects/${project.slug}`}>
          <CardTitle className="text-lg hover:underline">{project.title}</CardTitle>
        </Link>
        <CardDescription className="line-clamp-2 pt-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* 3. Link Author (sudah benar, tidak ada nesting) */}
        <Link
          href={`/profile/@${project.author.username}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Oleh: {project.author.name}
        </Link>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{project.stats.views}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{project.stats.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{project.stats.comments}</span>
        </div>
      </CardFooter>
    </Card>
  )
}