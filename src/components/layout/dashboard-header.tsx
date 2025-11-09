'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  Menu,
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  isCollapsed: boolean;
}

export function DashboardHeader({ onToggleSidebar, isCollapsed }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 border-b z-50 transition-all duration-300',
        isCollapsed ? 'left-16' : 'left-64'
      )}
      style={{
        backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff',
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Hamburger */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right: Dark Mode + Profile */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Profile Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'mahasiswa' ? 'Mahasiswa' :
                   user?.role === 'dosen' ? 'Dosen' : 'Admin'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block" />
            </Button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />

                {/* Menu */}
                <div
                  className="absolute right-0 mt-2 w-56 border rounded-lg shadow-lg z-50"
                  style={{
                    backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff',
                  }}
                >
                  <div className="p-3 border-b">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>

                  {user?.role !== 'admin' && (
                    <div className="p-2">
                      <Link
                        href={`/profile/@${user?.username}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm">Profil Saya</span>
                      </Link>

                      <Link
                        href="/dashboard/pengaturan"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span className="text-sm">Pengaturan</span>
                      </Link>
                    </div>
                  )}

                  {user?.role === 'admin' && (
                    <div className="p-2">
                      <Link
                        href="/dashboard/pengaturan"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span className="text-sm">Pengaturan</span>
                      </Link>
                    </div>
                  )}

                  <div className="p-2 border-t">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Keluar</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}