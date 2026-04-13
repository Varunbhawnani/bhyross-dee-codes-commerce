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
import { Upload, Plus, Edit, Trash2, Save, Loader2, Eye, Download, Zap, Clock, FileImage } from 'lucide-react';
import BannerImageUpload from '../BannerImageUpload';
import BannerCropTool from '../BannerCropTool';
import { toast } from 'sonner';

// Fixed banner resolutions
const DESKTOP_RESOLUTION = { width: 1920, height: 800 };
const MOBILE_RESOLUTION = { width: 375, height: 180 };

// Banner Form State Interface
interface BannerFormState {
  brand: 'bhyross' | 'deecodes' | 'imcolus' | 'home' | 'collections';
  image_url: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  desktop_crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mobile_crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const AdminBannerSection: React.FC = () => {
  // Banner management state
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<any>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const [bannerForm, setBannerForm] = useState<BannerFormState>({
    brand: 'bhyross',
    image_url: '',
    title: '',
    description: '',
    is_active: true,
    sort_order: 0,
    desktop_crop: { x: 0, y: 0, width: 1920, height: 800 },
    mobile_crop: { x: 0, y: 0, width: 375, height: 180 },
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

  // Calculate total banners by device optimization
  const optimizedStats = banners.reduce((acc, banner) => {
    if (banner.desktop_image_url && banner.mobile_image_url) {
      acc.fullyOptimized++;
    } else if (banner.desktop_image_url || banner.mobile_image_url) {
      acc.partiallyOptimized++;
    } else {
      acc.unoptimized++;
    }
    return acc;
  }, { fullyOptimized: 0, partiallyOptimized: 0, unoptimized: 0 });

  // Handle Add New Banner
  const handleAddNewBanner = () => {
    setBannerForm({
      brand: 'bhyross',
      image_url: '',
      title: '',
      description: '',
      is_active: true,
      sort_order: 0,
      desktop_crop: { x: 0, y: 0, width: 1920, height: 800 },
      mobile_crop: { x: 0, y: 0, width: 375, height: 180 },
    });
    setEditingBanner(null);
    setShowAddBanner(true);
    setUseFileUpload(true);
  };

  // Handle Edit Banner
  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    
    const restoredForm = {
      brand: banner.brand,
      image_url: banner.image_url,
      title: banner.title || '',
      description: banner.description || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      desktop_crop: banner.desktop_crop ? {
        x: banner.desktop_crop.x,
        y: banner.desktop_crop.y,
        width: banner.desktop_crop.width,
        height: banner.desktop_crop.height
      } : { x: 0, y: 0, width: 1920, height: 800 },
      mobile_crop: banner.mobile_crop ? {
        x: banner.mobile_crop.x,
        y: banner.mobile_crop.y,
        width: banner.mobile_crop.width,
        height: banner.mobile_crop.height
      } : { x: 0, y: 0, width: 375, height: 180 },
    };
    
    console.log('Editing banner - restored form:', restoredForm);
    setBannerForm(restoredForm);
    setShowAddBanner(true);
    setUseFileUpload(false);
  };

  // Handle Banner Submit with Image Processing
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerForm.image_url.trim()) {
      toast.error('Please provide an image URL or upload an image');
      return;
    }

    setIsProcessingImages(true);

    try {
      const bannerData = {
        ...bannerForm,
        shouldProcessImages: true, // Enable image processing
        deleteOldOriginal: editingBanner ? true : false // Delete old original when editing
      };

      if (editingBanner) {
        await updateBanner({ id: editingBanner.id, ...bannerData });
      } else {
        await createBanner(bannerData);
      }

      // Reset form
      setBannerForm({
        brand: 'bhyross',
        image_url: '',
        title: '',
        description: '',
        is_active: true,
        sort_order: 0,
        desktop_crop: { x: 0, y: 0, width: 1920, height: 800 },
        mobile_crop: { x: 0, y: 0, width: 375, height: 180 },
      });
      setEditingBanner(null);
      setShowAddBanner(false);
      
    } catch (error) {
      console.error('Banner operation failed:', error);
      toast.error('Failed to save banner. Please try again.');
    } finally {
      setIsProcessingImages(false);
    }
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
      desktop_crop: { x: 0, y: 0, width: 1920, height: 800 },
      mobile_crop: { x: 0, y: 0, width: 375, height: 180 },
    });
  };

  // Handle crop changes
  const handleCropChange = (desktopCrop: any, mobileCrop: any) => {
    setBannerForm(prev => ({
      ...prev,
      desktop_crop: desktopCrop,
      mobile_crop: mobileCrop
    }));
  };

  // Handle preview banner
  const handlePreviewBanner = (banner: any) => {
    setPreviewBanner(banner);
    setShowPreview(true);
  };

  // Handle close preview
  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewBanner(null);
  };

  // Download processed image
  const downloadProcessedImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  // Get performance indicator for banner
  const getPerformanceIndicator = (banner: any) => {
    const hasDesktop = !!banner.desktop_image_url;
    const hasMobile = !!banner.mobile_image_url;
    
    if (hasDesktop && hasMobile) {
      return {
        status: 'excellent',
        icon: <Zap className="h-3 w-3" />,
        text: 'Fully Optimized',
        color: 'text-green-600 border-green-600'
      };
    } else if (hasDesktop || hasMobile) {
      return {
        status: 'partial',
        icon: <Clock className="h-3 w-3" />,
        text: 'Partially Optimized',
        color: 'text-yellow-600 border-yellow-600'
      };
    } else {
      return {
        status: 'poor',
        icon: <FileImage className="h-3 w-3" />,
        text: 'Not Optimized',
        color: 'text-red-600 border-red-600'
      };
    }
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
      {/* Header with Performance Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Banner Management</h2>
          <p className="text-neutral-600">
            Manage banner images with server-side processing: 
            Desktop ({DESKTOP_RESOLUTION.width}×{DESKTOP_RESOLUTION.height}px) • 
            Mobile ({MOBILE_RESOLUTION.width}×{MOBILE_RESOLUTION.height}px)
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Zap className="h-3 w-3 mr-1" />
              Fast Loading - Optimized Images
            </Badge>
            {optimizedStats.fullyOptimized > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                {optimizedStats.fullyOptimized} Fully Optimized
              </Badge>
            )}
            {optimizedStats.unoptimized > 0 && (
              <Badge variant="outline" className="text-red-600 border-red-600">
                {optimizedStats.unoptimized} Need Optimization
              </Badge>
            )}
          </div>
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
                disabled={isCreatingBanner || isUpdatingBanner || isProcessingImages}
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
                  disabled={isCreatingBanner || isUpdatingBanner || isProcessingImages}
                />
              </div>
            )}

            {/* Banner Crop Tool */}
            {bannerForm.image_url && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Performance Optimization Mode</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Crop your image below. When you save, compressed and optimized desktop (≤800KB) and mobile (≤300KB) versions will be automatically generated for lightning-fast loading across all devices.
                  </p>
                </div>
                
                <BannerCropTool
                  imageUrl={bannerForm.image_url}
                  onCropChange={handleCropChange}
                  initialDesktopCrop={editingBanner ? bannerForm.desktop_crop : undefined}
                  initialMobileCrop={editingBanner ? bannerForm.mobile_crop : undefined}
                  key={`${editingBanner?.id || 'new'}-${bannerForm.image_url}`}
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
                  disabled={isCreatingBanner || isUpdatingBanner || isProcessingImages}
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
                  disabled={isCreatingBanner || isUpdatingBanner || isProcessingImages}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreatingBanner || isUpdatingBanner || isProcessingImages}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreatingBanner || isUpdatingBanner || isProcessingImages || !bannerForm.image_url.trim()}
              >
                {isCreatingBanner || isUpdatingBanner || isProcessingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isProcessingImages ? 'Optimizing Images...' : editingBanner ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
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
              {banners.map((banner) => {
                const perfIndicator = getPerformanceIndicator(banner);
                
                return (
                  <div 
                    key={banner.id} 
                    className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={banner.desktop_image_url || banner.image_url}
                          alt={banner.title || 'Banner'}
                          className="w-32 h-16 object-cover rounded border"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = banner.image_url; // Fallback to original
                          }}
                        />
                        <Badge 
                          variant="outline" 
                          className={`absolute -top-2 -right-2 text-xs px-1 py-0 ${perfIndicator.color}`}
                        >
                          {perfIndicator.icon}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900">
                          {banner.title || 'Untitled Banner'}
                        </h4>
                        {banner.description && (
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                            {banner.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2 flex-wrap">
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
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${perfIndicator.color}`}
                          >
                            {perfIndicator.icon}
                            <span className="ml-1">{perfIndicator.text}</span>
                          </Badge>
                          {/* Device-specific indicators */}
                          {banner.desktop_image_url && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                              Desktop Ready
                            </Badge>
                          )}
                          {banner.mobile_image_url && (
                            <Badge variant="outline" className="text-xs text-purple-600 border-purple-600">
                              Mobile Ready
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewBanner(banner)}
                        disabled={isCreatingBanner || isUpdatingBanner}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                          if (confirm('Are you sure you want to delete this banner? This will delete all associated images.')) {
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
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Enhanced Preview Modal */}
      {showPreview && previewBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Banner Preview - Device-Specific Display</h3>
                  <p className="text-sm text-gray-600">Shows exactly how banners appear on different devices</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClosePreview}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Performance Summary */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Performance Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Desktop:</span>
                      {previewBanner.desktop_image_url ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Zap className="h-3 w-3 mr-1" />
                          Optimized
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <FileImage className="h-3 w-3 mr-1" />
                          Original
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Mobile:</span>
                      {previewBanner.mobile_image_url ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Zap className="h-3 w-3 mr-1" />
                          Optimized
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <FileImage className="h-3 w-3 mr-1" />
                          Original
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Load Speed:</span>
                      <Badge 
                        variant="outline" 
                        className={
                          previewBanner.desktop_image_url && previewBanner.mobile_image_url
                            ? "text-green-600 border-green-600"
                            : "text-yellow-600 border-yellow-600"
                        }
                      >
                        {previewBanner.desktop_image_url && previewBanner.mobile_image_url ? 'Fast' : 'Medium'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      Desktop Display (≥768px screens) - {DESKTOP_RESOLUTION.width}×{DESKTOP_RESOLUTION.height}px
                    </Label>
                    {previewBanner.desktop_image_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadProcessedImage(
                          previewBanner.desktop_image_url, 
                          `banner-desktop-${previewBanner.brand}.jpg`
                        )}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Desktop
                      </Button>
                    )}
                  </div>
                  <div 
                    className="w-full border rounded-lg overflow-hidden bg-gray-100"
                    style={{ aspectRatio: `${DESKTOP_RESOLUTION.width}/${DESKTOP_RESOLUTION.height}` }}
                  >
                    <img
                      src={previewBanner.desktop_image_url || previewBanner.image_url}
                      alt="Desktop preview"
                      className="w-full h-full"
                      style={{ 
                        objectFit: previewBanner.desktop_image_url ? 'fill' : 'cover',
                        objectPosition: 'center'
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    {previewBanner.desktop_image_url ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Zap className="h-3 w-3 mr-1" />
                        Compressed & Optimized for Fast Loading
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Using Original Image (Slower Loading)
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Mobile Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      Mobile Display (&lt;768px screens) - {MOBILE_RESOLUTION.width}×{MOBILE_RESOLUTION.height}px
                    </Label>
                    {previewBanner.mobile_image_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadProcessedImage(
                          previewBanner.mobile_image_url, 
                          `banner-mobile-${previewBanner.brand}.jpg`
                        )}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Mobile
                      </Button>
                    )}
                  </div>
                  <div 
                    className="w-full max-w-sm border rounded-lg overflow-hidden bg-gray-100"
                    style={{ aspectRatio: `${MOBILE_RESOLUTION.width}/${MOBILE_RESOLUTION.height}` }}
                  >
                    <img
                      src={previewBanner.mobile_image_url || previewBanner.image_url}
                      alt="Mobile preview"
                      className="w-full h-full"
                      style={{ 
                        objectFit: previewBanner.mobile_image_url ? 'fill' : 'cover',
                        objectPosition: 'center'
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    {previewBanner.mobile_image_url ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Zap className="h-3 w-3 mr-1" />
                        Compressed & Optimized for Fast Mobile Loading
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Using Original Image (Slower Loading)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Technical Details
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div><strong>Desktop Image:</strong></div>
                      <div className="text-gray-600">
                        • Resolution: {DESKTOP_RESOLUTION.width}×{DESKTOP_RESOLUTION.height}px<br/>
                        • Target Size: ≤800KB<br/>
                        • Format: JPEG (85% quality)<br/>
                        • Usage: Screens ≥768px wide
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div><strong>Mobile Image:</strong></div>
                      <div className="text-gray-600">
                        • Resolution: {MOBILE_RESOLUTION.width}×{MOBILE_RESOLUTION.height}px<br/>
                        • Target Size: ≤300KB<br/>
                        • Format: JPEG (75% quality)<br/>
                        • Usage: Screens &lt;768px wide
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannerSection;