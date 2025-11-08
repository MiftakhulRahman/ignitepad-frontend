import { z } from "zod"

export const projectSchema = z.object({
  title: z.string().min(5, "Judul harus minimal 5 karakter"),
  description: z.string().max(1000, "Deskripsi terlalu panjang").optional(),
  content: z.string().min(50, "Konten proyek harus minimal 50 karakter"),
  category: z.enum([
    "web",
    "mobile",
    "desktop",
    "ai-ml",
    "iot",
    "game",
    "other",
  ]),
  // Kita buat 'tags' sebagai string, lalu kita ubah jadi array
  tags: z
    .string()
    .transform((val) => val.split(",").map((tag) => tag.trim())),
  tech_stack: z
    .string()
    .transform((val) => val.split(",").map((tech) => tech.trim())),
  visibility: z.enum(["public", "unlisted", "private"]),
  status: z.enum(["draft", "published"]),
  allow_comments: z.boolean(),
})

export type ProjectSchema = z.infer<typeof projectSchema>