'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { dashboardApi } from '@/lib/api/dashboard';
import { challengeApi } from '@/lib/api/challenges';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Users, Calendar, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChallengePage() {
  const { user, isHydrated } = useRequireAuth();
  const router = useRouter();
  useBreadcrumb();

  // Fetch challenges based on user role
  const { data: myChallenges, isLoading: myChallengesLoading } = useQuery({
    queryKey: ['my-challenges'],
    queryFn: () => dashboardApi.getMyChallenges(),
    enabled: isHydrated,
  });

  // For dosen/admin, we might want to fetch all challenges they created
  const { data: createdChallenges, isLoading: createdChallengesLoading } = useQuery({
    queryKey: ['created-challenges'],
    queryFn: () => {
      // This would be an endpoint that gets challenges created by the user
      // For now using the same endpoint, but this might need to be updated based on the API design
      return dashboardApi.getMyChallenges();
    },
    enabled: isHydrated && (user?.role === 'dosen' || user?.role === 'admin'),
  });

  if (!isHydrated) {
    return null;
  }

  const isDosen = user?.role === 'dosen';
  const isAdmin = user?.role === 'admin';

  // Different content based on role
  if (isDosen || isAdmin) {
    // Dosen/Admin view - challenges they created/managed
    return (
      <div className="space-y-6">
        <Breadcrumb />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Challenge Saya</h1>
            <p className="text-muted-foreground mt-1">
              Kelola dan pantau challenge yang telah Anda buat
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/challenge/buat')}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Challenge Baru
          </Button>
        </div>

        {createdChallengesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : createdChallenges?.data?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Belum ada challenge yang dibuat
              </p>
              <Button onClick={() => router.push('/dashboard/challenge/buat')}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Challenge Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdChallenges?.data?.map((challenge: any) => (
              <Card key={challenge.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {challenge.banner && (
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={challenge.banner}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-2">{challenge.title}</h3>
                    <Badge variant={
                      challenge.status === 'open' ? 'default' :
                      challenge.status === 'closed' ? 'secondary' :
                      challenge.status === 'completed' ? 'outline' : 'destructive'
                    }>
                      {challenge.status === 'open' ? 'Dibuka' :
                       challenge.status === 'closed' ? 'Ditutup' :
                       challenge.status === 'completed' ? 'Selesai' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {challenge.description || 'Tidak ada deskripsi'}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participant_count || 0} peserta</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>{challenge.submission_count || 0} kiriman</span>
                    </div>
                  </div>
                  
                  {challenge.deadline && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/challenge/${challenge.slug}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    // Mahasiswa view - challenges they can join
    return (
      <div className="space-y-6">
        <Breadcrumb />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ikuti Challenge</h1>
            <p className="text-muted-foreground mt-1">
              Tantang diri Anda dengan berbagai proyek menarik
            </p>
          </div>
        </div>

        {myChallengesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : myChallenges?.data?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tidak ada challenge yang tersedia saat ini
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myChallenges?.data?.map((challenge: any) => (
              <Card key={challenge.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {challenge.banner && (
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={challenge.banner}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-2">{challenge.title}</h3>
                    <Badge variant={
                      challenge.status === 'open' ? 'default' :
                      challenge.status === 'closed' ? 'secondary' :
                      challenge.status === 'completed' ? 'outline' : 'destructive'
                    }>
                      {challenge.status === 'open' ? 'Dibuka' :
                       challenge.status === 'closed' ? 'Ditutup' :
                       challenge.status === 'completed' ? 'Selesai' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {challenge.description || 'Tidak ada deskripsi'}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participant_count || 0} peserta</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>{challenge.submission_count || 0} kiriman</span>
                    </div>
                  </div>
                  
                  {challenge.deadline && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  {challenge.status === 'open' && !challenge.user_submission && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        // Join challenge
                        challengeApi.join(challenge.slug)
                          .then(() => {
                            toast.success('Berhasil bergabung challenge');
                            router.refresh();
                          })
                          .catch(() => {
                            toast.error('Gagal bergabung challenge');
                          });
                      }}
                    >
                      Ikuti Challenge
                    </Button>
                  )}
                  
                  {challenge.user_submission && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/challenge/${challenge.slug}`)}
                    >
                      Lihat Submission
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/challenge/${challenge.slug}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
}