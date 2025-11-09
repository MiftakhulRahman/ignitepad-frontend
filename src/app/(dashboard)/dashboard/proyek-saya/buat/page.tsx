'use client';

import { useState } from 'react';
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

export default function BuatProyekPage() {
  const { isHydrated } = useRequireAuth();
  const router = useRouter();
  useBreadcrumb();

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    enabled: isHydrated,
  });

  const categories = categoriesData?.data || [];
  
  // Fetch technologies
  const { data: technologiesData, isLoading: technologiesLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.getAll(),
    enabled: isHydrated,
  });

  const technologies = technologiesData?.data || [];
  
  // Tech stack selection state
  const [techStackIds, setTechStackIds] = useState<number[]>([]);
  
  // Tags state with sample suggestions
  const [tags, setTags] = useState<string[]>([]);
  const [tagsSuggestions] = useState<string[]>([
    'web', 'mobile', 'ai', 'machine-learning', 'react', 'laravel', 
    'javascript', 'python', 'java', 'php', 'nodejs', 'database',
    'api', 'frontend', 'backend', 'fullstack', 'mobile-app', 'desktop-app',
    'iot', 'arduino', 'raspberry-pi', 'game', 'unity', 'unreal-engine',
    'blockchain', 'crypto', 'security', 'devops', 'docker', 'kubernetes'
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '' as string | string[], // Will be comma-separated string, converted to array later
    category: '',
    status: 'draft',
    visibility: 'private',
    allow_comments: true,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [techStack, setTechStack] = useState(''); // Will be comma-separated string, converted to array later
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Prepare form data for API
      const formDataToSend = new FormData();
      
      // Add all fields to FormData
      Object.keys(data).forEach(key => {
        if (key === 'thumbnail' && data[key]) {
          formDataToSend.append('thumbnail', data[key]);
        } else if (key === 'tags' || key === 'tech_stack') {
          // Convert comma-separated string to array
          const arrayValue = data[key].split(',').map((item: string) => item.trim()).filter((item: string) => item);
          if (arrayValue.length > 0) {
            formDataToSend.append(key, JSON.stringify(arrayValue));
          }
        } else {
          formDataToSend.append(key, data[key]);
        }
      });

      return await projectApi.create(formDataToSend);
    },
    onSuccess: (response) => {
      toast.success('Proyek berhasil dibuat');
      router.push('/dashboard/proyek-saya');
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      toast.error(
        error.response?.data?.message || 'Gagal membuat proyek. Silakan coba lagi.'
      );
    },
  });

  if (!isHydrated) {
    return null;
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
    
    createMutation.mutate(dataToSubmit);
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

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-3xl font-bold">Buat Proyek Baru</h1>
        <p className="text-muted-foreground mt-1">
          Bagikan proyek Anda dengan komunitas akademik
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Proyek</CardTitle>
          <CardDescription>
            Lengkapi informasi proyek Anda untuk membantu orang lain memahami konteks dan teknologi yang digunakan
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
                  required
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
              onChange={setThumbnail}
              previewUrl={thumbnailPreview}
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Membuat...' : 'Buat Proyek'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}