'use client';

import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/lib/api/projects';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Eye, Heart, MessageSquare, Search } from 'lucide-react';

export default function ProjectsPage() {
  useBreadcrumb();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectApi.getAll(filters),
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'web', label: 'Web' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'ai-ml', label: 'AI/ML' },
    { value: 'iot', label: 'IoT' },
    { value: 'game', label: 'Game' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Projects</h1>
        <p className="text-muted-foreground">
          Discover amazing academic projects from the community
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md bg-background"
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value, page: 1 })
          }
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
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
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
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
                    <CardTitle className="line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize">{project.category}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
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
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {data.meta.current_page} of {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                disabled={filters.page === data.meta.last_page}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No projects found.</p>
          <Link href="/dashboard/my-projects/create">
            <Button className="mt-4">Create Your First Project</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
