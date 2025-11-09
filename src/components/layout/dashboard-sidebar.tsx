'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { NAVIGATION_CONFIG } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils/cn';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Bookmark, 
  Trophy, 
  Users, 
  Settings,
  ChevronRight,
  Tag,
  Code
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  FolderOpen,
  Bookmark,
  Trophy,
  Users,
  Settings,
  Tag,
  Code,
};

interface DashboardSidebarProps {
  isCollapsed: boolean;
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  // Get user role (default to mahasiswa)
  const userRole = user?.role || 'mahasiswa';
  const navigation = NAVIGATION_CONFIG[userRole as keyof typeof NAVIGATION_CONFIG] || NAVIGATION_CONFIG.mahasiswa;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-card border-r transition-all duration-300 z-40',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">IP</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg">Ignitepad</span>
          )}
        </Link>
      </div>
      
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
        {navigation.map((section, idx) => (
          <div key={idx} className={cn('mb-6', idx > 0 && 'pt-6 border-t')}>
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.section}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isCollapsed && 'justify-center',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                      {!isCollapsed && <span>{item.label}</span>}
                      {!isCollapsed && isActive && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
