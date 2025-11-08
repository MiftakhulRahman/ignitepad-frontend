"use client"

import { Comment, likeComment, unlikeComment } from "@/lib/api/comments"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, MessageSquare } from "lucide-react"
import { useState } from "react"
import { CommentForm } from "./CommentForm"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

interface CommentItemProps {
  comment: Comment
  slug: string
}

export function CommentItem({ comment, slug }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  // --- LOGIC LIKE KOMENTAR ---
  const handleLikeClick = () => {
    if (!isAuthenticated) {
      toast.error("Anda harus login untuk menyukai komentar.")
      router.push("/login")
      return
    }
    likeMutation.mutate()
  }

  const likeMutation = useMutation({
    mutationFn: () => likeComment(comment.id),
    onSuccess: () => {
      // Invalidate query komentar agar count terupdate
      queryClient.invalidateQueries({ queryKey: ["comments", slug] })
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        unlikeMutation.mutate()
      } else {
        toast.error("Gagal menyukai komentar.")
      }
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] })
    },
    onError: () => {
      toast.error("Gagal batal menyukai komentar.")
    },
  })
  // ----------------------------

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={comment.author.avatar || ""} />
        <AvatarFallback>
          {comment.author.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            • {comment.created_at}
          </span>
        </div>

        <p className="mt-2 text-sm">{comment.body}</p>

        <div className="mt-2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleLikeClick}
            disabled={likeMutation.isPending || unlikeMutation.isPending}
          >
            {likeMutation.isPending || unlikeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            <span className="text-xs">{comment.stats.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">
              {showReplyForm ? "Batal" : "Balas"}
            </span>
          </Button>
        </div>

        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              onCommentPosted={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 space-y-6 border-l pl-6">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} slug={slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}