import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nama harus minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    // Tambah validasi username
    username: z
      .string()
      .min(3, "Username minimal 3 karakter")
      .max(50, "Username maksimal 50 karakter")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username hanya boleh berisi huruf, angka, dan underscore"
      ),
    password: z.string().min(8, "Password harus minimal 8 karakter"),
    password_confirmation: z.string(),
    nim: z.string().optional(),
    nidn: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  })
  .refine((data) => !!data.nim || !!data.nidn, {
    message: "NIM (untuk mahasiswa) atau NIDN (untuk dosen) wajib diisi",
    path: ["nim"],
  })

export type RegisterSchema = z.infer<typeof registerSchema>