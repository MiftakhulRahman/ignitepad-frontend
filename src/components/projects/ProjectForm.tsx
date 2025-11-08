"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import {
  ProjectSchema,
  projectSchema,
  ProjectFormInput,
} from "@/lib/validations/project.schema"
import { createProject, updateProject, Project } from "@/lib/api/projects" // 1. Impor 'updateProject' dan 'Project'

// Impor komponen UI
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const categories = [
  { value: "web", label: "Web Development" },
  { value: "mobile", label: "Mobile Development" },
  { value: "desktop", label: "Desktop App" },
  { value: "ai-ml", label: "AI/Machine Learning" },
  { value: "iot", label: "Internet of Things (IoT)" },
  { value: "game", label: "Game Development" },
  { value: "other", label: "Lainnya" },
]

// 2. Tambahkan prop 'initialData'
interface ProjectFormProps {
  initialData?: Project
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  
  // 3. Tentukan apakah ini mode 'Edit'
  const isEditMode = !!initialData

  const form = useForm<ProjectFormInput>({
    resolver: zodResolver(projectSchema),
    // 4. Set defaultValues berdasarkan mode
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      category: initialData?.category || "web",
      // Ubah string[] (dari API) menjadi string "tag1, tag2" (untuk form)
      tags: initialData?.tags?.join(", ") || "",
      tech_stack: initialData?.tech_stack?.join(", ") || "",
      visibility: initialData?.visibility || "public",
      status: initialData?.status || "published",
      allow_comments: initialData?.allow_comments ?? true,
    },
  })

  // 5. Modifikasi onSubmit
  const onSubmit = async (data: ProjectSchema) => {
    setIsLoading(true)
    const toastId = toast.loading(
      isEditMode ? "Menyimpan perubahan..." : "Memublikasikan proyek..."
    )

    try {
      let project: Project
      
      if (isEditMode) {
        // Mode EDIT
        project = await updateProject({ slug: initialData.slug, data })
      } else {
        // Mode CREATE
        project = await createProject(data)
      }

      toast.dismiss(toastId)
      toast.success(
        isEditMode ? "Proyek berhasil diperbarui!" : "Proyek berhasil dipublikasikan!"
      )
      
      // Redirect ke halaman detail proyek
      router.push(`/projects/${project.slug}`)
      router.refresh() // Paksa refresh data di client
      
    } catch (error: any) {
      toast.dismiss(toastId)
      console.error("Gagal menyimpan proyek:", error)
      toast.error("Gagal menyimpan proyek.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ... (Semua FormFields tetap sama persis) ... */}
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Proyek</FormLabel>
              <FormControl>
                <Input placeholder="Proyek Saya yang Keren" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Singkat</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Penjelasan singkat (1-2 kalimat) tentang proyek Anda"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten Proyek</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan proyek Anda secara mendetail di sini. Anda bisa menggunakan format Markdown."
                  className="min-h-[300px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori proyek" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tech_stack"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teknologi yang Digunakan (Tech Stack)</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Laravel, Next.js, MySQL" {...field} />
              </FormControl>
              <FormDescription>Pisahkan dengan koma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: web, portfolio, akademik" {...field} />
              </FormControl>
              <FormDescription>Pisahkan dengan koma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="allow_comments"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Izinkan Komentar</FormLabel>
                <FormDescription>
                  Bolehkan pengguna lain memberi komentar di proyek Anda.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 6. Ganti teks tombol berdasarkan mode */}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Menyimpan..."
            : isEditMode
            ? "Simpan Perubahan"
            : "Publikasikan Proyek"}
        </Button>
      </form>
    </Form>
  )
}