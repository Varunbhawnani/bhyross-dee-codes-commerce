
import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Filter } from 'lucide-react';

// Helper function to get primary image or first image for a product
const getPrimaryImage = (product: any): string => {
  if (!product.product_images || product.product_images.length === 0) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'; // fallback
  }
  
  const primaryImage = product.product_images.find((img: any) => img.is_primary);
  if (primaryImage) return primaryImage.image_url;
  
  // Images are already sorted by the hook (primary first, then by sort_order)
  return product.product_images[0]?.image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  // Determine brand from the current path
  const brand = window.location.pathname.includes('/bhyross/') ? 'bhyross' : 'deecodes';
  
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [priceRange, setPriceRange] = useState<string>('all');
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Get products from all categories for search, or specific category when not searching
  const { data: oxfordProducts } = useProducts(brand as 'bhyross' | 'deecodes', 'oxford');
  const { data: derbyProducts } = useProducts(brand as 'bhyross' | 'deecodes', 'derby');
  const { data: monkStrapProducts } = useProducts(brand as 'bhyross' | 'deecodes', 'monk-strap');
  const { data: loaferProducts } = useProducts(brand as 'bhyross' | 'deecodes', 'loafer');
  
  // Get category specific products
  const { data: categoryProducts, isLoading, error } = useProducts(
    brand as 'bhyross' | 'deecodes',
    category as 'oxford' | 'derby' | 'monk-strap' | 'loafer'
  );

  // Combine all products for search or use category specific products
  const allProducts = searchQuery 
    ? [...(oxfordProducts || []), ...(derbyProducts || []), ...(monkStrapProducts || []), ...(loaferProducts || [])]
    : categoryProducts || [];

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts;

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
  }, [allProducts, searchQuery, sortBy, priceRange]);

  const categoryDisplayName = category?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || '';

  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product.id,
      size: product.sizes[0] || 9, // Default to first available size or 9
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand={brand} />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand={brand} />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error loading products</p>
            <p className="text-gray-600 mt-2">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand={brand} />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Search Results' : `${categoryDisplayName} Collection`}
            </h1>
            {searchQuery && (
              <p className="text-gray-600">
                Search results for "{searchQuery}" across all collections
              </p>
            )}
            <p className="text-gray-600">
              {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
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
                <label className="text-sm text-gray-600 whitespace-nowrap">Price range:</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-5000">₹0 - ₹5,000</SelectItem>
                    <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                    <SelectItem value="10000-20000">₹10,000 - ₹20,000</SelectItem>
                    <SelectItem value="20000">₹20,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery ? `No products found for "${searchQuery}"` : 'No products found in this category'}
              </p>
              <p className="text-gray-400 mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getPrimaryImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xl font-bold ${brand === 'bhyross' ? 'text-bhyross-600' : 'text-deecodes-600'}`}>
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/${brand}/${category}/${product.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        className={`w-full ${brand === 'bhyross' ? 'bg-bhyross-600 hover:bg-bhyross-700' : 'bg-deecodes-600 hover:bg-deecodes-700'} text-white`}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                      >
                        {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
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
