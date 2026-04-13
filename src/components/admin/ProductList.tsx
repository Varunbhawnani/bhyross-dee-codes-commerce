import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Edit, Trash2, Search, X, AlertCircle } from 'lucide-react';

// Updated interfaces to match your actual database structure
interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
  created_at: string | null;
}

interface ProductVariant {
  id: string;
  product_id: string;
  color_name: string | null;
  is_default_color: boolean | null;
  is_active: boolean | null;
  sku: string | null;
  stock_quantity: number | null;
  created_at: string | null;
  product_images: ProductImage[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: 'bhyross' | 'deecodes' | 'imcolus';
  category: string;  // Changed from enum to string
  price: number;
  stock_quantity: number;
  sizes: number[] | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
  default_variant_id: string | null;
  product_variants: ProductVariant[];
}

interface ProductListProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEditProduct,
  onDeleteProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  console.log('ProductList received products:', products); // Debug log

  // Helper function to get the primary image from product variants
  const getPrimaryProductImage = (product: Product): string | null => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return null;
    }

    // Look for primary image across all variants
    for (const variant of product.product_variants) {
      if (variant.product_images && variant.product_images.length > 0) {
        // First try to find a primary image
        const primaryImage = variant.product_images.find(img => img.is_primary);
        if (primaryImage) {
          return primaryImage.image_url;
        }
      }
    }

    // If no primary image found, return the first image from the default variant
    const defaultVariant = product.product_variants.find(v => v.is_default_color) || product.product_variants[0];
    if (defaultVariant?.product_images && defaultVariant.product_images.length > 0) {
      return defaultVariant.product_images[0].image_url;
    }

    return null;
  };

  // Helper function to format brand name
  const formatBrandName = (brand: string): string => {
    switch (brand) {
      case 'bhyross':
        return 'Bhyross';
      case 'deecodes':
        return 'Dee Codes';
      case 'imcolus':
        return 'Imcolus';
      default:
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  };

  // Helper function to format category name
  const formatCategoryName = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter products based on search term
  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }

    const searchLower = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      formatBrandName(product.brand).toLowerCase().includes(searchLower) ||
      formatCategoryName(product.category).toLowerCase().includes(searchLower)
    );
  }, [products, searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Card>
      <div className="p-6">
        {/* Search Section */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search products by name, brand, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-neutral-600 mt-2">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Debug: Total products received: {products.length}
            </p>
            <p className="text-sm text-blue-800">
              Filtered products: {filteredProducts.length}
            </p>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {searchTerm ? 'No products found' : products.length === 0 ? 'No products yet' : 'No matching products'}
              </h3>
              <p className="text-neutral-600">
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all products.'
                  : products.length === 0
                  ? 'Start by adding your first product to the inventory.'
                  : 'No products match your current search.'
                }
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const primaryImageUrl = getPrimaryProductImage(product);
              const variantCount = product.product_variants?.length || 0;
              const totalVariantStock = product.product_variants?.reduce((sum, variant) => 
                sum + (variant.stock_quantity || 0), 0) || 0;
              const hasVariants = variantCount > 0;
              
              return (
                <div key={product.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {primaryImageUrl ? (
                        <img
                          src={primaryImageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.fallback-icon');
                              if (fallback) {
                                fallback.classList.remove('hidden');
                              }
                            }
                          }}
                        />
                      ) : null}
                      <Package 
                        className={`fallback-icon h-6 w-6 text-neutral-500 ${primaryImageUrl ? 'hidden' : 'flex'}`} 
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-neutral-900">{product.name}</h3>
                        {!hasVariants && (
                          <div className="relative group">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            {/* Tooltip using CSS - alternative to title prop */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              No variants created - product won't appear on website
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="default">
                          {formatBrandName(product.brand)}
                        </Badge>
                        <span className="text-sm text-neutral-600">
                          {formatCategoryName(product.category)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-neutral-900 mt-1">
                        ₹{product.price.toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-neutral-600 mt-1">
                        <span>Base Stock: {product.stock_quantity}</span>
                        {hasVariants ? (
                          <>
                            <span>•</span>
                            <span>{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>Variant stock: {totalVariantStock}</span>
                          </>
                        ) : (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-medium">No variants</span>
                          </>
                        )}
                        <span>•</span>
                        <span className={`font-medium ${product.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {!hasVariants && (
                        <p className="text-xs text-amber-600 mt-1">
                          ⚠️ Product needs variants to appear on website
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProduct(product)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteProduct(product.id)}
                      className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductList;