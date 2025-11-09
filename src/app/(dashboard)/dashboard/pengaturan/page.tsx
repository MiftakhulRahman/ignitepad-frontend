'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { profileApi } from '@/lib/api/profile';
import { authApi } from '@/lib/api/auth';
import apiClient from '@/lib/api/client';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function PengaturanPage() {
  const { user, isHydrated, setAuth } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  useBreadcrumb();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    github_url: user?.github_url || '',
    linkedin_url: user?.linkedin_url || '',
    website_url: user?.website_url || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: user?.email_notifications || true,
    push_notifications: user?.push_notifications || true,
  });

  // Fetch full profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
    enabled: isHydrated,
  });

  useEffect(() => {
    if (profile?.data) {
      setProfileData({
        name: profile.data.name || '',
        username: profile.data.username || '',
        bio: profile.data.bio || '',
        github_url: profile.data.github_url || '',
        linkedin_url: profile.data.linkedin_url || '',
        website_url: profile.data.website_url || '',
      });
      
      setNotificationSettings({
        email_notifications: profile.data.email_notifications || true,
        push_notifications: profile.data.push_notifications || true,
      });
    }
  }, [profile]);

  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: (data: any) => profileApi.update(data),
    onSuccess: (response) => {
      toast.success('Profil berhasil diperbarui');
      setAuth(response.data, undefined); // Update user in auth context
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.'
      );
    },
  });

  // Password update mutation - We'll need to add this to the auth API
  // For now we'll use a generic mutation that posts to a password update endpoint
  const passwordUpdateMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password berhasil diperbarui');
      // Clear password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    },
    onError: (error: any) => {
      console.error('Error updating password:', error);
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui password. Silakan coba lagi.'
      );
    },
  });

  // Notification settings mutation
  const notificationUpdateMutation = useMutation({
    mutationFn: (data: any) => profileApi.updateSettings(data),
    onSuccess: (response) => {
      toast.success('Pengaturan notifikasi berhasil diperbarui');
      setAuth(response.data, undefined); // Update user in auth context
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      console.error('Error updating notification settings:', error);
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui pengaturan notifikasi.'
      );
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.name.trim()) {
      toast.error('Nama harus diisi');
      return;
    }
    
    profileUpdateMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.current_password) {
      toast.error('Password saat ini harus diisi');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    
    passwordUpdateMutation.mutate(passwordData);
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    const newSettings = { ...notificationSettings, [setting]: value };
    setNotificationSettings(newSettings);
    
    // Update API immediately
    notificationUpdateMutation.mutate({ [setting]: value });
  };

  if (!isHydrated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-3xl font-bold">Pengaturan Akun</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi akun dan preferensi Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Perbarui informasi profil Anda
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nama Lengkap *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap Anda"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username *
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username Anda"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tulis bio singkat tentang Anda"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="github_url" className="text-sm font-medium">
                  GitHub
                </label>
                <Input
                  id="github_url"
                  type="url"
                  placeholder="https://github.com/username"
                  value={profileData.github_url}
                  onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="linkedin_url" className="text-sm font-medium">
                  LinkedIn
                </label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={profileData.linkedin_url}
                  onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="website_url" className="text-sm font-medium">
                  Website
                </label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://example.com"
                  value={profileData.website_url}
                  onChange={(e) => setProfileData({ ...profileData, website_url: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={profileUpdateMutation.isPending}
                className="w-full"
              >
                {profileUpdateMutation.isPending ? 'Memperbarui...' : 'Perbarui Profil'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Ganti password akun Anda
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="current_password" className="text-sm font-medium">
                  Password Saat Ini
                </label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="Password Anda saat ini"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new_password" className="text-sm font-medium">
                  Password Baru
                </label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="Password baru Anda"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new_password_confirmation" className="text-sm font-medium">
                  Konfirmasi Password Baru
                </label>
                <Input
                  id="new_password_confirmation"
                  type="password"
                  placeholder="Konfirmasi password baru Anda"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={passwordUpdateMutation.isPending}
                className="w-full"
              >
                {passwordUpdateMutation.isPending ? 'Memperbarui...' : 'Ganti Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifikasi</CardTitle>
            <CardDescription>
              Kelola pengaturan notifikasi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifikasi Email</p>
                <p className="text-xs text-muted-foreground">
                  Terima notifikasi penting melalui email
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('email_notifications', !notificationSettings.email_notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationSettings.email_notifications ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifikasi Push</p>
                <p className="text-xs text-muted-foreground">
                  Terima notifikasi langsung di perangkat Anda
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('push_notifications', !notificationSettings.push_notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationSettings.push_notifications ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.push_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}