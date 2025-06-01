
import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { Loader2, Filter } from 'lucide-react';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  // Determine brand from the current path
  const brand = window.location.pathname.includes('/bhyross/') ? 'bhyross' : 'deecodes';
  
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [priceRange, setPriceRange] = useState<string>('all');
  
  const { data: products, isLoading, error } = useProducts(
    brand as 'bhyross' | 'deecodes',
    category as 'oxford' | 'derby' | 'monk-strap' | 'loafer'
  );

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        } else {
          return product.price >= min;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchQuery, sortBy, priceRange]);

  const categoryDisplayName = category?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trust-50">
        <Navigation brand={brand} />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-professional-600" />
            <p className="text-trust-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-trust-50">
        <Navigation brand={brand} />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error loading products</p>
            <p className="text-trust-600 mt-2">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 via-white to-trust-100">
      <Navigation brand={brand} />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-trust-900 mb-2">
              {categoryDisplayName} Collection
            </h1>
            {searchQuery && (
              <p className="text-trust-600">
                Search results for "{searchQuery}" in {categoryDisplayName}
              </p>
            )}
            <p className="text-trust-600">
              {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 glass rounded-lg animate-fade-in-up animation-delay-200">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-trust-500" />
              <span className="text-sm font-medium text-trust-700">Filters:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-trust-600 whitespace-nowrap">Sort by:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-trust-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-trust-600 whitespace-nowrap">Price range:</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-40 border-trust-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-200">$0 - $200</SelectItem>
                    <SelectItem value="200-400">$200 - $400</SelectItem>
                    <SelectItem value="400-600">$400 - $600</SelectItem>
                    <SelectItem value="600">$600+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12 animate-fade-in animation-delay-400">
              <p className="text-trust-500 text-lg">
                {searchQuery ? `No products found for "${searchQuery}"` : 'No products found in this category'}
              </p>
              <p className="text-trust-400 mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product, index) => (
                <Card key={product.id} className={`group overflow-hidden card-hover shine-effect bg-white border-trust-200 stagger-item stagger-${Math.min(index + 1, 6)}`}>
                  <Link to={`/${brand}/${category}/${product.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-trust-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-trust-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xl font-bold ${brand === 'bhyross' ? 'text-bhyross-600' : 'text-deecodes-600'}`}>
                          ${product.price}
                        </span>
                        <Button 
                          size="sm" 
                          className={`btn-professional ${brand === 'bhyross' ? 'bg-bhyross-600 hover:bg-bhyross-700' : 'bg-deecodes-600 hover:bg-deecodes-700'} text-white`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
