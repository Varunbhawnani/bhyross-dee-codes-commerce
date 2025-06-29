import React, { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAllProducts, useProductStats } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ProductImageManager from '@/components/ProductImageManager';
import { useAllBannerImages, useBannerOperations } from '@/hooks/useBannerImages';
import {  Upload } from 'lucide-react';
import BannerImageUpload from '../components/BannerImageUpload'; // Adjust import path as needed
import { useProductOperations, ProductFormData } from '@/hooks/useProductOperations';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Home,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';

// Then use it in your product editing section
// Banner Form State Interface
interface BannerFormState {
  brand: 'bhyross' | 'deecodes';
  image_url: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useAllProducts();
  const { data: stats } = useProductStats();
  const { 
    createProduct, 
    updateProduct, 
    deleteProduct,
    isCreating, 
    isUpdating, 
    isDeleting 
  } = useProductOperations();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

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
          <p className="text-neutral-600">Manage banner images for both brands</p>
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
                  onValueChange={(value: 'bhyross' | 'deecodes') =>
                    setBannerForm(prev => ({ ...prev, brand: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bhyross">Bhyross</SelectItem>
                    <SelectItem value="deecodes">DeeCode</SelectItem>
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
                          variant={banner.brand === 'bhyross' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {banner.brand === 'bhyross' ? 'Bhyross' : 'DeeCode'}
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

  // Update your productForm state initialization to parse existing images
  const initializeProductForm = (product?: any) => {
  return {
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || 'bhyross',
    category: product?.category || 'oxford',
    price: product?.price?.toString() || '',
    stock_quantity: product?.stock_quantity?.toString() || '',
    sizes: product?.sizes || [],
    images: "" // Dummy value - ProductImageManager handles images separately
  };
};


  // Update your form state initialization
  const [productForm, setProductForm] = useState(initializeProductForm());

  // Settings state
  const [settings, setSettings] = useState({
    siteName: 'Bhyross & Dee Codes',
    siteDescription: 'Premium footwear collection',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    orderNotifications: true,
    lowStockThreshold: 10,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    contactEmail: 'contact@bhyrossdeecodes.com',
    contactPhone: '+91 12345 67890',
    address: '123 Fashion Street, Mumbai, India',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-neutral-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Function to handle editing a product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm(initializeProductForm(product));
    setShowAddProduct(true);
  };

  // Function to handle adding new product
  const handleAddNewProduct = () => {
    setProductForm(initializeProductForm());
    setEditingProduct(null);
    setShowAddProduct(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteConfirm(productId);
  };

  const confirmDeleteProduct = () => {
    if (deleteConfirm) {
      deleteProduct(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  // Function to handle form submission with image upload
// Function to save images to product_images table


// Updated Function to handle form submission with image upload
const handleProductSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const productData: ProductFormData = {
      name: productForm.name,
      description: productForm.description,
      brand: productForm.brand,
      category: productForm.category,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity),
      sizes: productForm.sizes,
      images: "", // Dummy value - ignored by mutations
    };

    if (editingProduct) {
      await new Promise((resolve, reject) => {
        updateProduct(
          { id: editingProduct.id, productData },
          { onSuccess: resolve, onError: reject }
        );
      });
    } else {
      await new Promise((resolve, reject) => {
        createProduct(productData, {
          onSuccess: resolve,
          onError: reject,
        });
      });
    }

    // Reset form and close modals
    setProductForm(initializeProductForm());
    setEditingProduct(null);
    setShowAddProduct(false);
    
  } catch (error) {
    console.error('Product submission error:', error);
    toast({
      title: "Error",
      description: "Failed to save product",
      variant: "destructive",
    });
  }
};

  const handleSaveSettings = async () => {
    try {
      // Here you would implement settings save functionality
      console.log('Saving settings:', settings);
      // Example: await updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const addSize = (size: number) => {
    if (!productForm.sizes.includes(size)) {
      setProductForm({
        ...productForm,
        sizes: [...productForm.sizes, size].sort((a, b) => a - b)
      });
    }
  };

  const removeSize = (size: number) => {
    setProductForm({
      ...productForm,
      sizes: productForm.sizes.filter(s => s !== size)
    });
  };

  // JSX for the product form (replace your existing form JSX)
  const ProductForm = () => (
    <form onSubmit={handleProductSubmit} className="space-y-6">
      {/* Existing form fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={productForm.name}
            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={productForm.price}
            onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Select 
            value={productForm.brand} 
            onValueChange={(value: 'bhyross' | 'deecodes') => 
              setProductForm(prev => ({ ...prev, brand: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bhyross">Bhyross</SelectItem>
              <SelectItem value="deecodes">Dee Codes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={productForm.category} 
            onValueChange={(value: 'oxford' | 'derby' | 'monk-strap' | 'loafer') => 
              setProductForm(prev => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oxford">Oxford</SelectItem>
              <SelectItem value="derby">Derby</SelectItem>
              <SelectItem value="monk-strap">Monk Strap</SelectItem>
              <SelectItem value="loafer">Loafer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="stock">Stock Quantity</Label>
        <Input
          id="stock"
          type="number"
          value={productForm.stock_quantity}
          onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>Available Sizes</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {[6, 7, 8, 9, 10, 11, 12].map(size => (
            <Button
              key={size}
              type="button"
              variant={productForm.sizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => productForm.sizes.includes(size) ? removeSize(size) : addSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={productForm.description}
          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
        />
      </div>

     {/* Product Image Management */}
{editingProduct && (
  <div>
    <Label>Product Images</Label>
    <div className="mt-2">
      <ProductImageManager 
        productId={editingProduct.id}
        images={editingProduct.product_images || []}
        onImagesUpdate={async () => {
          // Refetch products to get updated data
          const result = await refetchProducts();
          // Find and update the editing product with fresh data
          const updatedProduct = result.data?.find(p => p.id === editingProduct.id);
          if (updatedProduct) {
            setEditingProduct(updatedProduct);
          }
        }}
      />
    </div>
  </div>
)}

{!editingProduct && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      💡 <strong>Tip:</strong> Save the product first, then edit it to add images.
    </p>
  </div>
)}

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
            setProductForm(initializeProductForm());
          }}
          disabled={false}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {editingProduct ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editingProduct ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <nav className="flex items-center space-x-2 text-sm text-neutral-600">
                <button onClick={handleGoHome} className="hover:text-neutral-900 flex items-center">
                  <Home className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-neutral-900 font-medium">Admin Dashboard</span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">Welcome, {user.email}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsList className="grid w-full grid-cols-6"></TabsList>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center space-x-2">
  <Palette className="h-4 w-4" />
  <span>Banners</span>
</TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Products</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats?.totalProducts || 0}</p>
                    <p className="text-sm text-green-600 mt-1">+{stats?.newProductsThisWeek || 0} this week</p>
                  </div>
                  <Package className="h-8 w-8 text-neutral-500" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Active Products</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats?.activeProducts || 0}</p>
                    <p className="text-sm text-neutral-600 mt-1">{stats?.inactiveProducts || 0} inactive</p>
                  </div>
                  <Eye className="h-8 w-8 text-neutral-500" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Low Stock Items</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats?.lowStockProducts || 0}</p>
                    <p className="text-sm text-orange-600 mt-1">Need attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Revenue</p>
                    <p className="text-3xl font-bold text-neutral-900">₹1,24,580</p>
                    <p className="text-sm text-green-600 mt-1">+18% from last month</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-neutral-500" />
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-neutral-600">Order #1247 - ₹4,250</p>
                  </div>
                  <span className="text-xs text-neutral-500 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <Package className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Product updated</p>
                    <p className="text-xs text-neutral-600">Oxford Brown Leather updated</p>
                  </div>
                  <span className="text-xs text-neutral-500 ml-auto">15 min ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">New customer registered</p>
                    <p className="text-xs text-neutral-600">john.doe@example.com</p>
                  </div>
                  <span className="text-xs text-neutral-500 ml-auto">1 hour ago</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Products</h2>
              <Button 
                onClick={handleAddNewProduct}
                className="flex items-center space-x-2"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Add Product</span>
              </Button>
            </div>

            {/* Add/Edit Product Form */}
            {showAddProduct && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <ProductForm />
              </Card>
            )}

            {/* Products List */}
            <Card>
              <div className="p-6">
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                       <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
  {product.product_images?.length > 0 ? (
    <img 
      src={product.product_images.find(img => img.is_primary)?.image_url || product.product_images[0]?.image_url}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <Package className="h-6 w-6 text-neutral-500" />
  )}
</div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">{product.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={product.brand === 'bhyross' ? 'default' : 'secondary'}>
                              {product.brand}
                            </Badge>
                            <span className="text-sm text-neutral-600 capitalize">{product.category}</span>
                          </div>
                          <p className="text-sm font-medium text-neutral-900 mt-1">₹{product.price.toLocaleString()}</p>
                          <p className="text-xs text-neutral-600">Stock: {product.stock_quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="p-6 max-w-md mx-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <h3 className="text-lg font-semibold">Confirm Delete</h3>
                  </div>
                  <p className="text-neutral-600 mb-6">
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmDeleteProduct}>
                      Delete
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
<TabsContent value="banners" className="space-y-6">
  <AdminBannerSection />
</TabsContent>
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900">Orders Management</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">#ORD-001247</h4>
                    <p className="text-sm text-neutral-600">John Doe - john@example.com</p>
                    <p className="text-sm font-medium text-green-600">₹4,250</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">#ORD-001246</h4>
                    <p className="text-sm text-neutral-600">Jane Smith - jane@example.com</p>
                    <p className="text-sm font-medium text-green-600">₹3,850</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                    <p className="text-xs text-neutral-500 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">#ORD-001245</h4>
                    <p className="text-sm text-neutral-600">Mike Johnson - mike@example.com</p>
                    <p className="text-sm font-medium text-green-600">₹5,200</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                    <p className="text-xs text-neutral-500 mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900">Customer Management</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">John Doe</h4>
                      <p className="text-sm text-neutral-600">john@example.com</p>
                      <p className="text-xs text-neutral-500">Joined 2 months ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">5 Orders</p>
                    <p className="text-xs text-neutral-600">₹18,450 total</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Jane Smith</h4>
                      <p className="text-sm text-neutral-600">jane@example.com</p>
                      <p className="text-xs text-neutral-500">Joined 1 month ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">3 Orders</p>
                    <p className="text-xs text-neutral-600">₹12,300 total</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900">Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  General Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* System Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  System Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-neutral-600">Temporarily disable site access</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Registration</Label>
                      <p className="text-sm text-neutral-600">Allow new user registrations</p>
                    </div>
                    <Switch
                      checked={settings.allowRegistration}
                      onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStock">Low Stock Threshold</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-neutral-600">Receive email alerts</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Notifications</Label>
                      <p className="text-sm text-neutral-600">Get notified of new orders</p>
                    </div>
                    <Switch
                      checked={settings.orderNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, orderNotifications: checked})}
                    />
                  </div>
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
