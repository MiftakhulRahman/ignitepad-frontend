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
  ChevronRight
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  FolderOpen,
  Bookmark,
  Trophy,
  Users,
  Settings,
};

interface DashboardSidebarProps {
  isCollapsed: boolean;
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  // Get user role (default to mahasiswa)
  const userRole = user?.roles?.[0]?.name || 'mahasiswa';
  const navigation = NAVIGATION_CONFIG[userRole as keyof typeof NAVIGATION_CONFIG] || NAVIGATION_CONFIG.mahasiswa;

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r transition-all duration-300 z-30',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="h-full overflow-y-auto p-4">
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
