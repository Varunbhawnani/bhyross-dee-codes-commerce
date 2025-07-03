import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAllBannerImages, useBannerOperations } from '@/hooks/useBannerImages';
import { Upload, Plus, Edit, Trash2, Save, Loader2 } from 'lucide-react';
import BannerImageUpload from '../BannerImageUpload'; // Adjust import path as needed

// Banner Form State Interface
interface BannerFormState {
  brand: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';
  image_url: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

const AdminBannerSection: React.FC = () => {
  // Banner management state
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [useFileUpload, setUseFileUpload] = useState(true); // Toggle between file upload and URL input

  // Banner form state
  const [bannerForm, setBannerForm] = useState<BannerFormState>({
    brand: 'bhyross',
    image_url: '',
    title: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  // Hooks
  const { data: banners = [], isLoading, error } = useAllBannerImages();
  const { 
    createBanner, 
    updateBanner, 
    deleteBanner, 
    isCreatingBanner, 
    isUpdatingBanner 
  } = useBannerOperations();

  // Handle Add New Banner
  const handleAddNewBanner = () => {
    setBannerForm({
      brand: 'bhyross',
      image_url: '',
      title: '',
      description: '',
      is_active: true,
      sort_order: 0,
    });
    setEditingBanner(null);
    setShowAddBanner(true);
    setUseFileUpload(true);
  };

  // Handle Edit Banner
  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setBannerForm({
      brand: banner.brand,
      image_url: banner.image_url,
      title: banner.title || '',
      description: banner.description || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order,
    });
    setShowAddBanner(true);
    setUseFileUpload(false); // Default to URL input for editing
  };

  // Handle Banner Submit
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerForm.image_url.trim()) {
      alert('Please provide an image URL or upload an image');
      return;
    }

    if (editingBanner) {
      updateBanner({ id: editingBanner.id, ...bannerForm });
    } else {
      createBanner(bannerForm);
    }

    // Reset form
    setBannerForm({
      brand: 'bhyross',
      image_url: '',
      title: '',
      description: '',
      is_active: true,
      sort_order: 0,
    });
    setEditingBanner(null);
    setShowAddBanner(false);
  };

  // Handle image uploaded from file upload component
  const handleImageUploaded = (url: string) => {
    setBannerForm(prev => ({ ...prev, image_url: url }));
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAddBanner(false);
    setEditingBanner(null);
    setBannerForm({
      brand: 'bhyross',
      image_url: '',
      title: '',
      description: '',
      is_active: true,
      sort_order: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading banners...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading banners: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Banner Management</h2>
          <p className="text-neutral-600">Manage banner images for all brands</p>
        </div>
        <Button onClick={handleAddNewBanner}>
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Add/Edit Banner Form */}
      {showAddBanner && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingBanner ? 'Edit Banner' : 'Add New Banner'}
          </h3>
          
          <form onSubmit={handleBannerSubmit} className="space-y-6">
            {/* Brand and Sort Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={bannerForm.brand}
                  onValueChange={(value: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections') =>
                    setBannerForm(prev => ({ ...prev, brand: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bhyross">Bhyross</SelectItem>
                    <SelectItem value="deecodes">DeeCode</SelectItem>
                    <SelectItem value="imcolus">Imcolus</SelectItem>
                    <SelectItem value="home">Home Page</SelectItem>
                    <SelectItem value="collections">Collections Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={bannerForm.sort_order}
                  onChange={(e) =>
                    setBannerForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={bannerForm.is_active}
                  onCheckedChange={(checked) =>
                    setBannerForm(prev => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            {/* Image Upload/URL Toggle */}
            <div className="flex items-center space-x-4 mb-4">
              <Label className="text-sm font-medium">Image Source:</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="upload"
                    name="imageSource"
                    checked={useFileUpload}
                    onChange={() => setUseFileUpload(true)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="upload" className="text-sm">File Upload</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="url"
                    name="imageSource"
                    checked={!useFileUpload}
                    onChange={() => setUseFileUpload(false)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="url" className="text-sm">URL Input</Label>
                </div>
              </div>
            </div>

            {/* Image Upload or URL Input */}
            {useFileUpload ? (
              <BannerImageUpload
                onImageUploaded={handleImageUploaded}
                brand={bannerForm.brand}
                currentImageUrl={bannerForm.image_url}
                disabled={isCreatingBanner || isUpdatingBanner}
              />
            ) : (
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={bannerForm.image_url}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/banner.jpg"
                  required
                />
              </div>
            )}

            {/* Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Banner title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Banner description"
                  rows={3}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreatingBanner || isUpdatingBanner}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreatingBanner || isUpdatingBanner || !bannerForm.image_url.trim()}
              >
                {isCreatingBanner || isUpdatingBanner ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingBanner ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingBanner ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Banners List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Current Banners ({banners.length})
          </h3>

          {banners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No banners created yet</p>
              <p className="text-sm">Click "Add Banner" to create your first banner</p>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div 
                  key={banner.id} 
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Banner'}
                      className="w-24 h-16 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDE3SDEyLjAxIiBzdHJva2U9IiM5Q0E3QjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">
                        {banner.title || 'Untitled Banner'}
                      </h4>
                      {banner.description && (
                        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                          {banner.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          variant={banner.brand === 'bhyross' ? 'default' : banner.brand === 'deecodes' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {banner.brand === 'bhyross' ? 'Bhyross' : 
                           banner.brand === 'deecodes' ? 'DeeCode' : 
                           banner.brand === 'imcolus' ? 'Imcolus' :
                           banner.brand === 'home' ? 'Home Page' : 'Collections Page'}
                        </Badge>
                        <span className="text-xs text-neutral-500">
                          Order: {banner.sort_order}
                        </span>
                        <Badge 
                          variant={banner.is_active ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBanner(banner)}
                      disabled={isCreatingBanner || isUpdatingBanner}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this banner?')) {
                          deleteBanner(banner.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isCreatingBanner || isUpdatingBanner}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminBannerSection;