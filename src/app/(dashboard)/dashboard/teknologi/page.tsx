'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { adminApi } from '@/lib/api/admin';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeknologiPage() {
  const { user, isHydrated } = useRequireAuth();
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
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    color: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch technologies
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-technologies', page],
    queryFn: () => adminApi.getTechnologies(page),
    enabled: isHydrated && user?.role === 'admin',
  });

  // Create technology mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createTechnology(data),
    onSuccess: () => {
      toast.success('Teknologi berhasil dibuat');
      setFormData({ name: '', slug: '', icon: '', color: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-technologies'] });
    },
    onError: (error: any) => {
      console.error('Error creating technology:', error);
      toast.error(
        error.response?.data?.message || 'Gagal membuat teknologi. Silakan coba lagi.'
      );
    },
  });

  // Update technology mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateTechnology(id, data),
    onSuccess: () => {
      toast.success('Teknologi berhasil diperbarui');
      setFormData({ name: '', slug: '', icon: '', color: '' });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-technologies'] });
    },
    onError: (error: any) => {
      console.error('Error updating technology:', error);
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui teknologi. Silakan coba lagi.'
      );
    },
  });

  // Delete technology mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTechnology(id),
    onSuccess: () => {
      toast.success('Teknologi berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-technologies'] });
    },
    onError: () => {
      toast.error('Gagal menghapus teknologi');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing technology
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      // Create new technology
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (technology: any) => {
    setFormData({
      name: technology.name,
      slug: technology.slug,
      icon: technology.icon || '',
      color: technology.color || '',
    });
    setEditingId(technology.id);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus teknologi "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', slug: '', icon: '', color: '' });
    setEditingId(null);
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
          <p className="text-muted-foreground">Terjadi kesalahan saat memuat data teknologi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-3xl font-bold">Manajemen Teknologi</h1>
        <p className="text-muted-foreground mt-1">
          Kelola teknologi untuk digunakan dalam proyek
        </p>
      </div>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Teknologi' : 'Buat Teknologi Baru'}</CardTitle>
          <CardDescription>
            {editingId 
              ? 'Edit informasi teknologi' 
              : 'Buat teknologi baru untuk digunakan dalam proyek'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nama Teknologi *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: Laravel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium">
                  Slug *
                </label>
                <Input
                  id="slug"
                  type="text"
                  placeholder="Contoh: laravel"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="icon" className="text-sm font-medium">
                  Icon (opsional)
                </label>
                <Input
                  id="icon"
                  type="text"
                  placeholder="Contoh: code, laptop, etc."
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="color" className="text-sm font-medium">
                  Warna (opsional)
                </label>
                <Input
                  id="color"
                  type="text"
                  placeholder="Contoh: #FF2B2B, red, etc."
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Warna untuk menampilkan teknologi (gunakan format hex atau nama warna)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {editingId && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelEdit}
              >
                Batal
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId 
                ? (updateMutation.isPending ? 'Memperbarui...' : 'Perbarui Teknologi') 
                : (createMutation.isPending ? 'Membuat...' : 'Buat Teknologi')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Technologies List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
                  <div>
                    <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded mt-1 animate-pulse" />
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
            <h3 className="text-lg font-semibold mb-2">Tidak ada teknologi</h3>
            <p className="text-muted-foreground">Belum ada teknologi dibuat</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.data?.map((technology: any) => (
            <Card key={technology.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {technology.icon ? (
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: technology.color || '#6b7280' }}
                    >
                      {technology.icon}
                    </div>
                  ) : (
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: technology.color || '#6b7280' }}
                    >
                      <span className="text-xs">{technology.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{technology.name}</h3>
                    <p className="text-sm text-muted-foreground">{technology.slug}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(technology)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(technology.id, technology.name)}
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