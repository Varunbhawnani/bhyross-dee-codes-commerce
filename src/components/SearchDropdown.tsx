
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

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // Limit to 5 results
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
      <PopoverContent className="w-80 p-0" align="end">
        <Command>
          <CommandInput
            placeholder="Search products..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyPress={handleKeyPress}
          />
          <CommandList>
            {searchQuery.trim() && filteredProducts.length === 0 && (
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">No products found</p>
                  <Button size="sm" onClick={handleSearch}>
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
                    className="flex items-center gap-3 p-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {product.product_images?.[0] && (
                        <img
                          src={product.product_images[0].image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.category.replace('-', ' ')}</p>
                      <p className="text-xs font-medium">₹{product.price.toLocaleString()}</p>
                    </div>
                  </CommandItem>
                ))}
                {searchQuery.trim() && (
                  <CommandItem onSelect={handleSearch} className="p-3 border-t">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <span>Search for "{searchQuery}"</span>
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
