import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { validateBannerImageFile, optimizeBannerImage, uploadBannerImage } from '@/utils/imageUpload';

export interface BannerImageUploadProps {
  onImageUploaded: (url: string) => void;
  brand: 'bhyross' | 'deecodes';
  currentImageUrl?: string;
  disabled?: boolean;
  className?: string;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
}

export const BannerImageUpload: React.FC<BannerImageUploadProps> = ({
  onImageUploaded,
  brand,
  currentImageUrl,
  disabled = false,
  className = ''
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: currentImageUrl || null,
    uploading: false,
    progress: 0
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    console.log('File selected:', file.name, file.size, file.type);

    // Validate the file
    const validation = validateBannerImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    
    setUploadState(prev => ({
      ...prev,
      file,
      preview: previewUrl
    }));

    try {
      // Optimize the image
      toast.info('Optimizing image...');
      const optimizedFile = await optimizeBannerImage(file);
      
      // Start upload
      setUploadState(prev => ({ ...prev, uploading: true, progress: 0 }));
      
      // Simulate progress (since Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // Upload the file
      const uploadResult = await uploadBannerImage(optimizedFile, brand);
      
      clearInterval(progressInterval);
      
      if (uploadResult.success && uploadResult.url) {
        setUploadState(prev => ({ ...prev, progress: 100 }));
        toast.success('Banner image uploaded successfully!');
        onImageUploaded(uploadResult.url);
        
        // Update preview with the uploaded URL
        setUploadState(prev => ({
          ...prev,
          preview: uploadResult.url,
          uploading: false,
          file: null
        }));
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        file: null,
        preview: currentImageUrl || null
      }));
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  }, [brand, onImageUploaded, currentImageUrl]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    if (uploadState.preview && uploadState.preview !== currentImageUrl) {
      URL.revokeObjectURL(uploadState.preview);
    }
    
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      progress: 0
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadState.preview, currentImageUrl]);

  // Handle click to upload
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-2 block">
        Banner Image
      </Label>
      
      <Card 
        className={`relative border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : uploadState.preview 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="p-6">
          {uploadState.preview ? (
            <div className="relative">
              <img
                src={uploadState.preview}
                alt="Banner preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {uploadState.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Uploading... {uploadState.progress}%</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your banner image here
              </p>
              <p className="text-sm text-gray-600 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-500">
                Supports: JPEG, PNG, WebP • Max size: 10MB
              </p>
              <p className="text-xs text-gray-500">
                Recommended: 1920x800px or similar banner dimensions
              </p>
            </div>
          )}
        </div>
        
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-medium text-blue-700">
                Drop image to upload
              </p>
            </div>
          </div>
        )}
      </Card>
      
      {uploadState.file && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {uploadState.file.name} ({(uploadState.file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
    </div>
  );
};

// Default export
export default BannerImageUpload;
