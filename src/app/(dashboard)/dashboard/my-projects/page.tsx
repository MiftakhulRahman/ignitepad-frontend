'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Eye, Heart, MessageSquare, Edit, Trash2 } from 'lucide-react';

export default function MyProjectsPage() {
  const { isHydrated } = useRequireAuth();
  useBreadcrumb();

  const { data, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => dashboardApi.getMyProjects(),
    enabled: isHydrated,
  });

  if (!isHydrated) {
    return null;
  }

  return (
    <div>
      <Breadcrumb />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and edit your projects
          </p>
        </div>
        <Link href="/dashboard/my-projects/create">
          <Button>+ Create New Project</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted" />
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((project) => (
            <Card key={project.id} className="flex flex-col">
              {project.thumbnail && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 flex-1">
                    {project.title}
                  </CardTitle>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      project.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : project.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{project.category}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <div className="flex justify-between text-sm text-muted-foreground w-full">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {project.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {project.like_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {project.comment_count}
                  </span>
                </div>
                <div className="flex gap-2 w-full">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/my-projects/edit/${project.slug}`}
                    className="flex-1"
                  >
                    <Button className="w-full" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven't created any projects yet.
          </p>
          <Link href="/dashboard/my-projects/create">
            <Button>Create Your First Project</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
