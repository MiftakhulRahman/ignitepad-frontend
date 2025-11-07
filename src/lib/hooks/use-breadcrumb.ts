import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useBreadcrumbStore } from "@/lib/stores/breadcrumb-store"
import { breadcrumbConfig } from "@/lib/constants/breadcrumb-config"

// Tipe data dari config
import { type BreadcrumbItem } from "@/lib/constants/breadcrumb-config"

export function useBreadcrumb(dynamicData?: Record<string, any>) {
  const pathname = usePathname()
  const setItems = useBreadcrumbStore((state) => state.setItems)

  useEffect(() => {
    // Cari route yang cocok
    let matchedRoute = pathname
    let config = breadcrumbConfig[pathname]

    // Jika tidak ada yg cocok, cari rute dinamis
    if (!config) {
      const routes = Object.keys(breadcrumbConfig)
      matchedRoute =
        routes.find((route) => {
          const pattern = route.replace(/\[([^\]]+)\]/g, "([^/]+)")
          const regex = new RegExp(`^${pattern}$`) // Pastikan cocok penuh
          return regex.test(pathname)
        }) || pathname

      config = breadcrumbConfig[matchedRoute]
    }

    if (!config) {
      // Fallback: buat otomatis dari pathname
      const segments = pathname.split("/").filter(Boolean)
      const autoItems: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        ...segments.map((segment, index) => ({
          label:
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          href:
            index === segments.length - 1
              ? undefined
              : "/" + segments.slice(0, index + 1).join("/"),
        })),
      ]
      setItems(autoItems)
      return
    }

    // Proses item breadcrumb
    const items = config.items.map((item) => {
      if (item.dynamic && config.dynamic && dynamicData) {
        // Ambil key dinamis pertama (e.g., 'slug' atau 'username')
        const dynamicKey = Object.keys(config.dynamic)[0]
        const dynamicFn = config.dynamic[dynamicKey]
        // Kirim seluruh objek data (project, user) ke fungsi dinamis
        return dynamicFn(dynamicData)
      }
      return item
    }).filter(Boolean) as BreadcrumbItem[]; // Filter null/undefined

    setItems(items)
  }, [pathname, dynamicData, setItems])
}