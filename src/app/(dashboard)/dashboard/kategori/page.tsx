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

export default function KategoriPage() {
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
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch categories
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-categories', page],
    queryFn: () => adminApi.getCategories(page),
    enabled: isHydrated && user?.role === 'admin',
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCategory(data),
    onSuccess: () => {
      toast.success('Kategori berhasil dibuat');
      setFormData({ name: '', slug: '', icon: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      toast.error(
        error.response?.data?.message || 'Gagal membuat kategori. Silakan coba lagi.'
      );
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Kategori berhasil diperbarui');
      setFormData({ name: '', slug: '', icon: '' });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (error: any) => {
      console.error('Error updating category:', error);
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui kategori. Silakan coba lagi.'
      );
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Kategori berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => {
      toast.error('Gagal menghapus kategori');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing category
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      // Create new category
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
    });
    setEditingId(category.id);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', slug: '', icon: '' });
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
          <p className="text-muted-foreground">Terjadi kesalahan saat memuat data kategori</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-3xl font-bold">Manajemen Kategori</h1>
        <p className="text-muted-foreground mt-1">
          Kelola kategori untuk proyek
        </p>
      </div>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Kategori' : 'Buat Kategori Baru'}</CardTitle>
          <CardDescription>
            {editingId 
              ? 'Edit informasi kategori' 
              : 'Buat kategori baru untuk mengorganisir proyek'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nama Kategori *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: Web Development"
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
                  placeholder="Contoh: web"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="icon" className="text-sm font-medium">
                Icon (opsional)
              </label>
              <Input
                id="icon"
                type="text"
                placeholder="Contoh: laptop, code, etc."
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Gunakan nama icon dari library yang tersedia di platform
              </p>
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
                ? (updateMutation.isPending ? 'Memperbarui...' : 'Perbarui Kategori') 
                : (createMutation.isPending ? 'Membuat...' : 'Buat Kategori')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Categories List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-6 bg-muted rounded-full animate-pulse" />
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
            <h3 className="text-lg font-semibold mb-2">Tidak ada kategori</h3>
            <p className="text-muted-foreground">Belum ada kategori dibuat</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.data?.map((category: any) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {category.icon ? (
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
                      {category.icon}
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">#</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(category.id, category.name)}
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