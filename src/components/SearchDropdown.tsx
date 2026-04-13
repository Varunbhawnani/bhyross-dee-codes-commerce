import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface SearchDropdownProps {
  brand?: 'bhyross' | 'deecodes';
  onSelect?: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ brand, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Get products from all categories
  const { data: categoriesData } = useCategories(brand);
  const { data: allProducts } = useProducts(brand);

 

  // Filter products based on search query with improved relevance scoring
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    // Category mapping for better search
    // Dynamic category mapping for better search
    const categoryMap = categoriesData?.reduce((acc, cat) => {
      // Create variations of the category name for better search
      const variations = [
        cat.path,
        cat.name.toLowerCase(),
        cat.name.toLowerCase() + 's',
        ...cat.path.split('-')
      ];
      acc[cat.path] = variations;
      return acc;
    }, {} as Record<string, string[]>) || {};
    
    // Score products based on relevance
    const scoredProducts = allProducts.map(product => {
      const name = product.name.toLowerCase();
      const description = product.description?.toLowerCase() || '';
      const category = product.category.toLowerCase();
      const categoryDisplayName = category.replace('-', ' ');
      
      let score = 0;
      
      // PRIORITY: Direct name matching (most important)
      if (name === query) {
        score += 200; // Exact match gets highest priority
      }
      else if (name.startsWith(query)) {
        score += 100;
      }
      else if (name.includes(' ' + query) || name.includes('-' + query)) {
        score += 80;
      }
      else if (name.includes(query)) {
        score += 60;
      }
      
      // Category-based scoring
      const categoryKeywords = categoryMap[product.category as keyof typeof categoryMap] || [];
      const categoryMatch = categoryKeywords.some(keyword => 
        query.includes(keyword) || keyword.includes(query)
      );
      
      if (categoryMatch) {
        score += 40; // Base score for category match
      }
      
      // Description-based scoring
      if (description.includes(query)) {
        score += 30;
      }
      
      // Category display name scoring
      if (categoryDisplayName.includes(query)) {
        score += 50;
      }
      
      // Multi-word search support
      const queryWords = query.split(' ').filter(word => word.length > 1);
      if (queryWords.length > 1) {
        const matchingWords = queryWords.filter(word => 
          name.includes(word) || description.includes(word) || categoryDisplayName.includes(word)
        );
        score += matchingWords.length * 20;
      }
      
      // FALLBACK: Ensure ANY product with the query in name gets at least some score
      if (score === 0 && name.includes(query) && query.length >= 1) {
        score = 30; // Increased from 25 and lowered length requirement
      }
      
      // Boost score for shorter names (more relevant) - only if there's already a match
      if (score > 0) {
        score += Math.max(0, 20 - name.length);
      }
      
      return { product, score };
    }).filter(item => item.score > 0);
    
    // Debug logging (remove this in production)
    console.log('Search query:', query);
    console.log('All products count:', allProducts.length);
    console.log('Scored products:', scoredProducts.length);
    if (scoredProducts.length > 0) {
      console.log('Top scored products:', scoredProducts.slice(0, 3).map(p => ({ name: p.product.name, score: p.score })));
    }
    
    // Sort by score (highest first) and return ALL matching products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  }, [allProducts, searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const brandPath = brand || 'bhyross';
      navigate(`/${brandPath}/oxford?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setOpen(false);
      onSelect?.();
    }
  };

  const handleProductSelect = (product: any) => {
    const brandPath = brand || 'bhyross';
    navigate(`/${brandPath}/${product.category}/${product.id}`);
    setSearchQuery('');
    setOpen(false);
    onSelect?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="h-8 w-8 p-1 md:h-auto md:w-auto md:p-2">
          <Search className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 p-0 mx-4 sm:mx-2 md:mx-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <Command>
          <CommandInput
            placeholder="Search products or categories..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyPress={handleKeyPress}
            className="text-sm h-12 border-0 focus:ring-0 px-4"
          />
          <CommandList className="max-h-[60vh] sm:max-h-80 md:max-h-96 overflow-y-auto border-t">
            {searchQuery.trim() && filteredProducts.length === 0 && (
              <CommandEmpty>
                <div className="p-4 sm:p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">No products found</p>
                  <Button size="sm" onClick={handleSearch} className="text-sm px-4 py-2 h-9">
                    Search for "{searchQuery}"
                  </Button>
                </div>
              </CommandEmpty>
            )}
            {filteredProducts.length > 0 && (
              <CommandGroup heading="Products" className="px-2 py-2">
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleProductSelect(product)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 min-h-[70px] rounded-md mx-1 my-1"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
  {product.product_variants?.[0]?.product_images?.[0] && (
    <img
      src={product.product_variants[0].product_images[0].image_url}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  )}
</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight mb-1 line-clamp-1 text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize mb-1">{product.category.replace('-', ' ')}</p>
                      <p className="text-sm font-semibold text-gray-900">₹{product.price.toLocaleString()}</p>
                    </div>
                  </CommandItem>
                ))}
                {searchQuery.trim() && (
                  <CommandItem 
                    onSelect={handleSearch} 
                    className="p-3 border-t hover:bg-gray-50 min-h-[50px] mx-1 mt-2 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Search for "{searchQuery}"</span>
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchDropdown;