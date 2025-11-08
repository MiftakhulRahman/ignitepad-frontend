# Panduan Melanjutkan Development - Bahasa Indonesia & Sidebar Dashboard

## ✅ Yang Sudah Dibuat

### 1. Dashboard Layout Components
- `components/layout/dashboard-header.tsx` - Header dengan hamburger, logo, dark mode, dan profile dropdown
- `components/layout/dashboard-sidebar.tsx` - Sidebar dengan navigation role-based
- `lib/constants/navigation.ts` - Konfigurasi navigasi untuk mahasiswa, dosen, dan admin

### 2. Layout Updated
- `app/(dashboard)/layout.tsx` - Sudah menggunakan DashboardHeader + DashboardSidebar

### 3. Features
- ✅ Sidebar yang bisa collapse (icon only mode)
- ✅ Role-based navigation (mahasiswa, dosen, admin)
- ✅ Dark mode toggle di header
- ✅ Profile dropdown dengan menu
- ✅ Breadcrumb integrated
- ✅ Icons untuk semua menu

---

## 🔄 Yang Perlu Diselesaikan

### 1. Rename/Create Pages Sesuai URL Bahasa Indonesia

#### Untuk Mahasiswa & Umum:
```bash
# Rename atau create folder/file:
dashboard/my-projects → dashboard/proyek-saya
dashboard/my-projects/create → dashboard/proyek-saya/buat
dashboard/my-projects/edit/[slug] → dashboard/proyek-saya/edit/[slug]
dashboard/saved → dashboard/tersimpan
dashboard/challenges → dashboard/challenge-saya
dashboard/settings → dashboard/pengaturan
```

#### Untuk Dosen (tambahan):
```
dashboard/bimbingan → halaman bimbingan proyek mahasiswa
dashboard/challenge → manage challenge
```

#### Untuk Admin (tambahan):
```
dashboard/pengguna → manage users
dashboard/proyek → manage all projects
dashboard/challenge → manage challenges
```

### 2. Ubah Semua Teks ke Bahasa Indonesia

Ganti di file-file berikut:

#### Dashboard Page (`dashboard/page.tsx`):
```typescript
// Ganti
"Welcome back!" → "Selamat Datang Kembali!"
"Here's an overview" → "Berikut ringkasan aktivitas Anda"
"Total Projects" → "Total Proyek"
"Total Views" → "Total Views" (ini OK, umum dipakai)
"Total Likes" → "Total Like"
"Total Comments" → "Total Komentar"
"Saved Projects" → "Proyek Tersimpan"
"Challenges Joined" → "Challenge Diikuti"
"Quick Links" → "Tautan Cepat"
"My Projects" → "Proyek Saya"
"Manage and edit..." → "Kelola dan edit proyek..."
"View All Projects" → "Lihat Semua Proyek"
"My Challenges" → "Challenge Saya"
"Track your challenge..." → "Lacak partisipasi challenge Anda..."
"View My Challenges" → "Lihat Challenge Saya"
```

#### My Projects Page (`dashboard/my-projects/page.tsx`):
```typescript
// Rename file ke: dashboard/proyek-saya/page.tsx

"My Projects" → "Proyek Saya"
"Create New Project" → "Buat Proyek Baru"
"No projects found" → "Belum ada proyek"
"Create your first project" → "Buat proyek pertama Anda"
"Edit" → "Edit"
"Delete" → "Hapus"
"views" → "dilihat"
"likes" → "suka"
"comments" → "komentar"
```

#### Login & Register Pages:
```typescript
// Login (app/(auth)/login/page.tsx):
"Login to Ignitepad" → "Masuk ke Ignitepad"
"Enter your email and password" → "Masukkan email dan password Anda"
"Email" → "Email"
"Password" → "Password"
"Login" → "Masuk"
"Don't have an account?" → "Belum punya akun?"
"Sign up" → "Daftar"
"Login failed" → "Login gagal"

// Register (app/(auth)/register/page.tsx):
"Create your account" → "Buat Akun Anda"
"I am a" → "Saya seorang"
"Student" → "Mahasiswa"
"Lecturer" → "Dosen"
"Name" → "Nama"
"NIM" → "NIM"
"NIDN" → "NIDN"
"Username" → "Username"
"Register" → "Daftar"
"Already have an account?" → "Sudah punya akun?"
"Login" → "Masuk"
```

#### Navbar (Public):
```typescript
// components/layout/navbar.tsx:
"Home" → "Beranda"
"Projects" → "Proyek"
"Challenges" → "Challenge"
"Dashboard" → "Dashboard"
"Login" → "Masuk"
"Get Started" → "Mulai"
```

#### Footer:
```typescript
"About" → "Tentang"
"Features" → "Fitur"
"Contact" → "Kontak"
"Privacy Policy" → "Kebijakan Privasi"
"Terms of Service" → "Syarat Layanan"
```

### 3. Update Breadcrumb Config

File: `lib/constants/breadcrumb-config.ts`

```typescript
export const breadcrumbConfig: BreadcrumbConfig = {
  '/': {
    items: [{ label: 'Beranda', href: '/' }],
  },
  '/projects': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Proyek' },
    ],
  },
  '/projects/[slug]': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Proyek', href: '/projects' },
      { label: '', dynamic: true },
    ],
    dynamic: {
      slug: (project) => ({ label: project.title }),
    },
  },
  '/challenges': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Challenge' },
    ],
  },
  '/dashboard': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Dashboard' },
    ],
  },
  '/dashboard/proyek-saya': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Proyek Saya' },
    ],
  },
  '/dashboard/proyek-saya/buat': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Proyek Saya', href: '/dashboard/proyek-saya' },
      { label: 'Buat Baru' },
    ],
  },
  '/dashboard/tersimpan': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Proyek Tersimpan' },
    ],
  },
  '/dashboard/challenge-saya': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Challenge Saya' },
    ],
  },
  '/dashboard/pengaturan': {
    items: [
      { label: 'Beranda', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pengaturan' },
    ],
  },
};
```

### 4. Testing Checklist

- [ ] Refresh browser untuk load components baru
- [ ] Test login dengan mahasiswa/dosen/admin
- [ ] Test sidebar collapse/expand dengan hamburger
- [ ] Test dark mode toggle
- [ ] Test profile dropdown
- [ ] Test navigasi role-based (mahasiswa lihat menu mahasiswa, etc)
- [ ] Test breadcrumb di setiap halaman
- [ ] Verify semua teks sudah Bahasa Indonesia
- [ ] Test responsive di mobile

---

## 🎨 Styling Notes

### Colors & Theme:
- Primary color: Blue/indigo (default)
- Background: White (light) / Dark gray (dark)
- Card: Slightly elevated
- Sidebar: Fixed position, dengan transition smooth

### Icons:
Semua icon dari `lucide-react`:
- LayoutDashboard
- FolderOpen
- Bookmark
- Trophy
- Users
- Settings
- Menu (hamburger)
- Sun/Moon (theme toggle)
- User, LogOut, ChevronDown (dropdown)

---

## 🚀 Next Steps (Priority Order)

1. **High Priority - Update Page Texts:**
   - Update `dashboard/page.tsx` ke Bahasa Indonesia
   - Update `dashboard/my-projects/page.tsx` ke Bahasa Indonesia
   - Update login & register pages ke Bahasa Indonesia

2. **High Priority - Rename URLs:**
   - Create/rename `dashboard/proyek-saya` folder
   - Create `dashboard/tersimpan` folder
   - Create `dashboard/challenge-saya` folder
   - Create `dashboard/pengaturan` folder

3. **Medium Priority - Create Missing Pages:**
   - `dashboard/proyek-saya/buat/page.tsx` - Form buat proyek
   - `dashboard/proyek-saya/edit/[slug]/page.tsx` - Form edit proyek
   - `dashboard/tersimpan/page.tsx` - List saved projects
   - `dashboard/challenge-saya/page.tsx` - List joined challenges
   - `dashboard/pengaturan/page.tsx` - Settings page

4. **Medium Priority - Dosen Pages:**
   - `dashboard/bimbingan/page.tsx` - List mahasiswa yang dibimbing
   - `dashboard/challenge/page.tsx` - Manage challenges (CRUD)

5. **Low Priority - Admin Pages:**
   - `dashboard/pengguna/page.tsx` - User management
   - `dashboard/proyek/page.tsx` - All projects management

---

## 💡 Tips Development

1. **Copy existing pages** sebagai template
2. **Update imports** jika rename folder
3. **Test incrementally** - satu page at a time
4. **Use breadcrumb hook** di setiap page: `useBreadcrumb()`
5. **Use auth hook** di protected pages: `useRequireAuth()`

---

Last updated: November 9, 2025
