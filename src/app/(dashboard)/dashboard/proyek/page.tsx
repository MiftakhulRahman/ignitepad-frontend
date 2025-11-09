'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { adminApi } from '@/lib/api/admin';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Star, StarOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProyekPage() {
  const { user, isHydrated } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  useBreadcrumb();

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Akses Ditolak</h2>
          <p className="text-muted-foreground">Halaman ini hanya dapat diakses oleh admin</p>
        </div>
      </div>
    );
  }

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Fetch projects
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-projects', page, search],
    queryFn: () => adminApi.getProjects(page, search),
    enabled: isHydrated && user?.role === 'admin',
  });

  // Feature project mutation
  const featureMutation = useMutation({
    mutationFn: (slug: string) => adminApi.featureProject(slug),
    onSuccess: () => {
      toast.success('Proyek berhasil diunggulkan');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Gagal mengunggulkan proyek');
    },
  });

  // Unfeature project mutation
  const unfeatureMutation = useMutation({
    mutationFn: (slug: string) => adminApi.unfeatureProject(slug),
    onSuccess: () => {
      toast.success('Proyek berhasil dihapus dari unggulan');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Gagal menghapus proyek dari unggulan');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (slug: string) => adminApi.deleteProject(slug),
    onSuccess: () => {
      toast.success('Proyek berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Gagal menghapus proyek');
    },
  });

  const handleFeature = (slug: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin mengunggulkan proyek "${title}"?`)) {
      featureMutation.mutate(slug);
    }
  };

  const handleUnfeature = (slug: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${title}" dari unggulan?`)) {
      unfeatureMutation.mutate(slug);
    }
  };

  const handleDelete = (slug: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${title}"?`)) {
      deleteMutation.mutate(slug);
    }
  };

  if (!isHydrated) {
    return null;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Gagal Memuat Data</h2>
          <p className="text-muted-foreground">Terjadi kesalahan saat memuat data proyek</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-3xl font-bold">Manajemen Proyek</h1>
        <p className="text-muted-foreground mt-1">
          Kelola proyek di platform
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Proyek</CardTitle>
          <CardDescription>
            Cari proyek berdasarkan judul atau deskripsi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="project-search" className="text-sm font-medium">
                Cari Proyek
              </label>
              <div className="relative">
                <Input
                  id="project-search"
                  type="text"
                  placeholder="Cari berdasarkan judul atau deskripsi..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // Reset to first page when searching
                  }}
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Aksi</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-md w-16 h-16" />
                  <div>
                    <div className="h-5 w-60 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-40 bg-muted rounded mt-1 animate-pulse" />
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="animate-pulse">Draft</Badge>
                      <Badge variant="outline" className="animate-pulse">Publik</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-9 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Tidak ada proyek ditemukan</h3>
            <p className="text-muted-foreground">
              {search ? 'Coba gunakan kata kunci yang berbeda' : 'Belum ada proyek terdaftar'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.data?.map((project: any) => (
            <Card key={project.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.title} 
                      className="w-16 h-16 rounded-md object-cover bg-muted"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                      {project.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={
                        project.status === 'published' ? 'default' :
                        project.status === 'draft' ? 'secondary' : 'outline'
                      }>
                        {project.status === 'published' ? 'Dipublikasi' :
                         project.status === 'draft' ? 'Draft' : 'Diarsipkan'}
                      </Badge>
                      <Badge variant={
                        project.visibility === 'public' ? 'default' :
                        project.visibility === 'unlisted' ? 'secondary' : 'outline'
                      }>
                        {project.visibility === 'public' ? 'Publik' :
                         project.visibility === 'unlisted' ? 'Tidak Terdaftar' : 'Pribadi'}
                      </Badge>
                      {project.is_featured && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Unggulan
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/projects/${project.slug}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                  
                  {project.is_featured ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnfeature(project.slug, project.title)}
                      disabled={unfeatureMutation.isPending}
                    >
                      <StarOff className="h-4 w-4 mr-1" />
                      Hapus Unggulan
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleFeature(project.slug, project.title)}
                      disabled={featureMutation.isPending}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Jadikan Unggulan
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(project.slug, project.title)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Pagination */}
          {data?.meta && data.meta.last_page > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                Sebelumnya
              </Button>
              
              <span className="px-3 py-1 text-sm">
                {page} dari {data.meta.last_page}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, data.meta.last_page))}
                disabled={page === data.meta.last_page || isLoading}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}