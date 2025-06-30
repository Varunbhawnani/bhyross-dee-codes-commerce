import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock_quantity: number;
  product_images?: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
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
  return (
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
                    <Badge variant={product.brand === 'bhyross' ? 'default' : product.brand === 'imcolus' ? 'default' : 'secondary'}>
                      {product.brand === 'imcolus' ? 'Imcolus' : product.brand}
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
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProductList;