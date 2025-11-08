export const NAVIGATION_CONFIG = {
  mahasiswa: [
    {
      section: 'Menu Utama',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Proyek Saya', href: '/dashboard/proyek-saya', icon: 'FolderOpen' },
        { label: 'Proyek Tersimpan', href: '/dashboard/tersimpan', icon: 'Bookmark' },
        { label: 'Challenge Saya', href: '/dashboard/challenge-saya', icon: 'Trophy' },
      ],
    },
    {
      section: 'Lainnya',
      items: [
        { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: 'Settings' },
      ],
    },
  ],
  dosen: [
    {
      section: 'Menu Utama',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Proyek Saya', href: '/dashboard/proyek-saya', icon: 'FolderOpen' },
        { label: 'Bimbingan', href: '/dashboard/bimbingan', icon: 'Users' },
        { label: 'Challenge', href: '/dashboard/challenge', icon: 'Trophy' },
        { label: 'Proyek Tersimpan', href: '/dashboard/tersimpan', icon: 'Bookmark' },
      ],
    },
    {
      section: 'Lainnya',
      items: [
        { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: 'Settings' },
      ],
    },
  ],
  admin: [
    {
      section: 'Menu Utama',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Pengguna', href: '/dashboard/pengguna', icon: 'Users' },
        { label: 'Proyek', href: '/dashboard/proyek', icon: 'FolderOpen' },
        { label: 'Challenge', href: '/dashboard/challenge', icon: 'Trophy' },
      ],
    },
    {
      section: 'Lainnya',
      items: [
        { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: 'Settings' },
      ],
    },
  ],
};
