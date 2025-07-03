import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductImageManager from '@/components/ProductImageManager';
import { Save, Loader2 } from 'lucide-react';

interface ProductFormProps {
  productForm: {
    name: string;
    description: string;
    brand: 'bhyross' | 'deecodes' | 'imcolus';
    category: 'oxford' | 'derby' | 'monk-strap' | 'loafer';
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
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          onClick={onCancel}
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
};

export default ProductForm;