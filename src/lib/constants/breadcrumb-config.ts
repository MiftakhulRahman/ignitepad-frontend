// src/lib/config/breadcrumbs.ts

export interface BreadcrumbItem {
  label: string
  href?: string
  dynamic?: boolean
}

export interface BreadcrumbConfig {
  [key: string]: {
    items: BreadcrumbItem[]
    dynamic?: {
      [key: string]: (params: any) => BreadcrumbItem
    }
  }
}

export const breadcrumbConfig: BreadcrumbConfig = {
  // ==============================
  // 🏠 Home
  // ==============================
  "/": {
    items: [{ label: "Home", href: "/" }],
  },

  // ==============================
  // 💼 Projects
  // ==============================
  "/projects": {
    items: [{ label: "Home", href: "/" }, { label: "Projects" }],
  },
  "/projects/[slug]": {
    items: [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "", dynamic: true }, // Akan diisi judul proyek
    ],
    dynamic: {
      slug: (project: any) => ({ label: project.title }),
    },
  },

  // ==============================
  // 🧩 Challenges
  // ==============================
  "/challenges": {
    items: [{ label: "Home", href: "/" }, { label: "Challenges" }],
  },
  "/challenges/[slug]": {
    items: [
      { label: "Home", href: "/" },
      { label: "Challenges", href: "/challenges" },
      { label: "", dynamic: true },
    ],
    dynamic: {
      slug: (challenge: any) => ({ label: challenge.title }),
    },
  },

  // ==============================
  // 📊 Dashboard
  // ==============================
  "/dashboard": {
    items: [{ label: "Home", href: "/" }, { label: "Dashboard" }],
  },

  // ==============================
  // 👤 Profile
  // ==============================
  "/profile/[username]": { // <-- diganti dari [id]
    items: [
      { label: "Home", href: "/" },
      { label: "Profile", dynamic: true },
    ],
    dynamic: {
      username: (user: any) => ({ label: user.name }), // <-- diganti dari 'id'
    },
  },

  // ==============================
  // ⚙️ Admin (opsional)
  // ==============================
  // "/admin": {
  //   items: [{ label: "Home", href: "/" }, { label: "Admin" }],
  // },
}
