"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useBreadcrumbStore } from "@/lib/stores/breadcrumb-store"
import { cn } from "@/lib/utils"

export function Breadcrumb() {
  const items = useBreadcrumbStore((state) => state.items)

  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}