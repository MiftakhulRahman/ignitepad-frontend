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
import { Search, User, UserCheck, UserX, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PenggunaPage() {
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
  const [roleFilter, setRoleFilter] = useState('');

  // Fetch users
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => adminApi.getUsers(page, roleFilter, search),
    enabled: isHydrated && user?.role === 'admin',
  });

  // Activation mutation
  const activateMutation = useMutation({
    mutationFn: (userId: number) => adminApi.activateUser(userId),
    onSuccess: () => {
      toast.success('Pengguna berhasil diaktifkan');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Gagal mengaktifkan pengguna');
    },
  });

  // Deactivation mutation
  const deactivateMutation = useMutation({
    mutationFn: (userId: number) => adminApi.deactivateUser(userId),
    onSuccess: () => {
      toast.success('Pengguna berhasil dinonaktifkan');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Gagal menonaktifkan pengguna');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('Pengguna berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Gagal menghapus pengguna');
    },
  });

  const handleActivate = (userId: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin mengaktifkan pengguna "${name}"?`)) {
      activateMutation.mutate(userId);
    }
  };

  const handleDeactivate = (userId: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan pengguna "${name}"?`)) {
      deactivateMutation.mutate(userId);
    }
  };

  const handleDelete = (userId: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) {
      deleteMutation.mutate(userId);
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
          <p className="text-muted-foreground">Terjadi kesalahan saat memuat data pengguna</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground mt-1">
          Kelola akun pengguna di platform
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Pengguna</CardTitle>
          <CardDescription>
            Cari dan filter pengguna berdasarkan nama, peran, atau status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Cari Pengguna
              </label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
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
              <label htmlFor="role" className="text-sm font-medium">
                Filter Peran
              </label>
              <select
                id="role"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1); // Reset to first page when filtering
                }}
              >
                <option value="">Semua Peran</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Aksi</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('');
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

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
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
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada pengguna ditemukan</h3>
            <p className="text-muted-foreground">
              {search || roleFilter ? 'Coba gunakan kata kunci atau filter yang berbeda' : 'Belum ada pengguna terdaftar'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.data?.map((user: any) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{user.email}</span>
                      {user.username && <span>• @{user.username}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'dosen' ? 'secondary' : 'default'}>
                        {user.role === 'mahasiswa' ? 'Mahasiswa' : user.role === 'dosen' ? 'Dosen' : 'Admin'}
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'outline'}>
                        {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {user.is_active ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeactivate(user.id, user.name)}
                      disabled={deactivateMutation.isPending}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Nonaktifkan
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleActivate(user.id, user.name)}
                      disabled={activateMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Aktifkan
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(user.id, user.name)}
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