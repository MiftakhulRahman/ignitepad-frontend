'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { dashboardApi } from '@/lib/api/dashboard';
import { projectApi } from '@/lib/api/projects';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageSquare, Bookmark, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TersimpanPage() {
  const { isHydrated } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  useBreadcrumb();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-projects'],
    queryFn: () => dashboardApi.getSavedProjects(),
    enabled: isHydrated,
  });

  const unsaveMutation = useMutation({
    mutationFn: (slug: string) => projectApi.unsave(slug),
    onSuccess: () => {
      toast.success('Proyek berhasil dihapus dari tersimpan');
      queryClient.invalidateQueries({ queryKey: ['saved-projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] }); // Also invalidate my projects to update the save status
    },
    onError: () => {
      toast.error('Gagal menghapus proyek dari tersimpan');
    },
  });

  if (!isHydrated) {
    return null;
  }

  const handleUnsave = async (slug: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${title}" dari tersimpan?`)) {
      unsaveMutation.mutate(slug);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proyek Tersimpan</h1>
          <p className="text-muted-foreground mt-1">
            Proyek-proyek yang telah Anda simpan untuk referensi
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex justify-center mb-4">
              <Bookmark className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum ada proyek tersimpan</h3>
            <p className="text-muted-foreground mb-4">
              Proyek yang Anda simpan akan muncul di sini
            </p>
            <Button asChild>
              <Link href="/dashboard/proyek-saya">
                Jelajahi Proyek
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((project: any) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {project.thumbnail && (
                <div className="h-48 overflow-hidden bg-muted">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-2">{project.title}</h3>
                  <Badge variant={
                    project.status === 'published' ? 'default' :
                    project.status === 'draft' ? 'secondary' : 'outline'
                  }>
                    {project.status === 'published' ? 'Dipublikasi' :
                     project.status === 'draft' ? 'Draft' : 'Diarsipkan'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || 'Tidak ada deskripsi'}
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.view_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{project.like_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{project.comment_count || 0}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <Link href={`/projects/${project.slug}`}>
                    Lihat
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleUnsave(project.slug, project.title)}
                  disabled={unsaveMutation.isPending}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}