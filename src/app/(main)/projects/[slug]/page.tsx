'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/lib/api/projects';
import { commentApi } from '@/lib/api/comments';
import { useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Heart, Bookmark, Eye, MessageSquare, Calendar, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectApi.getBySlug(slug),
  });

  const project = projectData?.data;

  useBreadcrumb(project);

  const { data: commentsData } = useQuery({
    queryKey: ['comments', slug],
    queryFn: () => commentApi.getByProject(slug),
    enabled: !!project,
  });

  const likeMutation = useMutation({
    mutationFn: () =>
      project?.is_liked ? projectApi.unlike(slug) : projectApi.like(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', slug] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      project?.is_saved ? projectApi.unsave(slug) : projectApi.save(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', slug] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => commentApi.create(slug, { body: commentBody }),
    onSuccess: () => {
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['comments', slug] });
      queryClient.invalidateQueries({ queryKey: ['project', slug] });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2 mb-8" />
          <div className="h-64 bg-muted rounded mb-4" />
          <div className="h-4 bg-muted rounded w-full mb-2" />
          <div className="h-4 bg-muted rounded w-full mb-2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Link href="/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === project.user_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <Link
                href={`/profile/${project.user?.username}`}
                className="hover:text-foreground"
              >
                By {project.user?.name}
              </Link>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(project.created_at).toLocaleDateString()}
              </span>
              <span className="capitalize bg-secondary px-2 py-1 rounded">
                {project.category}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {project.view_count} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {project.like_count} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {project.comment_count} comments
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {project.featured_image && (
            <img
              src={project.featured_image}
              alt={project.title}
              className="w-full rounded-lg mb-6"
            />
          )}

          {/* Description */}
          {project.description && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          )}

          {/* Content */}
          <div className="mb-6 prose max-w-none">
            <h2 className="text-2xl font-semibold mb-3">Details</h2>
            <div
              className="text-foreground"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </div>

          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          {project.allow_comments && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">
                Comments ({project.comment_count})
              </h2>

              {isAuthenticated ? (
                <div className="mb-8">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (commentBody.trim()) {
                        commentMutation.mutate();
                      }
                    }}
                    className="space-y-4"
                  >
                    <Input
                      placeholder="Write a comment..."
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={commentMutation.isPending || !commentBody.trim()}
                    >
                      {commentMutation.isPending
                        ? 'Posting...'
                        : 'Post Comment'}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="mb-8 p-4 border rounded-lg text-center">
                  <p className="text-muted-foreground mb-2">
                    Please login to comment
                  </p>
                  <Link href="/login">
                    <Button>Login</Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {commentsData?.data?.map((comment) => (
                  <div key={comment.id} className="border-l-2 pl-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {comment.user?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground">{comment.body}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {comment.like_count}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {commentsData?.data?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Action Buttons */}
            {isAuthenticated && !isOwner && (
              <div className="space-y-2">
                <Button
                  variant={project.is_liked ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {project.is_liked ? 'Liked' : 'Like'}
                </Button>
                <Button
                  variant={project.is_saved ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  {project.is_saved ? 'Saved' : 'Save'}
                </Button>
              </div>
            )}

            {isOwner && (
              <div className="space-y-2">
                <Link href={`/dashboard/my-projects/edit/${project.slug}`}>
                  <Button className="w-full">Edit Project</Button>
                </Link>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            {project.user && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Author</h3>
                <Link
                  href={`/profile/${project.user.username}`}
                  className="hover:text-primary"
                >
                  <div className="flex items-center gap-3">
                    {project.user.avatar && (
                      <img
                        src={project.user.avatar}
                        alt={project.user.name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{project.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{project.user.username}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Project Links */}
            {(project.demo_url || project.repository_url) && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Project Links</h3>
                <div className="space-y-2">
                  {project.demo_url && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Demo Website
                      </a>
                    </Button>
                  )}
                  {project.repository_url && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        Source Code
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Collaborators */}
            {project.collaborators && project.collaborators.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Collaborators</h3>
                <div className="space-y-2">
                  {project.collaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center gap-2">
                      <span className="text-sm">{collab.user?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({collab.role})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
