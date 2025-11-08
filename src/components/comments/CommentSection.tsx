"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getComments } from "@/lib/api/comments"
import { CommentForm } from "./CommentForm"
import { CommentItem } from "./CommentItem"
// (Echo dan useEffect dihapus)

interface CommentSectionProps {
  slug: string
  projectId: number // Kita biarkan prop ini, tidak masalah
}

export function CommentSection({ slug, projectId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", slug],
    queryFn: () => getComments(slug),
  })

  // (Listener WebSocket useEffect dihapus)

  return (
    <div className="space-y-8">
      <CommentForm 
        slug={slug} 
        onCommentPosted={() => {
          // Refresh list komentar setelah posting
          queryClient.invalidateQueries({ queryKey: ["comments", slug] })
          queryClient.invalidateQueries({ queryKey: ["project", slug] })
        }} 
      />

      <div className="space-y-6">
        {isLoading && <p>Loading komentar...</p>}
        {isError && <p>Gagal memuat komentar.</p>}

        {data && data.data.length === 0 && (
          <p className="text-muted-foreground">Belum ada komentar.</p>
        )}

        {data &&
          data.data.map((comment) => (
            <CommentItem key={comment.id} comment={comment} slug={slug} />
          ))}
      </div>
    </div>
  )
}