import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "react-hot-toast"
import Navbar from "@/components/layout/Navbar" // <-- 1. Impor Navbar

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Ignitepad - Platform Akademik Kolaboratif",
  description: "Platform untuk berbagi proyek, kolaborasi, dan tantangan akademik.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <Toaster position="top-center" reverseOrder={false} />
            
            {/* 2. Tampilkan Navbar di sini */}
            <Navbar />
            
            {/* 3. Render sisa halaman */}
            <main>{children}</main>
            
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}