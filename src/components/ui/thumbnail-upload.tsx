import { useState, useRef, forwardRef } from 'react';

interface ThumbnailUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  previewUrl?: string | null;
  onPreviewChange: (url: string | null) => void;
  label?: string;
  placeholder?: string;
}

const ThumbnailUpload = forwardRef<HTMLInputElement, ThumbnailUploadProps>(
  ({ value, onChange, previewUrl, onPreviewChange, label = 'Gambar Thumbnail', placeholder = 'Pilih gambar thumbnail...' }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Silakan pilih file gambar (JPEG, PNG, GIF, etc.)');
          return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('File terlalu besar. Maksimal 2MB.');
          return;
        }
        
        onChange(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          onPreviewChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Silakan pilih file gambar (JPEG, PNG, GIF, etc.)');
          return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('File terlalu besar. Maksimal 2MB.');
          return;
        }
        
        onChange(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          onPreviewChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const triggerFileSelect = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const removeImage = () => {
      onChange(null);
      onPreviewChange(null);
    };

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div 
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-input hover:border-accent'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <input
            type="file"
            ref={ref}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview thumbnail" 
                className="mx-auto max-h-40 rounded-md object-contain"
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center hover:opacity-90"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                {placeholder}
              </p>
              <p className="text-xs text-muted-foreground">
                Format: JPG, PNG, maksimal 2MB
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ThumbnailUpload.displayName = 'ThumbnailUpload';

export { ThumbnailUpload };