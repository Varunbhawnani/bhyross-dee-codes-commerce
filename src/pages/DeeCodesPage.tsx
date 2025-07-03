import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useBannerImages } from '@/hooks/useBannerImages';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid3x3, Grid2x2, LayoutGrid, Star, Sparkles } from 'lucide-react';

const DeeCodesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [gridSize, setGridSize] = useState<string>('4');
  const { data: banners, isLoading: bannersLoading } = useBannerImages('deecodes');
  const { data: products, isLoading: productsLoading } = useProducts('deecodes');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'oxford', label: 'Oxford' },
    { value: 'derby', label: 'Derby' },
    { value: 'monk-strap', label: 'Monk Strap' },
    { value: 'loafer', label: 'Loafer' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-5000', label: 'Under ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000-20000', label: '₹10,000 - ₹20,000' },
    { value: '20000+', label: 'Above ₹20,000' }
  ];

  const gridOptions = [
    { value: '2', icon: Grid2x2, label: '2 columns' },
    { value: '3', icon: Grid3x3, label: '3 columns' },
    { value: '4', icon: LayoutGrid, label: '4 columns' }
  ];

  const filterProducts = () => {
    if (!products) return [];
    
    let filtered = products.filter(product => 
      selectedCategory === 'all' || product.category === selectedCategory
    );

    // Price filtering
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
      filtered = filtered.filter(product => {
        if (priceRange === '20000+') return product.price >= 20000;
        return product.price >= parseInt(min) && product.price <= parseInt(max);
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      default:
        // Featured - keep original order or add your featured logic
        break;
    }

    return filtered;
  };

  const filteredProducts = filterProducts();

  const getGridClasses = () => {
    switch (gridSize) {
      case '2': return 'grid-cols-2 md:grid-cols-2';
      case '3': return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
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
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-4" style={{ fontFamily: 'Cornerstone', color: '#5A6F8D' }}>
              Dee Codes
            </h1>
            {/* Decorative Line */}
            <div className="w-16 md:w-20 lg:w-24 h-0.5 mx-auto mb-4 md:mb-6" style={{ backgroundColor: '#5A6F8D', opacity: 0.3 }}></div>
            <p className="text-sm md:text-base lg:text-xl text-neutral-600 max-w-3xl mx-auto px-4" style={{ fontFamily: 'Signika' }}>
              Contemporary design with a digital edge. Explore our modern collection that bridges 
              the gap between technology and craftsmanship for the next generation.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 lg:py-12">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Filter Header */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Filter className="h-5 w-5 text-neutral-600" />
                    <h3 className="text-lg font-semibold text-neutral-800" style={{ fontFamily: 'Cornerstone' }}>Filters</h3>
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
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
                      Sizes
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['6', '7', '8', '9', '10', '11', '12'].map((size) => (
                        <button
                          key={size}
                          className="px-3 py-2 border border-neutral-200 rounded text-sm hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                          style={{ fontFamily: 'Signika' }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
                      Colors
                    </label>
                    <div className="space-y-2">
                      {[
                        { name: 'Black', checked: true },
                        { name: 'Brown', checked: false },
                        { name: 'Tan', checked: false },
                        { name: 'White', checked: false },
                        { name: 'Navy', checked: false }
                      ].map((color) => (
                        <label key={color.name} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={color.checked}
                            className="rounded border-neutral-300 focus:ring-0"
                            style={{ 
                              accentColor: '#5A6F8D'
                            }}
                          />
                          <span className="text-sm text-neutral-700" style={{ fontFamily: 'Signika' }}>
                            {color.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Featured Categories */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4" style={{ fontFamily: 'Cornerstone' }}>Popular Styles</h3>
                  <div className="space-y-2">
                    {['Oxford', 'Derby', 'Loafer'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedCategory(style.toLowerCase())}
                        className="w-full text-left p-3 rounded-lg hover:bg-neutral-50 transition-colors group border border-transparent hover:border-neutral-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-700 group-hover:text-neutral-900" style={{ fontFamily: 'Signika' }}>
                            {style}
                          </span>
                          <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#5A6F8D' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Products */}
            <div className="flex-1">
              {/* Mobile Filters & Controls */}
              <div className="lg:hidden mb-4 md:mb-6">
                <div className="flex flex-wrap gap-2 md:gap-3">
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
                </div>
              </div>

              {/* Results Header */}
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-2 md:gap-4">
                  <h2 className="text-lg md:text-xl lg:text-2xl text-neutral-800" style={{ fontFamily: 'Cornerstone' }}>
                    {selectedCategory === 'all' ? 'Complete Collection' : 
                     categories.find(c => c.value === selectedCategory)?.label}
                  </h2>
                  <Badge variant="secondary" className="text-xs" style={{ fontFamily: 'Argent CF' }}>
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Style' : 'Styles'}
                  </Badge>
                </div>

                {/* Grid Size Controls */}
                <div className="hidden lg:flex items-center gap-2 bg-white border rounded-lg p-1">
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
                <div className={`grid ${getGridClasses()} gap-3 md:gap-4 lg:gap-6`}>
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="group cursor-pointer bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-neutral-300"
                    >
                      <div className="relative overflow-hidden bg-neutral-50 aspect-square">
                        <ProductImageGallery
                          images={product.product_images.map(img => img.image_url)}
                          productName={product.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500 ease-out"
                        />
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 md:p-2">
                            <Star className="h-3 w-3 md:h-4 md:w-4" style={{ color: '#5A6F8D' }} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 md:p-4 lg:p-6">
                        <div className="mb-1 md:mb-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs uppercase tracking-wider bg-transparent" 
                            style={{ 
                              fontFamily: 'Argent CF',
                              color: '#5A6F8D',
                              borderColor: '#5A6F8D'
                            }}
                          >
                            {product.category.replace('-', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-sm md:text-base lg:text-lg font-semibold text-neutral-900 mb-1 md:mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2" style={{ fontFamily: 'Cornerstone' }}>
                          {product.name}
                        </h3>
                        <p className="text-xs md:text-sm text-neutral-600 mb-2 hidden md:block" style={{ fontFamily: 'Signika' }}>
                          Sizes: | Colors:
                        </p>
                        <p className="text-base md:text-lg lg:text-xl font-bold text-neutral-800 mb-2 md:mb-3 lg:mb-4" style={{ fontFamily: 'Cornerstone' }}>
                          ₹{product.price.toLocaleString()}
                        </p>
                        <Button 
                          className="w-full bg-neutral-900 text-white hover:bg-neutral-800 uppercase tracking-wider text-xs md:text-sm py-2"
                          style={{ fontFamily: 'Argent CF' }}
                          onClick={() => window.location.href = `/deecodes/${product.category}/${product.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 md:py-16 lg:py-20 bg-white border border-neutral-200 rounded-lg">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Filter className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-neutral-800 mb-2" style={{ fontFamily: 'Cornerstone' }}>No Styles Found</h3>
                  <p className="text-neutral-600 mb-4 md:mb-6 px-4" style={{ fontFamily: 'Signika' }}>
                    {selectedCategory === 'all' 
                      ? 'No products available at the moment.' 
                      : `No styles found in ${categories.find(c => c.value === selectedCategory)?.label} category.`
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory('all')}
                    className="uppercase tracking-wider"
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