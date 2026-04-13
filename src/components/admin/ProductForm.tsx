import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, CheckCircle, ArrowRight, Palette, Images, AlertCircle } from 'lucide-react';
import ColorVariantManager from '@/components/admin/ColorVariantManager';
import VariantImageTabs from '@/components/admin/VariantImageTabs';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';

interface ProductFormProps {
  productForm: {
    name: string;
    description: string;
    brand: 'bhyross' | 'deecodes' | 'imcolus';
    category: string;  // Changed from enum to string
    price: string;
    stock_quantity: string;
    sizes: number[];
    images: string;
  };
  setProductForm: React.Dispatch<React.SetStateAction<any>>;
  editingProduct: any;
  isCreating: boolean;
  isUpdating: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  addSize: (size: number) => void;
  removeSize: (size: number) => void;
  refetchProducts: () => Promise<any>;
  setEditingProduct: React.Dispatch<React.SetStateAction<any>>;
}

// Workflow steps
type WorkflowStep = 'create' | 'variants' | 'images';

const ProductForm: React.FC<ProductFormProps> = ({
  productForm,
  setProductForm,
  editingProduct,
  isCreating,
  isUpdating,
  onSubmit,
  onCancel,
  addSize,
  removeSize,
  refetchProducts,
  setEditingProduct
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('create');
  const { data: categories, isLoading: categoriesLoading } = useCategories(productForm.brand);

  const handleImagesUpdate = async () => {
    try {
      console.log('Refreshing product data for ID:', editingProduct.id);
      
      // Fetch the updated product WITH variants - specifying the exact relationship
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants!product_variants_product_id_fkey (
            id,
            color_name,
            is_default_color,
            is_active,
            stock_quantity,
            sku,
            created_at,
            product_images (*)
          )
        `)
        .eq('id', editingProduct.id)
        .single();

      if (error) {
        console.error('Error fetching updated product:', error);
        throw error;
      }

      console.log('Updated product with variants:', updatedProduct);
      
      if (updatedProduct) {
        setEditingProduct(updatedProduct);
        // Also invalidate React Query cache to keep everything in sync
        await refetchProducts();
      }
    } catch (error) {
      console.error('Error updating product after variant/image change:', error);
      // Try fallback method
      try {
        const result = await refetchProducts();
        const updatedProduct = result.data?.find(p => p.id === editingProduct.id);
        if (updatedProduct) {
          setEditingProduct(updatedProduct);
        }
      } catch (fallbackError) {
        console.error('Fallback refetch also failed:', fallbackError);
      }
    }
  };

  // Only auto-set step for new products, allow manual navigation for existing products
  React.useEffect(() => {
    if (!editingProduct) {
      setCurrentStep('create');
    } else if (!editingProduct.product_variants || editingProduct.product_variants.length === 0) {
      // Only auto-set to variants if we don't have variants AND we're not already on images step
      if (currentStep !== 'images') {
        setCurrentStep('variants');
      }
    }
  }, [editingProduct]);

  const hasVariants = editingProduct?.product_variants && editingProduct.product_variants.length > 0;
  const isProductCreated = editingProduct && editingProduct.id;

  // Calculate total stock from variants
  const totalVariantStock = editingProduct?.product_variants 
    ? editingProduct.product_variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0)
    : 0;

  // Enhanced Workflow Progress Indicator with better navigation
  const WorkflowProgress = () => (
    <div className="mb-6 bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Step 1: Create Product */}
          <Button
            variant="ghost"
            className={`flex items-center space-x-2 h-auto p-3 ${
              currentStep === 'create' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
              isProductCreated ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => isProductCreated && setCurrentStep('create')}
            disabled={!isProductCreated}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === 'create' ? 'bg-blue-100 text-blue-600' : 
              isProductCreated ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {isProductCreated ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium">Create Product</span>
          </Button>

          <ArrowRight className="w-4 h-4 text-gray-300" />

          {/* Step 2: Add Variants - ALWAYS CLICKABLE when product exists */}
          <Button
            variant="ghost"
            className={`flex items-center space-x-2 h-auto p-3 ${
              currentStep === 'variants' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
              hasVariants ? 'text-green-600 hover:bg-green-50' : 
              isProductCreated ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => isProductCreated && setCurrentStep('variants')}
            disabled={!isProductCreated}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === 'variants' ? 'bg-blue-100 text-blue-600' : 
              hasVariants ? 'bg-green-100 text-green-600' : 
              isProductCreated ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {hasVariants ? <CheckCircle className="w-4 w-4" /> : <Palette className="w-4 h-4" />}
            </div>
            <span className="font-medium">
              {hasVariants ? `Manage Variants (${editingProduct.product_variants.length})` : 'Add Color Variants'}
            </span>
          </Button>

          <ArrowRight className="w-4 h-4 text-gray-300" />

          {/* Step 3: Add Images - Only clickable when variants exist */}
          <Button
            variant="ghost"
            className={`flex items-center space-x-2 h-auto p-3 ${
              currentStep === 'images' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
              hasVariants ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => hasVariants && setCurrentStep('images')}
            disabled={!hasVariants}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === 'images' ? 'bg-blue-100 text-blue-600' : 
              hasVariants ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Images className="w-4 h-4" />
            </div>
            <span className="font-medium">Add Images</span>
          </Button>
        </div>

        {/* Show total stock information when variants exist */}
        {hasVariants && (
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <div className="text-sm">
              <span className="text-gray-600">Product Stock: </span>
              <span className="font-semibold text-blue-600">{editingProduct.stock_quantity || 0}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-sm">
              <span className="text-gray-600">Variant Total: </span>
              <span className="font-semibold text-green-600">{totalVariantStock}</span>
            </div>
            {editingProduct.stock_quantity !== totalVariantStock && (
              <div title="Stock quantities don't match">
  <AlertCircle className="w-4 h-4 text-amber-500" />
</div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick navigation hint */}
      {isProductCreated && (
        <div className="mt-3 text-xs text-gray-600">
          💡 Click on any step above to navigate between sections
          {hasVariants && editingProduct.stock_quantity !== totalVariantStock && (
            <span className="ml-4 text-amber-600 font-medium">
              ⚠️ Product stock ({editingProduct.stock_quantity}) doesn't match variant total ({totalVariantStock})
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Step 1: Product Creation Form
  if (currentStep === 'create') {
    return (
      <div>
        <WorkflowProgress />
        
        <form onSubmit={onSubmit} className="space-y-6">
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
                onValueChange={(value: 'bhyross' | 'deecodes' | 'imcolus') => 
                  setProductForm(prev => ({ ...prev, brand: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bhyross">Bhyross</SelectItem>
                  <SelectItem value="deecodes">Dee Codes</SelectItem>
                  <SelectItem value="imcolus">Imcolus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={productForm.category} 
                onValueChange={(value: string) => 
                  setProductForm(prev => ({ ...prev, category: value }))
                }
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.path}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!categoriesLoading && (!categories || categories.length === 0) && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ No categories found. Please create categories first in the Categories tab.
                </p>
              )}
            </div>
          </div>

          <div>
  <Label htmlFor="stock">Total Stock Quantity (Auto-calculated)</Label>
  <Input
    id="stock"
    type="number"
    value={editingProduct ? 
  (editingProduct.product_variants ? 
    editingProduct.product_variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0) 
    : productForm.stock_quantity || "1"
  ) 
  : productForm.stock_quantity || "1"
}
    readOnly
    disabled
    className="bg-gray-50 text-gray-600"
  />
  <p className="text-xs text-gray-600 mt-1">
    💡 This field shows the sum of all variant stock quantities and updates automatically
  </p>
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

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">📋 Stock Management Workflow</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Step 1:</strong> Set initial stock quantity (will be overridden by variants)</p>
              <p>• <strong>Step 2:</strong> Create color variants, each with their own stock quantity</p>
              <p>• <strong>Step 3:</strong> Product's total stock = sum of all variant stock quantities</p>
              <p>• <strong>Step 4:</strong> Add images for each color variant</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Color Variants Management
  if (currentStep === 'variants') {
    const stockMismatch = hasVariants && editingProduct.stock_quantity !== totalVariantStock;
    
    return (
      <div>
        <WorkflowProgress />
        
        <div className="space-y-6">
          {/* Stock Status Alert */}
          {stockMismatch && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    Stock Quantity Mismatch Detected
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Product stock: {editingProduct.stock_quantity} | Variant total: {totalVariantStock}
                    <br />The product stock will be automatically updated to match variant totals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced status message based on variants */}
          {hasVariants ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    <strong>Managing color variants for "{editingProduct.name}"</strong>
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-blue-700">
                    <span>{editingProduct.product_variants.length} variant{editingProduct.product_variants.length !== 1 ? 's' : ''} configured</span>
                    <span>•</span>
                    <span>Total stock: {totalVariantStock} units</span>
                    {stockMismatch && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 font-medium">Will sync with product stock</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  <strong>Product "{editingProduct.name}" created successfully!</strong> 
                  <br />Now add color variants. Each variant will have its own stock quantity, and the total will become your product's stock.
                </p>
              </div>
            </div>
          )}

          <ColorVariantManager
            productId={editingProduct.id}
            variants={editingProduct.product_variants || []}
            onVariantsUpdate={handleImagesUpdate}
            showNextStepButton={hasVariants}
            onNextStep={() => setCurrentStep('images')}
          />
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            
            {hasVariants && (
              <Button
                onClick={() => setCurrentStep('images')}
                className="ml-auto"
              >
                Next: Add Images
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Tabbed Image Management
  if (currentStep === 'images') {
    return (
      <div>
        <WorkflowProgress />
        
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  Excellent! Color variants are configured with stock quantities.
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Product stock: {editingProduct.stock_quantity} units across {editingProduct.product_variants.length} variants. 
                  Now add images for each color variant.
                </p>
              </div>
            </div>
          </div>

          <VariantImageTabs
            productId={editingProduct.id}
            variants={editingProduct.product_variants || []}
            onImagesUpdate={handleImagesUpdate}
          />
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep('variants')}
            >
              Back to Variants
            </Button>
            
            <Button
              onClick={onCancel}
              variant="default"
            >
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProductForm;