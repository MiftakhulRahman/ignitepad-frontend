"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { postComment } from "@/lib/api/comments"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface CommentFormProps {
    slug: string
    parentId?: number | null
    onCommentPosted: () => void // Untuk menutup form balasan
}

export function CommentForm({
    slug,
    parentId = null,
    onCommentPosted,
}: CommentFormProps) {
    const [body, setBody] = useState("")
    const router = useRouter()
    const queryClient = useQueryClient()
    const { isAuthenticated } = useAuthStore()

    const { mutate, isPending } = useMutation({
        mutationFn: postComment,
        onSuccess: () => {
            toast.success("Komentar berhasil diposting!")
            setBody("")
            onCommentPosted() // Panggil callback
            // Invalidate query agar komentar baru muncul
            queryClient.invalidateQueries({ queryKey: ["comments", slug] })
            queryClient.invalidateQueries({ queryKey: ["project", slug] }) // Update stats
        },
        onError: (error) => {
            console.error(error)
            toast.error("Gagal memposting komentar.")
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!body.trim()) return

        if (!isAuthenticated) {
            toast.error("Anda harus login untuk berkomentar.")
            router.push("/login")
            return
        }

        mutate({ slug, body, parentId })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
                placeholder={parentId ? "Tulis balasan Anda..." : "Tulis komentar Anda..."}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
            />
            <div className="flex justify-end gap-2">
                {parentId && ( // Tampilkan tombol batal jika ini form balasan
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCommentPosted} // onCommentPosted juga berfungsi sbg 'onCancel'
                    >
                        Batal
                    </Button>
                )}
                <Button type="submit" disabled={isPending || !body.trim()}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim
                </Button>
            </div>
        </form>
    )
}