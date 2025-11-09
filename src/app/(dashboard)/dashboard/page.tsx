'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { dashboardApi } from '@/lib/api/dashboard';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, Heart, Eye, MessageSquare, Bookmark, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { isHydrated } = useRequireAuth();
  useBreadcrumb();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    enabled: isHydrated,
  });

  if (!isHydrated) {
    return null;
  }

  const statsData = stats?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />
      
      <div>
        <h1 className="text-3xl font-bold">Selamat Datang Kembali!</h1>
        <p className="text-muted-foreground mt-1">
          Berikut ringkasan aktivitas Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyek</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.projects_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Proyek yang telah dibuat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.total_views || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Kali dilihat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Like</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.total_likes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari komunitas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komentar</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.total_comments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Masukan diterima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyek Tersimpan</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.saved_projects_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <Link
                href="/dashboard/tersimpan"
                className="hover:text-foreground hover:underline"
              >
                Lihat tersimpan
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenge Diikuti</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.challenges_joined || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsData?.challenges_submitted || 0} telah disubmit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Tautan Cepat</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Proyek Saya</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Kelola dan edit proyek yang sudah ada
              </p>
              <Link href="/dashboard/proyek-saya">
                <Button variant="outline">Lihat Semua Proyek</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ikuti challenge dan tampilkan kemampuan Anda
              </p>
              <Link href="/dashboard/challenge">
                <Button variant="outline">Lihat Challenge</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
