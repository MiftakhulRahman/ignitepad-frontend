'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { cn } from '@/lib/utils/cn';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <DashboardSidebar isCollapsed={isSidebarCollapsed} />
      
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        <div className="container mx-auto p-6">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
