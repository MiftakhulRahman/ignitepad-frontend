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
    <Link href={`/projects/${project.slug}`}>
      <Card className="flex flex-col h-full transition-all hover:shadow-md">
        <CardHeader>
          {/* Nanti kita tambahkan <Image /> di sini */}
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            Oleh: {project.author.name}
          </p>
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
    </Link>
  )
}