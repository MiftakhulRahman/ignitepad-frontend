"use client"

import { Button } from "@/components/ui/button"
import {
  likeProject,
  unlikeProject,
  saveProject,
  unsaveProject,
} from "@/lib/api/projects"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Heart, Bookmark, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

// --- 1. LIKE BUTTON ---

interface LikeButtonProps {
  slug: string
  initialLikes: number
  // Nanti kita tambahkan:
  // isLiked: boolean
}

export function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Cek apakah user sudah login
  const handleLikeClick = () => {
    if (!isAuthenticated) {
      toast.error("Anda harus login untuk menyukai proyek ini.")
      router.push("/login")
      return
    }
    likeMutation.mutate()
  }

  const likeMutation = useMutation({
    mutationFn: () => likeProject(slug),
    onSuccess: (data) => {
      toast.success(data.message)
      // Perbarui cache secara manual agar UI update instan
      queryClient.setQueryData(
        ["project", slug],
        (oldData: any) => ({
          ...oldData,
          stats: { ...oldData.stats, likes: data.like_count },
        })
      )
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        unlikeMutation.mutate()
      } else {
        toast.error("Gagal menyukai proyek.")
      }
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeProject(slug),
    onSuccess: (data) => {
      toast.success(data.message)
      // Perbarui cache secara manual
      queryClient.setQueryData(
        ["project", slug],
        (oldData: any) => ({
          ...oldData,
          stats: { ...oldData.stats, likes: data.like_count },
        })
      )
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: () => {
      toast.error("Gagal membatalkan like.")
    },
  })

  const isLoading = likeMutation.isPending || unlikeMutation.isPending

  return (
    <Button
      variant="outline"
      onClick={handleLikeClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Heart className="mr-2 h-4 w-4" />
      )}
      {/* (Nanti kita akan ambil 'initialLikes' dari data query) */}
      Like
    </Button>
  )
}


// --- 2. SAVE BUTTON (BARU) ---

interface SaveButtonProps {
  slug: string
  initialSaves: number
  // Nanti kita tambahkan:
  // isSaved: boolean
}

export function SaveButton({ slug, initialSaves }: SaveButtonProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      toast.error("Anda harus login untuk menyimpan proyek ini.")
      router.push("/login")
      return
    }
    saveMutation.mutate()
  }

  const saveMutation = useMutation({
    mutationFn: () => saveProject(slug),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.setQueryData(
        ["project", slug],
        (oldData: any) => ({
          ...oldData,
          stats: { ...oldData.stats, saves: data.save_count },
        })
      )
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        unsaveMutation.mutate()
      } else {
        toast.error("Gagal menyimpan proyek.")
      }
    },
  })

  const unsaveMutation = useMutation({
    mutationFn: () => unsaveProject(slug),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.setQueryData(
        ["project", slug],
        (oldData: any) => ({
          ...oldData,
          stats: { ...oldData.stats, saves: data.save_count },
        })
      )
    },
    onError: () => {
      toast.error("Gagal membatalkan simpan.")
    },
  })

  const isLoading = saveMutation.isPending || unsaveMutation.isPending

  return (
    <Button
      variant="outline"
      onClick={handleSaveClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className="mr-2 h-4 w-4" />
      )}
      Save
    </Button>
  )
}