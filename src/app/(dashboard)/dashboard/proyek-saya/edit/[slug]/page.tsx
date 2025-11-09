'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { projectApi } from '@/lib/api/projects';
import { categoriesApi } from '@/lib/api/categories';
import { technologiesApi } from '@/lib/api/technologies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MultiSelect } from '@/components/ui/multi-select';
import { ThumbnailUpload } from '@/components/ui/thumbnail-upload';
import { TagsInput } from '@/components/ui/tags-input';
import toast from 'react-hot-toast';

export default function EditProyekPage({ params }: { params: { slug: string } }) {
  const { isHydrated } = useRequireAuth();
  const router = useRouter();
  const { slug } = params;
  useBreadcrumb();

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    enabled: isHydrated,
  });

  const categories = categoriesData?.data || [];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    demo_url: '',
    repository_url: '',
    category: '',
    status: 'draft',
    visibility: 'private',
    allow_comments: true,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  
  // Tags state with sample suggestions
  const [tags, setTags] = useState<string[]>([]);
  const [tagsSuggestions] = useState<string[]>([
    'web', 'mobile', 'ai', 'machine-learning', 'react', 'laravel', 
    'javascript', 'python', 'java', 'php', 'nodejs', 'database',
    'api', 'frontend', 'backend', 'fullstack', 'mobile-app', 'desktop-app',
    'iot', 'arduino', 'raspberry-pi', 'game', 'unity', 'unreal-engine',
    'blockchain', 'crypto', 'security', 'devops', 'docker', 'kubernetes'
  ]);

  // Fetch project data
  const { data, isLoading: projectLoading, isError } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectApi.getBySlug(slug),
    enabled: !!slug && isHydrated,
    retry: 1,
  });

  // Fetch technologies
  const { data: technologiesData, isLoading: technologiesLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.getAll(),
    enabled: isHydrated,
  });

  const technologies = technologiesData?.data || [];
  
  // Tech stack selection state
  const [techStackIds, setTechStackIds] = useState<number[]>([]);

  useEffect(() => {
    if (data?.data) {
      const project = data.data;
      setFormData({
        title: project.title || '',
        description: project.description || '',
        content: project.content || '',
        demo_url: project.demo_url || '',
        repository_url: project.repository_url || '',
        tags: project.tags || [],
        category: project.category || '',
        status: project.status || 'draft',
        visibility: project.visibility || 'private',
        allow_comments: project.allow_comments || true,
      });
      
      // Set tech stack IDs based on project's tech stack
      // If tech_stack contains objects with IDs, extract the IDs
      if (project.tech_stack && Array.isArray(project.tech_stack)) {
        const ids = project.tech_stack.map((tech: any) => {
          // If tech is an object with id, use id, otherwise assume it's already an ID
          return typeof tech === 'object' && tech.id ? tech.id : tech;
        });
        setTechStackIds(ids);
      } else {
        setTechStackIds([]);
      }
      
      setCurrentThumbnail(project.thumbnail || null);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      // Prepare form data for API
      const formDataToSend = new FormData();
      
      // Add all fields to FormData
      Object.keys(updatedData).forEach(key => {
        if (key === 'thumbnail' && updatedData[key]) {
          formDataToSend.append('thumbnail', updatedData[key]);
        } else if (key === 'tags' || key === 'tech_stack') {
          // Convert array to JSON string
          if (Array.isArray(updatedData[key]) && updatedData[key].length > 0) {
            formDataToSend.append(key, JSON.stringify(updatedData[key]));
          }
        } else {
          formDataToSend.append(key, updatedData[key]);
        }
      });

      return await projectApi.update(slug, formDataToSend);
    },
    onSuccess: (response) => {
      toast.success('Proyek berhasil diperbarui');
      router.push('/dashboard/proyek-saya');
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui proyek. Silakan coba lagi.'
      );
    },
  });

  if (!isHydrated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Memuat proyek...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="text-center py-12">
          <p className="text-red-500">Proyek tidak ditemukan</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/dashboard/proyek-saya')}
          >
            Kembali ke Proyek Saya
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for submission
    const dataToSubmit = {
      ...formData,
      tags: tags,
      tech_stack: techStackIds, // Send as array of IDs
      thumbnail: thumbnail || undefined,
    };
    
    updateMutation.mutate(dataToSubmit);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert tags array to comma-separated string for input
  const tagsString = formData.tags.join(', ');

  // Convert tech stack array to comma-separated string for input
  const techStackString = techStack.join(', ');

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-3xl font-bold">Edit Proyek</h1>
        <p className="text-muted-foreground mt-1">
          Perbarui detail proyek Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Proyek</CardTitle>
          <CardDescription>
            Update informasi proyek Anda untuk menjaga konten tetap relevan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Judul Proyek *
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Contoh: Aplikasi Manajemen Keuangan Pribadi"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Deskripsi Singkat
              </label>
              <Input
                id="description"
                type="text"
                placeholder="Jelaskan secara singkat tentang proyek Anda"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Content - Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Konten *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Deskripsikan proyek Anda secara detail..."
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Kategori
              </label>
              {categoriesLoading ? (
                <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground h-10 flex items-center">
                  <span className="text-muted-foreground">Memuat kategori...</span>
                </div>
              ) : (
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Teknologi yang Digunakan
              </label>
              {technologiesLoading ? (
                <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground h-10 flex items-center">
                  <span className="text-muted-foreground">Memuat teknologi...</span>
                </div>
              ) : (
                <MultiSelect
                  options={technologies}
                  selected={techStackIds}
                  onChange={setTechStackIds}
                  placeholder="Pilih teknologi yang digunakan..."
                />
              )}
            </div>

            {/* Demo URL */}
            <div className="space-y-2">
              <label htmlFor="demo_url" className="text-sm font-medium">
                Demo URL
              </label>
              <Input
                id="demo_url"
                type="url"
                placeholder="https://demo-project.com"
                value={formData.demo_url}
                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Tautan ke demo proyek Anda (jika ada)
              </p>
            </div>

            {/* Repository URL */}
            <div className="space-y-2">
              <label htmlFor="repository_url" className="text-sm font-medium">
                Repository URL
              </label>
              <Input
                id="repository_url"
                type="url"
                placeholder="https://github.com/username/repository"
                value={formData.repository_url}
                onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Tautan ke repository kode sumber (GitHub, GitLab, dll)
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tags
              </label>
              <TagsInput
                value={tags}
                onChange={setTags}
                suggestions={tagsSuggestions}
                placeholder="Tambahkan tags (pisahkan dengan koma atau tekan Enter)..."
              />
            </div>

            {/* Thumbnail Upload */}
            <ThumbnailUpload
              value={currentThumbnail}
              onChange={setThumbnail}
              previewUrl={thumbnailPreview || currentThumbnail}
              onPreviewChange={setThumbnailPreview}
            />

            {/* Visibility and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Visibilitas
                </label>
                <div className="space-y-2">
                  {([
                    { value: 'public', label: 'Publik (dapat dilihat semua orang)' },
                    { value: 'unlisted', label: 'Tidak Terdaftar (dapat diakses dengan tautan)' },
                    { value: 'private', label: 'Pribadi (hanya Anda yang dapat melihat)' }
                  ]).map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={formData.visibility === option.value}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status
                </label>
                <div className="space-y-2">
                  {([
                    { value: 'draft', label: 'Draft (simpan untuk diedit nanti)' },
                    { value: 'published', label: 'Dipublikasi (tampilkan di profil)' }
                  ]).map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formData.status === option.value}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Allow Comments */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allow_comments}
                  onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Izinkan komentar pada proyek ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard/proyek-saya')}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Memperbarui...' : 'Perbarui Proyek'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}