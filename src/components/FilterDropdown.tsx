
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

interface FilterDropdownProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
}) => {
  const [open, setOpen] = useState(false);

  const clearFilters = () => {
    setSortBy('name-asc');
    setPriceRange('all');
  };

  const hasActiveFilters = sortBy !== 'name-asc' || priceRange !== 'all';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
              {(sortBy !== 'name-asc' ? 1 : 0) + (priceRange !== 'all' ? 1 : 0)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Sort by
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Price Range
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
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

          <Button 
            className="w-full" 
            onClick={() => setOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterDropdown;
