import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useBannerImages } from '@/hooks/useBannerImages';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid3x3, Grid2x2, LayoutGrid, ArrowUpDown, Star, Award, Sparkles } from 'lucide-react';

const DeeCodesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [gridSize, setGridSize] = useState<string>('3');
  const [touchedCard, setTouchedCard] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [selectedColor, setSelectedColor] = useState<string>('all');
const [selectedSize, setSelectedSize] = useState<string>('all');
  const { data: banners, isLoading: bannersLoading } = useBannerImages('deecodes');
  const { data: products, isLoading: productsLoading } = useProducts('deecodes');

  const { data: categoriesData } = useCategories('deecodes');

  const categories = [
    { value: 'all', label: 'All Categories' },
    ...(categoriesData?.map(cat => ({
      value: cat.path,
      label: cat.name
    })) || [])
  ];

  const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: '0-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500 - ₹1,000' },
  { value: '1000-1500', label: '₹1,000 - ₹1,500' }, 
  { value: '1500-2000', label: '₹1,500 - ₹2,000' },
  { value: '2000-2500', label: '₹2,000 - ₹2,500' },
  { value: '2500-3000', label: '₹2,500 - ₹3,000' },
  { value: '3000+', label: 'Above ₹3,000' }
];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'newest', label: 'Newest First' }
  ];

  const gridOptions = [
    { value: '2', icon: Grid2x2, label: '2 columns' },
    { value: '3', icon: Grid3x3, label: '3 columns' },
    { value: '4', icon: LayoutGrid, label: '4 columns' }
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

// Get unique colors from products dynamically
const getAvailableColors = () => {
  const uniqueColors = new Set<string>();
  
  if (products && Array.isArray(products)) {
    products.forEach(product => {
      product.product_variants?.forEach(variant => {
        if (variant.color_name) {
          uniqueColors.add(variant.color_name.toLowerCase());
        }
      });
    });
  }
  
  return [
    { value: 'all', label: 'All Colors' },
    ...Array.from(uniqueColors).sort().map(color => ({
      value: color,
      label: color.charAt(0).toUpperCase() + color.slice(1)
    }))
  ];
};

const colors = getAvailableColors();

  const filterProducts = () => {
  if (!products || !Array.isArray(products)) return [];
  
  let filtered = products.filter(product => {
    if (!product) return false;
    
    // Category filter
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Color filter
    const colorMatch = selectedColor === 'all' || 
      (product.product_variants && product.product_variants.some(variant => 
        variant.color_name?.toLowerCase().includes(selectedColor.toLowerCase())
      ));
    
    // Size filter
    const sizeMatch = selectedSize === 'all' || 
      (product.sizes && product.sizes.includes(parseInt(selectedSize)));
    
    return categoryMatch && colorMatch && sizeMatch;
  });

  // Price filtering
  if (priceRange !== 'all') {
    filtered = filtered.filter(product => {
      if (!product || typeof product.price !== 'number') return false;
      const price = product.price;
      
      switch (priceRange) {
        case '0-500':
          return price < 500;
        case '500-1000':
          return price >= 500 && price < 1000;
        case '1000-1500':
          return price >= 1000 && price < 1500;
        case '1500-2000':
          return price >= 1500 && price < 2000;
        case '2000-2500':
          return price >= 2000 && price < 2500;
        case '2500-3000':
          return price >= 2500 && price < 3000;
        case '3000+':
          return price >= 3000;
        default:
          return true;
      }
    });
  }

  // Sorting
  switch (sortBy) {
    case 'price-low':
      filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0));
      break;
    case 'price-high':
      filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0));
      break;
    case 'name-az':
      filtered.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b?.created_at || '').getTime() - new Date(a?.created_at || '').getTime());
      break;
    default:
      // Featured - keep original order
      break;
  }

  return filtered;
};

const resetFilters = () => {
  setSelectedCategory('all');
  setPriceRange('all');
  setSortBy('featured');
  setSelectedColor('all');
  setSelectedSize('all');
};

const hasActiveFilters = selectedCategory !== 'all' || priceRange !== 'all' || 
  sortBy !== 'featured' || selectedColor !== 'all' || selectedSize !== 'all';
  
  const filteredProducts = filterProducts();

  const getGridClasses = () => {
    switch (gridSize) {
      case '2': return 'grid-cols-2 lg:grid-cols-2';
      case '3': return 'grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const handleCardClick = (product: any) => {
    window.location.href = `/deecodes/${product.category}/${product.id}`;
  };

  const handleCardTouch = (productId: string) => {
    setTouchedCard(productId);
    setTimeout(() => setTouchedCard(null), 200);
  };

  const handleSwipe = (productId: string, direction: 'left' | 'right', imageCount: number) => {
    const currentIndex = currentImageIndex[productId] || 0;
    let newIndex;
    
    if (direction === 'right') { // Swipe right = next image
      newIndex = currentIndex === imageCount - 1 ? 0 : currentIndex + 1;
    } else { // Swipe left = previous image
      newIndex = currentIndex === 0 ? imageCount - 1 : currentIndex - 1;
    }
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: newIndex
    }));
  };

  const getCurrentImage = (product: any) => {
  const index = currentImageIndex[product.id] || 0;
  const allImages = product.product_variants.flatMap(variant => variant.product_images || []);
  return allImages[index]?.image_url || allImages[0]?.image_url || '';
};
  if (bannersLoading || productsLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navigation />
      
      <main className="pt-16">
        {/* Banner Carousel */}
        <BannerCarousel brand="deecodes" />

        {/* Brand Header */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6" style={{ fontFamily: 'Cornerstone', color: '#5A6F8D' }}>
              Dee Codes
            </h1>
            <div className="w-16 lg:w-24 h-0.5 mx-auto mb-4 lg:mb-6" style={{ backgroundColor: '#5A6F8D', opacity: 0.3 }}></div>
            <p className="text-sm md:text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto px-2" style={{ fontFamily: 'Signika' }}>
              Contemporary design with a digital edge. Explore our modern collection that bridges 
              the gap between technology and craftsmanship for the next generation.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-12">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
                <div className="space-y-6 pr-2">
                  {/* Filter Header */}
                  <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Filter className="h-5 w-5 text-neutral-600" />
                      <h3 className="text-lg font-semibold text-neutral-800" style={{ fontFamily: 'Cornerstone' }}>Filters</h3>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
                        Price Range
                      </label>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger className="w-full" style={{ fontFamily: 'Signika' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priceRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value} style={{ fontFamily: 'Signika' }}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sizes Filter */}
                    {/* Sizes Filter */}
<div className="mb-6">
  <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
    Sizes
  </label>
  <Select value={selectedSize} onValueChange={setSelectedSize}>
    <SelectTrigger className="w-full" style={{ fontFamily: 'Signika' }}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {sizes.map((size) => (
        <SelectItem key={size.value} value={size.value} style={{ fontFamily: 'Signika' }}>
          {size.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

                    {/* Colors Filter */}
                    {/* Colors Filter */}
<div className="mb-6">
  <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
    Colors
  </label>
  <Select value={selectedColor} onValueChange={setSelectedColor}>
    <SelectTrigger className="w-full" style={{ fontFamily: 'Signika' }}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {colors.map((color) => (
        <SelectItem key={color.value} value={color.value} style={{ fontFamily: 'Signika' }}>
          {color.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
                        Category
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full" style={{ fontFamily: 'Signika' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value} style={{ fontFamily: 'Signika' }}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full" style={{ fontFamily: 'Signika' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} style={{ fontFamily: 'Signika' }}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Results Count */}
<div className="mt-6 bg-gradient-to-r from-neutral-50 to-neutral-100 p-4 rounded-lg border border-neutral-200">
  <p className="text-sm text-neutral-600 text-center">
    <span className="font-bold" style={{ color: '#5A6F8D' }}>{filteredProducts.length}</span> 
    <span className="text-neutral-500"> of </span>
    <span className="font-semibold text-neutral-700">{products?.length || 0}</span>
    <span className="text-neutral-500"> products</span>
  </p>
</div>

{/* Clear Filters */}
{hasActiveFilters && (
  <Button 
    variant="outline" 
    onClick={resetFilters}
    className="w-full mt-4 border-neutral-300 hover:bg-neutral-50 uppercase tracking-wider text-sm"
    style={{ fontFamily: 'Argent CF' }}
  >
    Clear All Filters
  </Button>
)}

                  

                  {/* Spacer for scroll */}
                  <div className="h-4"></div>
                </div>
              </div>
            </div>

            {/* Right Content - Products */}
            <div className="flex-1">
              {/* Mobile Filters & Controls */}
              <div className="lg:hidden mb-4">
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
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
              </div>

              {/* Results Header */}
              <div className="flex items-center justify-between mb-4 lg:mb-8">
                <div className="flex items-center gap-2 lg:gap-4">
                  <h2 className="text-lg lg:text-2xl text-neutral-800" style={{ fontFamily: 'Cornerstone' }}>
                    {selectedCategory === 'all' ? 'Complete Collection' : 
                     categories.find(c => c.value === selectedCategory)?.label}
                  </h2>
                  <Badge variant="secondary" className="text-xs border" style={{ fontFamily: 'Argent CF', borderColor: '#5A6F8D', color: '#5A6F8D', backgroundColor: 'transparent' }}>
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Style' : 'Styles'}
                  </Badge>
                </div>

                {/* Grid Size Controls */}
                <div className="hidden lg:flex items-center gap-2 bg-white border rounded-lg p-1 shadow-sm">
                  {gridOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGridSize(option.value)}
                      className={`p-2 rounded transition-colors ${
                        gridSize === option.value 
                          ? 'text-white' 
                          : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                      style={{ 
                        backgroundColor: gridSize === option.value ? '#5A6F8D' : 'transparent'
                      }}
                      title={option.label}
                    >
                      <option.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className={`grid ${getGridClasses()} gap-3 lg:gap-6`}>
                  {filteredProducts.map((product, index) => (
                    <div 
  key={product.id} 
  className={`group cursor-pointer bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-neutral-300 lg:cursor-default ${
    touchedCard === product.id ? 'scale-95 shadow-sm' : ''
  }`}
  onClick={() => window.innerWidth < 1024 && handleCardClick(product)}
  onTouchStart={() => handleCardTouch(product.id)}
>
                      <div className="relative overflow-hidden bg-neutral-50 aspect-square">
                        {/* Desktop Version - with ProductImageGallery */}
                        {/* Desktop Version - with arrow controls */}
<div className="hidden lg:block relative">
  <img 
    src={getCurrentImage(product)} 
    alt={product.name}
    className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500 ease-out"
    loading="lazy"
    decoding="async"
  />
  
  {product.product_variants.flatMap(v => v.product_images || []).length > 1 && (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const allImages = product.product_variants.flatMap(v => v.product_images || []);
          const currentIndex = currentImageIndex[product.id] || 0;
          const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
          setCurrentImageIndex(prev => ({
            ...prev,
            [product.id]: newIndex
          }));
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          const allImages = product.product_variants.flatMap(v => v.product_images || []);
          const currentIndex = currentImageIndex[product.id] || 0;
          const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
          setCurrentImageIndex(prev => ({
            ...prev,
            [product.id]: newIndex
          }));
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {product.product_variants.flatMap(v => v.product_images || []).map((_, imgIndex) => (
          <div
            key={imgIndex}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              imgIndex === (currentImageIndex[product.id] || 0) 
                ? 'bg-white' 
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </>
  )}
  
  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
</div>
                        
                        {/* Mobile Version - simple image with swipe functionality */}
                        {/* Mobile Version - static image only */}
<div className="lg:hidden relative">
  <img 
    src={getCurrentImage(product)} 
    alt={product.name}
    className="object-cover w-full h-full transition-all duration-300"
    loading="lazy"
    decoding="async"
  />
  {/* Mobile interactive overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</div>
                      </div>
                      
                      {/* Visual separator */}
                      <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent lg:hidden"></div>
                      
                     <div className="p-3 md:p-4">
  <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base line-clamp-2">{product.name}</h3>
  <p className="text-neutral-600 text-xs md:text-sm mb-2 capitalize">{product.category.replace('-', ' ')}</p>
  <p className="font-bold text-base md:text-lg mb-3" style={{ color: '#5A6F8D' }}>
    ₹{product.price.toLocaleString()}
  </p>
  <Button 
    className="w-full bg-black text-white hover:bg-gray-800 text-sm md:text-base py-2 lg:block hidden"
    onClick={() => handleCardClick(product)}
  >
    View Details
  </Button>
</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 lg:py-20 bg-white border border-neutral-200 rounded-lg">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                    <Filter className="h-8 w-8 lg:h-12 lg:w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-neutral-800 mb-2" style={{ fontFamily: 'Cornerstone' }}>No Styles Found</h3>
                  <p className="text-sm lg:text-base text-neutral-600 mb-4 lg:mb-6 px-4" style={{ fontFamily: 'Signika' }}>
                    {selectedCategory === 'all' 
                      ? 'No products available at the moment.' 
                      : `No styles found matching your current filters.`
                    }
                  </p>
                  <Button 
  variant="outline" 
  onClick={resetFilters}
  className="uppercase tracking-wider border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 text-sm"
  style={{ fontFamily: 'Argent CF' }}
>
  Clear Filters
</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer brand="deecodes" />
    </div>
  );
};

export default DeeCodesPage;