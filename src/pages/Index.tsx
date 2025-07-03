import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useBannerImages } from '@/hooks/useBannerImages';
import BannerCarousel from '@/components/BannerCarousel';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Grid3X3, Grid2X2, LayoutGrid, ShoppingBag, Star, Palette, Package, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const Index: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedSortBy, setSelectedSortBy] = useState<string>('newest');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [gridColumns, setGridColumns] = useState<number>(3);
  const [showFilters, setShowFilters] = useState<boolean>(false);

   const { data: banners, isLoading: bannersLoading } = useBannerImages('home');
  
  const { data: bhyrossProducts } = useProducts('bhyross');
  const { data: deecodesProducts } = useProducts('deecodes');
  const { data: imcolusProducts } = useProducts('imcolus');

  const brands = [
    { value: 'all', label: 'All Brands' },
    { value: 'imcolus', label: 'Imcolus' },
    { value: 'bhyross', label: 'Bhyross' },
    { value: 'deecodes', label: 'Dee Codes' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'oxford', label: 'Oxford' },
    { value: 'derby', label: 'Derby' },
    { value: 'monk-strap', label: 'Monk Strap' },
    { value: 'loafer', label: 'Loafer' },
    { value: 'brogue', label: 'Brogue' },
    { value: 'chelsea-boot', label: 'Chelsea Boot' },
    { value: 'dress-boot', label: 'Dress Boot' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-2500', label: 'Under ₹2,500' },
    { value: '2500-5000', label: '₹2,500 - ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000-20000', label: '₹10,000 - ₹20,000' },
    { value: '20000-50000', label: '₹20,000 - ₹50,000' },
    { value: '50000+', label: 'Above ₹50,000' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'name-za', label: 'Name: Z to A' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'discount', label: 'Biggest Discount' }
  ];

  const colors = [
    { value: 'all', label: 'All Colors' },
    { value: 'black', label: 'Black' },
    { value: 'brown', label: 'Brown' },
    { value: 'tan', label: 'Tan' },
    { value: 'burgundy', label: 'Burgundy' },
    { value: 'navy', label: 'Navy' },
    { value: 'cognac', label: 'Cognac' },
    { value: 'oxblood', label: 'Oxblood' }
  ];

  const sizes = [
    { value: 'all', label: 'All Sizes' },
    { value: '6', label: 'UK 6' },
    { value: '7', label: 'UK 7' },
    { value: '8', label: 'UK 8' },
    { value: '9', label: 'UK 9' },
    { value: '10', label: 'UK 10' },
    { value: '11', label: 'UK 11' },
    { value: '12', label: 'UK 12' }
  ];

  const ratings = [
    { value: 'all', label: 'All Ratings' },
    { value: '4+', label: '4+ Stars' },
    { value: '3+', label: '3+ Stars' },
    { value: '2+', label: '2+ Stars' },
    { value: '1+', label: '1+ Stars' }
  ];

  // Combine all products
  const allProducts = [
    ...(bhyrossProducts || []),
    ...(deecodesProducts || []),
    ...(imcolusProducts || [])
  ];

  // Filter products based on all selected filters
  const filteredProducts = allProducts.filter(product => {
    const brandMatch = selectedBrand === 'all' || product.brand === selectedBrand;
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    let priceMatch = true;
    if (selectedPriceRange !== 'all') {
      const price = product.price;
      switch (selectedPriceRange) {
        case '0-2500':
          priceMatch = price < 2500;
          break;
        case '2500-5000':
          priceMatch = price >= 2500 && price < 5000;
          break;
        case '5000-10000':
          priceMatch = price >= 5000 && price < 10000;
          break;
        case '10000-20000':
          priceMatch = price >= 10000 && price < 20000;
          break;
        case '20000-50000':
          priceMatch = price >= 20000 && price < 50000;
          break;
        case '50000+':
          priceMatch = price >= 50000;
          break;
      }
    }
    
    // Additional filters (mock implementation for now)
    const colorMatch = selectedColor === 'all' || true; // Would check product.color
    const sizeMatch = selectedSize === 'all' || true; // Would check product.available_sizes
    const ratingMatch = selectedRating === 'all' || true; // Would check product.rating
    
    return brandMatch && categoryMatch && priceMatch && colorMatch && sizeMatch && ratingMatch;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name-az':
        return a.name.localeCompare(b.name);
      case 'name-za':
        return b.name.localeCompare(a.name);
      case 'popularity':
        return 0; // Would sort by view count or sales
      case 'rating':
        return 0; // Would sort by average rating
      case 'discount':
        return 0; // Would sort by discount percentage
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'bhyross': return 'text-bhyross-500';
      case 'deecodes': return 'text-deecodes-500';
      case 'imcolus': return 'text-blue-600';
      default: return 'text-neutral-600';
    }
  };

  const getBrandAccent = (brand: string) => {
    switch (brand) {
      case 'bhyross': return 'border-bhyross-500';
      case 'deecodes': return 'border-deecodes-500';
      case 'imcolus': return 'border-blue-600';
      default: return 'border-neutral-300';
    }
  };

  const getGridClasses = () => {
    switch (gridColumns) {
      case 2: return 'grid-cols-2 md:grid-cols-2';
      case 3: return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const resetFilters = () => {
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setSelectedRating('all');
    setSelectedSortBy('newest');
  };

  const hasActiveFilters = selectedBrand !== 'all' || selectedCategory !== 'all' || selectedPriceRange !== 'all' || 
    selectedColor !== 'all' || selectedSize !== 'all' || selectedRating !== 'all' || selectedSortBy !== 'newest';

    if (bannersLoading ) {
        return (
          <div className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-16 flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neutral-900 mx-auto"></div>
                <p className="mt-4 text-neutral-600" style={{ fontFamily: 'Signika' }}>Loading Dee Codes Collection...</p>
              </div>
            </div>
            <Footer brand="deecodes" />
          </div>
        );
      }

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
        <Navigation />
      </div>
      <main className="pt-16">
      <BannerCarousel brand="collections" />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-1 py-1">
          
        </div>

        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full flex items-center justify-between p-4 bg-white border-gray-300"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>
              {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden mb-6 bg-white shadow-lg rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-900 rounded-lg">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>
                <p className="text-sm text-gray-500">Refine your search results</p>
              </div>

              <div className="p-4 space-y-4">
                {/* Brand Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Package className="h-4 w-4" />
                    Brand
                  </label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Grid3X3 className="h-4 w-4" />
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <TrendingUp className="h-4 w-4" />
                    Price Range
                  </label>
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Palette className="h-4 w-4" />
                    Color
                  </label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Grid2X2 className="h-4 w-4" />
                    Size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Star className="h-4 w-4" />
                    Rating
                  </label>
                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.value} value={rating.value}>
                          {rating.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Count */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-bold text-blue-700">{sortedProducts.length}</span> 
                    <span className="text-gray-500"> of </span>
                    <span className="font-semibold text-gray-700">{allProducts.length}</span>
                    <span className="text-gray-500"> products</span>
                  </p>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="w-full border-gray-300 hover:bg-gray-50"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Left Sidebar - Filters */}
            <div className="hidden lg:block w-80 bg-white shadow-lg rounded-lg border border-gray-200 h-fit sticky top-24">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-900 rounded-lg">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>
                <p className="text-sm text-gray-500">Refine your search results</p>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Brand Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Package className="h-4 w-4" />
                    Brand
                  </label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Grid3X3 className="h-4 w-4" />
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <TrendingUp className="h-4 w-4" />
                    Price Range
                  </label>
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Palette className="h-4 w-4" />
                    Color
                  </label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Grid2X2 className="h-4 w-4" />
                    Size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Star className="h-4 w-4" />
                    Rating
                  </label>
                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.value} value={rating.value}>
                          {rating.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Count */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-bold text-blue-700">{sortedProducts.length}</span> 
                    <span className="text-gray-500"> of </span>
                    <span className="font-semibold text-gray-700">{allProducts.length}</span>
                    <span className="text-gray-500"> products</span>
                  </p>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="w-full border-gray-300 hover:bg-gray-50"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 lg:flex-1 w-full">
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Sort By:</span>
                  </div>
                  <Select value={selectedSortBy} onValueChange={setSelectedSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort products" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">Grid View:</span>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <button
                      onClick={() => setGridColumns(2)}
                      className={`p-2 rounded-md transition-colors ${
                        gridColumns === 2 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                      title="2 columns"
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridColumns(3)}
                      className={`p-2 rounded-md transition-colors ${
                        gridColumns === 3 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                      title="3 columns"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridColumns(4)}
                      className={`p-2 rounded-md transition-colors ${
                        gridColumns === 4 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                      title="4 columns"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {sortedProducts.length > 0 ? (
                <div className={`grid ${getGridClasses()} gap-4 md:gap-6`}>
                  {sortedProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="group cursor-pointer bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                    >
                      <div className="relative overflow-hidden rounded-t-lg bg-gray-50 aspect-square">
                        <ProductImageGallery
                          images={product.product_images.map(img => img.image_url)}
                          productName={product.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm ${getBrandColor(product.brand)} capitalize border ${getBrandAccent(product.brand)}`}>
                            {product.brand}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 md:p-4">
                        <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base line-clamp-2">{product.name}</h3>
                        <p className="text-neutral-600 text-xs md:text-sm mb-2 capitalize">{product.category.replace('-', ' ')}</p>
                        <p className={`font-bold text-base md:text-lg ${getBrandColor(product.brand)} mb-3`}>
                          ₹{product.price.toLocaleString()}
                        </p>
                        <Button 
                          className="w-full bg-black text-white hover:bg-gray-800 text-sm md:text-base py-2"
                          onClick={() => window.location.href = `/${product.brand}/${product.category}/${product.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border">
                  <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters to see more results.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </main>

      <Footer brand="bhyross" />
    </div>
  );
};

export default Index;