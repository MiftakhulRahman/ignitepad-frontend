import Navbar from "@/components/layout/Navbar"
import * as React from "react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  )
}