import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Palette, Edit2, Check, X, ArrowRight, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ColorVariant {
  id: string;
  product_id: string;
  color_name: string;
  is_default_color: boolean;
  is_active: boolean;
  sku: string | null;
  stock_quantity: number | null;
  product_images?: any[];
}

interface ColorVariantManagerProps {
  productId: string;
  variants: ColorVariant[];
  onVariantsUpdate: () => void;
  showNextStepButton?: boolean;
  onNextStep?: () => void;
}

const ColorVariantManager: React.FC<ColorVariantManagerProps> = ({
  productId,
  variants,
  onVariantsUpdate,
  showNextStepButton = false,
  onNextStep
}) => {
  const [newColorName, setNewColorName] = useState('');
  const [newStockQuantity, setNewStockQuantity] = useState('0');
  const [isAdding, setIsAdding] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editColorName, setEditColorName] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('');

  // Calculate total stock from all variants
  const totalStock = variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0);

  const updateProductTotalStock = async () => {
    try {
      // Calculate new total stock
      const { data: currentVariants, error: fetchError } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('product_id', productId);

      if (fetchError) throw fetchError;

      const newTotalStock = currentVariants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0);

      // Update product's total stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newTotalStock })
        .eq('id', productId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Failed to update product total stock:', error);
    }
  };

  const handleAddColor = async () => {
    if (!newColorName.trim()) return;

    const stockQty = parseInt(newStockQuantity) || 0;
    setIsAdding(true);
    
    try {
      // Check if there's already a default color variant for this product
      const { data: existingDefaults, error: checkError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId)
        .eq('is_default_color', true);

      if (checkError) throw checkError;

      const shouldBeDefault = existingDefaults?.length === 0;

      const { data: newVariant, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          color_name: newColorName.trim(),
          is_default_color: shouldBeDefault,
          is_active: true,
          stock_quantity: stockQty
        })
        .select()
        .single();

      if (error) throw error;

      // If this is the first variant and should be default, update the product's default_variant_id
      if (shouldBeDefault && newVariant) {
        await supabase
          .from('products')
          .update({ default_variant_id: newVariant.id })
          .eq('id', productId);
      }

      // Update product's total stock quantity
      await updateProductTotalStock();

      setNewColorName('');
      setNewStockQuantity('0');
      onVariantsUpdate();
      alert('Color variant added successfully!');
    } catch (error) {
      console.error('Failed to add color variant:', error);
      alert('Failed to add color variant');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteVariant = async (variantId: string, isDefault: boolean) => {
    if (!confirm('Are you sure you want to delete this color variant? This will also delete all associated images.')) return;

    try {
      // If deleting the default variant, we need to handle the product's default_variant_id
      if (isDefault) {
        // First, set another variant as default if available
        const otherVariants = variants.filter(v => v.id !== variantId);
        if (otherVariants.length > 0) {
          // Set the first other variant as default
          await supabase
            .from('product_variants')
            .update({ is_default_color: true })
            .eq('id', otherVariants[0].id);

          // Update product's default_variant_id
          await supabase
            .from('products')
            .update({ default_variant_id: otherVariants[0].id })
            .eq('id', productId);
        } else {
          // If no other variants, set product's default_variant_id to null
          await supabase
            .from('products')
            .update({ default_variant_id: null })
            .eq('id', productId);
        }
      }

      // Delete the variant (images will be cascade deleted due to foreign key)
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

      // Update product's total stock quantity
      await updateProductTotalStock();

      onVariantsUpdate();
    } catch (error) {
      console.error('Failed to delete variant:', error);
      alert('Failed to delete color variant');
    }
  };

  const handleSetDefaultColor = async (variantId: string) => {
    try {
      // First, set all variants to non-default
      await supabase
        .from('product_variants')
        .update({ is_default_color: false })
        .eq('product_id', productId);

      // Then set the selected variant as default
      const { error } = await supabase
        .from('product_variants')
        .update({ is_default_color: true })
        .eq('id', variantId);

      if (error) throw error;

      // Update the product's default_variant_id
      await supabase
        .from('products')
        .update({ default_variant_id: variantId })
        .eq('id', productId);

      onVariantsUpdate();
    } catch (error) {
      console.error('Failed to set default color:', error);
      alert('Failed to set default color');
    }
  };

  const handleEditColor = async (variantId: string) => {
    if (!editColorName.trim()) return;

    const stockQty = parseInt(editStockQuantity) || 0;

    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ 
          color_name: editColorName.trim(),
          stock_quantity: stockQty
        })
        .eq('id', variantId);

      if (error) throw error;

      // Update product's total stock quantity
      await updateProductTotalStock();

      setEditingVariant(null);
      setEditColorName('');
      setEditStockQuantity('');
      onVariantsUpdate();
    } catch (error) {
      console.error('Failed to update color variant:', error);
      alert('Failed to update color variant');
    }
  };

  const handleStockUpdate = async (variantId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newStock })
        .eq('id', variantId);

      if (error) throw error;

      // Update product's total stock quantity
      await updateProductTotalStock();

      onVariantsUpdate();
    } catch (error) {
      console.error('Failed to update stock quantity:', error);
      alert('Failed to update stock quantity');
    }
  };

  const toggleVariantActive = async (variantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ is_active: !currentStatus })
        .eq('id', variantId);

      if (error) throw error;

      onVariantsUpdate();
    } catch (error) {
      console.error('Failed to toggle variant status:', error);
      alert('Failed to toggle variant status');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Variants Manager
            {variants.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({variants.length} variant{variants.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          {variants.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Total Stock: {totalStock}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions for the workflow */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Step 2:</strong> Create color variants for your product. Each variant will have its own stock quantity, 
            and the total product stock will be automatically calculated from all variants.
          </p>
        </div>

        {/* Add New Color */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Add New Color Variant</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-color">Color Name</Label>
              <Input
                id="new-color"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="e.g., Brown, Black, Tan, Navy Blue"
                onKeyPress={(e) => e.key === 'Enter' && !isAdding && newColorName.trim() && handleAddColor()}
              />
            </div>
            <div>
              <Label htmlFor="new-stock">Stock Quantity</Label>
              <Input
                id="new-stock"
                type="number"
                min="0"
                value={newStockQuantity}
                onChange={(e) => setNewStockQuantity(e.target.value)}
                placeholder="0"
                onKeyPress={(e) => e.key === 'Enter' && !isAdding && newColorName.trim() && handleAddColor()}
              />
            </div>
          </div>
          <Button 
            onClick={handleAddColor} 
            disabled={isAdding || !newColorName.trim()}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Adding...' : 'Add Color Variant'}
          </Button>
        </div>

        {/* Color Variants List */}
        {variants.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <Palette className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-lg font-medium">No color variants yet</p>
            <p className="text-sm text-gray-400">Add your first color variant using the form above</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Color Variants ({variants.length})</h3>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                Combined Stock: <span className="font-semibold text-blue-600">{totalStock}</span>
              </div>
            </div>
            
            {variants.map((variant, index) => (
              <Card key={variant.id} className={`${variant.is_default_color ? 'ring-2 ring-blue-500' : 'border'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-lg font-semibold text-gray-600">#{index + 1}</div>
                      
                      {editingVariant === variant.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <Input
                              value={editColorName}
                              onChange={(e) => setEditColorName(e.target.value)}
                              placeholder="Color name"
                              onKeyPress={(e) => e.key === 'Enter' && handleEditColor(variant.id)}
                            />
                            <Input
                              type="number"
                              min="0"
                              value={editStockQuantity}
                              onChange={(e) => setEditStockQuantity(e.target.value)}
                              placeholder="Stock qty"
                              onKeyPress={(e) => e.key === 'Enter' && handleEditColor(variant.id)}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleEditColor(variant.id)}
                            disabled={!editColorName.trim()}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingVariant(null);
                              setEditColorName('');
                              setEditStockQuantity('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium text-gray-900">{variant.color_name}</h3>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingVariant(variant.id);
                                  setEditColorName(variant.color_name);
                                  setEditStockQuantity(String(variant.stock_quantity || 0));
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">Stock:</span>
                              <Input
                                type="number"
                                min="0"
                                value={variant.stock_quantity || 0}
                                onChange={(e) => handleStockUpdate(variant.id, parseInt(e.target.value) || 0)}
                                className="w-20 h-8 text-sm"
                              />
                              {variant.is_default_color && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                              {!variant.is_active && (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`active-${variant.id}`}
                          checked={variant.is_active}
                          onCheckedChange={() => toggleVariantActive(variant.id, variant.is_active)}
                        />
                        <Label htmlFor={`active-${variant.id}`} className="text-sm">
                          Active
                        </Label>
                      </div>
                      
                      {!variant.is_default_color && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefaultColor(variant.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteVariant(variant.id, variant.is_default_color)}
                        disabled={variants.length === 1}
                        title={variants.length === 1 ? "Cannot delete the last variant" : "Delete variant"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Next Step Guidance */}
        {variants.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium">
                  ✅ Great! You have {variants.length} color variant{variants.length !== 1 ? 's' : ''} with {totalStock} total stock.
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Ready to add images for each color variant?
                </p>
              </div>
              {showNextStepButton && onNextStep && (
                <Button onClick={onNextStep} className="ml-4">
                  Next: Add Images
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Helpful Tips */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>Tips:</strong>
          </p>
          <ul className="text-xs text-gray-600 mt-1 space-y-1">
            <li>• Each variant has its own stock quantity - the product's total stock is calculated automatically</li>
            <li>• You can quickly adjust stock quantities using the number inputs</li>
            <li>• The first variant you create will be set as the default automatically</li>
            <li>• Inactive variants won't be shown to customers</li>
            <li>• You'll be able to add specific images for each color in the next step</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorVariantManager;