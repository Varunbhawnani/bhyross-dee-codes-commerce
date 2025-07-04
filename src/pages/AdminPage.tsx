import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useProductOperations } from '@/hooks/useProductOperations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Package,
  Palette,
  ShoppingCart,
  Users,
  Settings,
  ArrowLeft,
  Home,
  ChevronRight,
  Loader2,
  Building2
} from 'lucide-react';

// Import admin components
import AdminBannerSection from '@/components/admin/AdminBannerSection';
import ProductForm from '@/components/admin/ProductForm';
import ProductList from '@/components/admin/ProductList';
import OverviewStats from '@/components/admin/OverviewStats';
import OrdersTab from '@/components/admin/OrdersTab';
import CustomersTab from '@/components/admin/CustomersTab';
import SettingsTab from '@/components/admin/SettingsTab';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import BulkInquiriesTab from '@/components/admin/BulkInquiriesTab';

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Product data and operations
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { createProduct, updateProduct, deleteProduct, isCreating, isUpdating, isDeleting } = useProductOperations();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    brand: 'bhyross' as 'bhyross' | 'deecodes' | 'imcolus',
    category: 'oxford' as 'oxford' | 'derby' | 'monk-strap' | 'loafer',
    price: '',
    stock_quantity: '',
    sizes: [] as number[],
    images: ''
  });

  // Size management functions
  const addSize = (size: number) => {
    setProductForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, size]
    }));
  };

  const removeSize = (size: number) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: productForm.name,
      description: productForm.description,
      brand: productForm.brand,
      category: productForm.category,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity),
      sizes: productForm.sizes,
      images: productForm.images
    };

    if (editingProduct) {
      updateProduct({ id: editingProduct.id, productData }, {
        onSuccess: async () => {
          await refetchProducts();
          setProductForm({
            name: '',
            description: '',
            brand: 'bhyross',
            category: 'oxford',
            price: '',
            stock_quantity: '',
            sizes: [],
            images: ''
          });
          setShowAddProduct(false);
          setEditingProduct(null);
        },
        onError: (error) => {
          console.error('Error updating product:', error);
        }
      });
    } else {
      createProduct(productData, {
        onSuccess: async () => {
          await refetchProducts();
          setProductForm({
            name: '',
            description: '',
            brand: 'bhyross',
            category: 'oxford',
            price: '',
            stock_quantity: '',
            sizes: [],
            images: ''
          });
          setShowAddProduct(false);
          setEditingProduct(null);
        },
        onError: (error) => {
          console.error('Error creating product:', error);
        }
      });
    }
  };

  // Loading state
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

  // Authentication check
  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  // Navigation handlers
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Product management handlers
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      sizes: product.sizes || [],
      images: product.images || ''
    });
    setShowAddProduct(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      brand: 'bhyross',
      category: 'oxford',
      price: '',
      stock_quantity: '',
      sizes: [],
      images: ''
    });
    setShowAddProduct(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteConfirm(productId);
  };

  const handleCloseProductForm = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteConfirm(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm) {
      deleteProduct(deleteConfirm, {
        onSuccess: async () => {
          await refetchProducts();
          setDeleteConfirm(null);
        },
        onError: (error) => {
          console.error('Error deleting product:', error);
          setDeleteConfirm(null);
        }
      });
    }
  };

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
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
            <TabsTrigger value="bulk-inquiries" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Bulk Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewStats />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Products</h2>
              <Button onClick={handleAddNewProduct}>
                <Package className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </div>

            {/* Product Form */}
            {showAddProduct && (
              <ProductForm
                productForm={productForm}
                setProductForm={setProductForm}
                editingProduct={editingProduct}
                isCreating={isCreating}
                isUpdating={isUpdating}
                onSubmit={handleSubmit}
                onCancel={handleCloseProductForm}
                addSize={addSize}
                removeSize={removeSize}
                refetchProducts={refetchProducts}
                setEditingProduct={setEditingProduct}
              />
            )}

            {/* Products List */}
            <ProductList
              products={products || []}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <AdminBannerSection />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="bulk-inquiries" className="space-y-6">
            <BulkInquiriesTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default AdminPage;