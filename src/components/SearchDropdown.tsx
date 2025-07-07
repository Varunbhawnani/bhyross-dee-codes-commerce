import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchDropdownProps {
  brand?: 'bhyross' | 'deecodes';
  onSelect?: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ brand, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Get products from all categories
  const { data: oxfordProducts } = useProducts(brand, 'oxford');
  const { data: derbyProducts } = useProducts(brand, 'derby');
  const { data: monkStrapProducts } = useProducts(brand, 'monk-strap');
  const { data: loaferProducts } = useProducts(brand, 'loafer');

  // Combine all products
  const allProducts = useMemo(() => {
    return [
      ...(oxfordProducts || []),
      ...(derbyProducts || []),
      ...(monkStrapProducts || []),
      ...(loaferProducts || [])
    ];
  }, [oxfordProducts, derbyProducts, monkStrapProducts, loaferProducts]);

  // Filter products based on search query with improved relevance scoring
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    
    // Category mapping for better search
    const categoryMap = {
      'oxford': ['oxford', 'oxfords'],
      'derby': ['derby', 'derbys', 'derbies'],
      'monk-strap': ['monk', 'monk-strap', 'monk strap', 'strap', 'buckle'],
      'loafer': ['loafer', 'loafers', 'slip-on', 'slip on']
    };
    
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
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Search className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 sm:w-96 p-0 max-w-[calc(100vw-2rem)]" 
        align="end"
        side="bottom"
        sideOffset={5}
      >
        <Command>
          <CommandInput
            placeholder="Search products or categories..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyPress={handleKeyPress}
            className="text-sm"
          />
          <CommandList className="max-h-96 overflow-y-auto">
            {searchQuery.trim() && filteredProducts.length === 0 && (
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">No products found</p>
                  <Button size="sm" onClick={handleSearch} className="text-xs sm:text-sm">
                    Search for "{searchQuery}"
                  </Button>
                </div>
              </CommandEmpty>
            )}
            {filteredProducts.length > 0 && (
              <CommandGroup heading="Products">
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleProductSelect(product)}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {product.product_images?.[0] && (
                        <img
                          src={product.product_images[0].image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.category.replace('-', ' ')}</p>
                      <p className="text-xs font-medium">₹{product.price.toLocaleString()}</p>
                    </div>
                  </CommandItem>
                ))}
                {searchQuery.trim() && (
                  <CommandItem 
                    onSelect={handleSearch} 
                    className="p-2 sm:p-3 border-t hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Search for "{searchQuery}"</span>
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