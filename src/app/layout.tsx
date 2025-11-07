import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils" // cn utility dari shadcn
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "react-hot-toast" // Provider notifikasi

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
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {/* Provider Dark/Light Mode */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Provider Data Fetching */}
          <QueryProvider>
            {/* Provider Notifikasi Toaster */}
            <Toaster position="top-center" reverseOrder={false} />
            
            {/* Halaman Anda akan dirender di sini */}
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}