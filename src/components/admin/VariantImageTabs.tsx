import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Images, Palette, CheckCircle, AlertTriangle } from 'lucide-react';
import ProductImageManager from '@/components/ProductImageManager';

interface ColorVariant {
  id: string;
  product_id: string;
  color_name: string;
  is_default_color: boolean;
  is_active: boolean;
  sku: string | null;
  stock_quantity: number | null;
  product_images?: ProductImage[];
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  variant_id: string | null;
}

interface VariantImageTabsProps {
  productId: string;
  variants: ColorVariant[];
  onImagesUpdate: () => void;
}

const VariantImageTabs: React.FC<VariantImageTabsProps> = ({
  productId,
  variants,
  onImagesUpdate
}) => {
  const [activeTab, setActiveTab] = useState<string>('');

  // Set default tab to the first active variant or default variant
  React.useEffect(() => {
    if (variants.length > 0 && !activeTab) {
      const defaultVariant = variants.find(v => v.is_default_color) || variants[0];
      setActiveTab(defaultVariant.id);
    }
  }, [variants, activeTab]);

  // Get images for each variant
  const getVariantImages = useMemo(() => {
    return (variantId: string): ProductImage[] => {
      const variant = variants.find(v => v.id === variantId);
      return variant?.product_images || [];
    };
  }, [variants]);

  // Calculate completion status for each variant
  const getVariantStatus = useMemo(() => {
    return (variantId: string) => {
      const images = getVariantImages(variantId);
      const hasImages = images.length > 0;
      const hasPrimary = images.some(img => img.is_primary);
      
      return {
        hasImages,
        hasPrimary,
        imageCount: images.length,
        isComplete: hasImages && hasPrimary
      };
    };
  }, [getVariantImages]);

  if (!variants || variants.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Palette className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-lg font-medium">No color variants found</p>
            <p className="text-sm text-gray-400">
              Create color variants first to manage their images
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedVariants = variants.filter(v => getVariantStatus(v.id).isComplete).length;
  const totalVariants = variants.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Variant Images Manager
            <Badge variant="outline" className="ml-2">
              {completedVariants}/{totalVariants} Complete
            </Badge>
          </div>
        </CardTitle>
        <div className="text-sm text-gray-600">
          Add images to each color variant. Each variant can have multiple images with one set as primary.
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Images className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Total Variants</div>
                <div className="text-2xl font-bold text-blue-600">{totalVariants}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Completed</div>
                <div className="text-2xl font-bold text-green-600">{completedVariants}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">Pending</div>
                <div className="text-2xl font-bold text-orange-600">{totalVariants - completedVariants}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Variant Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 h-auto p-2">
            {variants.map((variant) => {
              const status = getVariantStatus(variant.id);
              return (
                <TabsTrigger
                  key={variant.id}
                  value={variant.id}
                  className="relative flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2"
                      style={{ 
                        backgroundColor: variant.color_name?.toLowerCase().includes('black') ? '#000000' :
                                        variant.color_name?.toLowerCase().includes('brown') ? '#8B4513' :
                                        variant.color_name?.toLowerCase().includes('tan') ? '#D2B48C' :
                                        variant.color_name?.toLowerCase().includes('navy') ? '#000080' :
                                        variant.color_name?.toLowerCase().includes('white') ? '#FFFFFF' :
                                        variant.color_name?.toLowerCase().includes('red') ? '#FF0000' :
                                        variant.color_name?.toLowerCase().includes('blue') ? '#0000FF' :
                                        '#9CA3AF',
                        borderColor: variant.color_name?.toLowerCase().includes('white') ? '#D1D5DB' : 'transparent'
                      }}
                    />
                    <span className="font-medium truncate max-w-[120px]">
                      {variant.color_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {variant.is_default_color && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        Default
                      </Badge>
                    )}
                    
                    {status.isComplete ? (
                      <Badge variant="default" className="text-xs px-2 py-0 bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {status.imageCount} images
                      </Badge>
                    ) : status.hasImages ? (
                      <Badge variant="outline" className="text-xs px-2 py-0 text-orange-600 border-orange-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        No primary
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs px-2 py-0 text-gray-500">
                        No images
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Contents */}
          {variants.map((variant) => (
            <TabsContent key={variant.id} value={variant.id} className="mt-6">
              <div className="space-y-4">
                {/* Variant Info Header */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border-2"
                        style={{ 
                          backgroundColor: variant.color_name?.toLowerCase().includes('black') ? '#000000' :
                                          variant.color_name?.toLowerCase().includes('brown') ? '#8B4513' :
                                          variant.color_name?.toLowerCase().includes('tan') ? '#D2B48C' :
                                          variant.color_name?.toLowerCase().includes('navy') ? '#000080' :
                                          variant.color_name?.toLowerCase().includes('white') ? '#FFFFFF' :
                                          variant.color_name?.toLowerCase().includes('red') ? '#FF0000' :
                                          variant.color_name?.toLowerCase().includes('blue') ? '#0000FF' :
                                          '#9CA3AF',
                          borderColor: variant.color_name?.toLowerCase().includes('white') ? '#D1D5DB' : 'transparent'
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {variant.color_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Variant ID: {variant.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {variant.is_default_color && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Default Variant
                        </Badge>
                      )}
                      
                      {!variant.is_active && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Status info */}
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span>Images: {getVariantStatus(variant.id).imageCount}</span>
                    <span>Stock: {variant.stock_quantity || 0}</span>
                    {variant.sku && <span>SKU: {variant.sku}</span>}
                  </div>
                </div>

                {/* Image Manager for this variant */}
                <ProductImageManager
                  productId={productId}
                  variantId={variant.id}
                  images={getVariantImages(variant.id)}
                  onImagesUpdate={onImagesUpdate}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Completion Status */}
        {completedVariants === totalVariants ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  🎉 All variants complete!
                </p>
                <p className="text-sm text-green-700">
                  All {totalVariants} color variants have images with primary images set. Your product is ready!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Images className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  Progress: {completedVariants}/{totalVariants} variants completed
                </p>
                <p className="text-sm text-blue-700">
                  {totalVariants - completedVariants} variant{totalVariants - completedVariants !== 1 ? 's' : ''} still need{totalVariants - completedVariants === 1 ? 's' : ''} images. 
                  Each variant should have at least one image with a primary image selected.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">💡 Tips:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Click on variant tabs above to switch between different color variants</li>
            <li>• Each variant can have multiple images, but one must be set as primary</li>
            <li>• The primary image will be shown first in product listings</li>
            <li>• Drag and drop images within each variant to reorder them</li>
            <li>• Use high-quality images (1200x1200px recommended) for best results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariantImageTabs;