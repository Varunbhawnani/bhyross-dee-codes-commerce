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
import { Badge } from '@/components/ui/badge';
import { useAllProducts, useProductStats } from '@/hooks/useProducts';
import { useAllBannerImages, useBannerOperations } from '@/hooks/useBannerImages';
import { useProductOperations, ProductFormData, CreateProductData } from '@/hooks/useProductOperations';
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
  Image,
  Loader2
} from 'lucide-react';

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useAllProducts();
  const { data: stats } = useProductStats();
  const { data: banners = [] } = useAllBannerImages();
  const { 
    createProduct, 
    updateProduct, 
    deleteProduct,
    isCreating, 
    isUpdating, 
    isDeleting 
  } = useProductOperations();
  
  const {
    createBanner,
    updateBanner,
    deleteBanner,
    isCreating: isCreatingBanner,
    isUpdating: isUpdatingBanner,
    isDeleting: isDeletingBanner
  } = useBannerOperations();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const navigate = useNavigate();

  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    brand: 'bhyross' as 'bhyross' | 'deecodes',
    image_url: '',
    title: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  // Product form state
  const initializeProductForm = (product?: any) => {
    return {
      name: product?.name || '',
      description: product?.description || '',
      brand: product?.brand || 'bhyross',
      category: product?.category || 'oxford',
      price: product?.price?.toString() || '',
      stock_quantity: product?.stock_quantity?.toString() || '',
      sizes: product?.sizes || [],
      colors: product?.colors || [],
      images: ""
    };
  };

  const [productForm, setProductForm] = useState(initializeProductForm());

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

  // Banner management functions
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
  };

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
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBanner) {
      updateBanner({ id: editingBanner.id, ...bannerForm });
    } else {
      createBanner(bannerForm);
    }

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

  // Product management functions
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm(initializeProductForm(product));
    setShowAddProduct(true);
  };

  const handleAddNewProduct = () => {
    setProductForm(initializeProductForm());
    setEditingProduct(null);
    setShowAddProduct(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData: CreateProductData = {
        name: productForm.name,
        description: productForm.description,
        brand: productForm.brand,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity),
        sizes: productForm.sizes,
        colors: productForm.colors,
      };

      if (editingProduct) {
        updateProduct({ id: editingProduct.id, ...productData });
      } else {
        createProduct(productData);
      }

      setProductForm(initializeProductForm());
      setEditingProduct(null);
      setShowAddProduct(false);
    } catch (error) {
      console.error('Product submission error:', error);
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

  const addColor = (color: string) => {
    if (color && !productForm.colors.includes(color)) {
      setProductForm({
        ...productForm,
        colors: [...productForm.colors, color]
      });
    }
  };

  const removeColor = (color: string) => {
    setProductForm({
      ...productForm,
      colors: productForm.colors.filter(c => c !== color)
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Products</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats?.totalProducts || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-neutral-500" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Banner Management</h2>
              <Button onClick={handleAddNewBanner} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Banner</span>
              </Button>
            </div>

            {/* Add/Edit Banner Form */}
            {showAddBanner && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h3>
                <form onSubmit={handleBannerSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="deecodes">Dee Codes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={bannerForm.sort_order}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={bannerForm.image_url}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, image_url: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={bannerForm.description}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddBanner(false);
                        setEditingBanner(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingBanner || isUpdatingBanner}>
                      {isCreatingBanner || isUpdatingBanner ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> {editingBanner ? 'Update' : 'Create'}</>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Banners List */}
            <Card>
              <div className="p-6">
                <div className="space-y-4">
                  {banners.map((banner) => (
                    <div key={banner.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={banner.image_url}
                          alt={banner.title || 'Banner'}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold text-neutral-900">{banner.title || 'Untitled'}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={banner.brand === 'bhyross' ? 'default' : 'secondary'}>
                              {banner.brand}
                            </Badge>
                            <span className="text-sm text-neutral-600">Order: {banner.sort_order}</span>
                            <Badge variant={banner.is_active ? 'default' : 'secondary'}>
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteBanner(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Products</h2>
              <Button onClick={handleAddNewProduct} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </div>

            {/* Add/Edit Product Form */}
            {showAddProduct && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <form onSubmit={handleProductSubmit} className="space-y-6">
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
                    <Label>Available Colors</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter color name"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addColor((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                            addColor(input.value);
                            input.value = '';
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {productForm.colors.map(color => (
                          <Badge
                            key={color}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeColor(color)}
                          >
                            {color} ×
                          </Badge>
                        ))}
                      </div>
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

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        setProductForm(initializeProductForm());
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || isUpdating}>
                      {isCreating || isUpdating ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> {editingProduct ? 'Update' : 'Create'}</>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Products List */}
            <Card>
              <div className="p-6">
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-neutral-500" />
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900">Orders Management</h2>
            <Card className="p-6">
              <p className="text-neutral-600">Orders management coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900">Settings</h2>
            <Card className="p-6">
              <p className="text-neutral-600">Settings management coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
