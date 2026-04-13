import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X, Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  path: string;
  description: string | null;
  brand: string | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const CategoryManagementTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    description: '',
    brand: 'all' as 'all' | 'bhyross' | 'deecodes' | 'imcolus',
    image_url: ''
  });

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from('categories')
        .insert([{
          name: data.name,
          path: data.path,
          description: data.description || null,
          brand: data.brand === 'all' ? null : data.brand,
          image_url: data.image_url || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category created successfully"
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { data: result, error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          path: data.path,
          description: data.description || null,
          brand: data.brand === 'all' ? null : data.brand,
          image_url: data.image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update category: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      path: '',
      description: '',
      brand: 'all',
      image_url: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      path: category.path,
      description: category.description || '',
      brand: (category.brand as any) || 'all',
      image_url: category.image_url || ''
    });
    setIsAdding(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.path) {
      toast({
        title: "Error",
        description: "Name and path are required",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      updateCategory.mutate({ id: editingId, data: formData });
    } else {
      createCategory.mutate(formData);
    }
  };

  const handlePathChange = (name: string) => {
    const path = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, name, path }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Category Management</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage shoe categories for your products
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Category' : 'Add New Category'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update category details' : 'Create a new category for products'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handlePathChange(e.target.value)}
                    placeholder="e.g., Oxford, Derby, Loafer"
                  />
                </div>
                <div>
                  <Label htmlFor="path">URL Path *</Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="e.g., oxford, derby, loafer"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Auto-generated from name</p>
                </div>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select 
                  value={formData.brand} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, brand: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    <SelectItem value="bhyross">Bhyross</SelectItem>
                    <SelectItem value="deecodes">Dee Codes</SelectItem>
                    <SelectItem value="imcolus">Imcolus</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500 mt-1">Leave as "All Brands" for universal categories</p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Category Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/category-image.jpg"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  {(createCategory.isPending || updateCategory.isPending) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag className="h-5 w-5 text-neutral-600" />
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {category.name}
                      </h3>
                      {category.brand && (
                        <Badge variant="secondary" className="capitalize">
                          {category.brand}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p><span className="font-medium">Path:</span> /{category.path}</p>
                      {category.description && (
                        <p className="text-neutral-500">{category.description}</p>
                      )}
                      <p className="text-xs text-neutral-400">
                        Created: {new Date(category.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this category?')) {
                          deleteCategory.mutate(category.id);
                        }
                      }}
                      disabled={deleteCategory.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No categories yet</h3>
              <p className="text-neutral-600 mb-4">
                Create your first category to organize your products
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryManagementTab;