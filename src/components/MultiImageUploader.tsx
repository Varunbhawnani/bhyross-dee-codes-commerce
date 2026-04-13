import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Upload, X, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

export interface MultiImageUploaderRef {
  getFilesForUpload: () => File[];
}

const MultiImageUploader = forwardRef<MultiImageUploaderRef, MultiImageUploaderProps>(({
  images,
  onChange,
  maxImages,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 5
}, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<Array<{ file: File; preview: string; id: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use ${acceptedTypes.join(', ')}.`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB.`;
    }
    
    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    setError(null);
    const newFiles: Array<{ file: File; preview: string; id: string }> = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        continue;
      }
      
      if (maxImages && (images.length + previewImages.length + newFiles.length) >= maxImages) {
        setError(`Maximum ${maxImages} images allowed.`);
        break;
      }
      
      const preview = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random()}`;
      newFiles.push({ file, preview, id });
    }
    
    setPreviewImages(prev => [...prev, ...newFiles]);
  }, [images.length, previewImages.length, maxImages, acceptedTypes, maxFileSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removePreviewImage = (id: string) => {
    setPreviewImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up the URL
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return updated;
    });
  };

  const removeExistingImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number, isExisting: boolean = true) => {
    if (isExisting) {
      const newImages = [...images];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      onChange(newImages);
    } else {
      const newPreviews = [...previewImages];
      const [removed] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, removed);
      setPreviewImages(newPreviews);
    }
  };

  // Get all files for upload
  const getFilesForUpload = useCallback(() => {
    return previewImages.map(img => img.file);
  }, [previewImages]);

  // Expose this method to parent component
  useImperativeHandle(ref, () => ({
    getFilesForUpload
  }), [getFilesForUpload]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop images here or click to upload
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} 
          (Max {maxFileSize}MB each)
          {maxImages && ` • Max ${maxImages} images`}
        </p>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Select Images
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Existing Images */}
      {images.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <Card key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, index - 1)}
                      >
                        ←
                      </Button>
                    )}
                    {index < images.length - 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, index + 1)}
                      >
                        →
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeExistingImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">Primary</Badge>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preview New Images */}
      {previewImages.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">New Images (will be uploaded)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewImages.map((image, index) => (
              <Card key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, index - 1, false)}
                      >
                        ←
                      </Button>
                    )}
                    {index < previewImages.length - 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, index + 1, false)}
                      >
                        →
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePreviewImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="absolute top-2 left-2">
                  <Badge variant="outline">New</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <span>
          Total: {images.length + previewImages.length} images
          {maxImages && ` / ${maxImages} max`}
        </span>
        {previewImages.length > 0 && (
          <span className="text-blue-600">
            {previewImages.length} new images ready to upload
          </span>
        )}
      </div>
    </div>
  );
});

MultiImageUploader.displayName = 'MultiImageUploader';

export default MultiImageUploader;