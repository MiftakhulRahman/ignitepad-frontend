'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Heart, Eye, MessageSquare, Bookmark, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { isHydrated } = useRequireAuth();
  useBreadcrumb();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    enabled: isHydrated, // Only fetch when auth is hydrated
  });

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) {
    return null;
  }

  const statsData = stats?.data;

  return (
    <div>
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your activity.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/my-projects/create">
          <Button className="w-full h-20 text-lg">+ Create New Project</Button>
        </Link>
        <Link href="/dashboard/my-projects">
          <Button variant="outline" className="w-full h-20 text-lg">
            My Projects
          </Button>
        </Link>
        <Link href="/challenges">
          <Button variant="outline" className="w-full h-20 text-lg">
            Browse Challenges
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData?.projects_count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsData?.published_projects_count || 0} published
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
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData?.total_likes || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                From the community
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Comments
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData?.total_comments || 0}
              </div>
              <p className="text-xs text-muted-foreground">Received feedback</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Projects
              </CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData?.saved_projects_count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <Link
                  href="/dashboard/saved"
                  className="hover:text-foreground hover:underline"
                >
                  View saved
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Challenges Joined
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData?.challenges_joined || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsData?.challenges_submitted || 0} submitted
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage and edit your existing projects
              </p>
              <Link href="/dashboard/my-projects">
                <Button variant="outline">View All Projects</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track your challenge participation and submissions
              </p>
              <Link href="/dashboard/challenges">
                <Button variant="outline">View My Challenges</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
