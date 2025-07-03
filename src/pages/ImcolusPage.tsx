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
import { Filter, Grid3x3, Grid2x2, LayoutGrid, ArrowUpDown, Star, Award, Sparkles } from 'lucide-react';

const ImcolusPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [gridSize, setGridSize] = useState<string>('4');
  const { data: banners, isLoading: bannersLoading } = useBannerImages('imcolus');
  const { data: products, isLoading: productsLoading } = useProducts('imcolus');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'oxford', label: 'Oxford' },
    { value: 'derby', label: 'Derby' },
    { value: 'monk-strap', label: 'Monk Strap' },
    { value: 'loafer', label: 'Loafer' },
    { value: 'brogue', label: 'Brogue' },
    { value: 'formal', label: 'Formal' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-5000', label: 'Under ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000-20000', label: '₹10,000 - ₹20,000' },
    { value: '20000+', label: 'Above ₹20,000' }
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
            <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-neutral-900 mx-auto"></div>
            <p className="mt-4 text-neutral-600 text-sm md:text-base" style={{ fontFamily: 'Signika' }}>Loading Imcolus Collection...</p>
          </div>
        </div>
        <Footer brand="bhyross" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Navigation />
      
      <main className="pt-16">
        {/* Banner Carousel */}
        <BannerCarousel brand="imcolus" />

        {/* Brand Header */}
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6" style={{ fontFamily: 'Cornerstone', color: '#A89F91' }}>
              Imcolus
            </h1>
            <div className="w-16 md:w-24 h-0.5 mx-auto mb-3 md:mb-6" style={{ backgroundColor: '#A89F91', opacity: 0.3 }}></div>
            <p className="text-sm md:text-xl text-neutral-600 max-w-3xl mx-auto px-4" style={{ fontFamily: 'Signika' }}>
              Premium craftsmanship meets contemporary design. Discover our flagship collection 
              of handcrafted footwear that defines sophistication and comfort.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
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
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-3" style={{ fontFamily: 'Argent CF' }}>
                      Colors
                    </label>
                    <div className="space-y-2">
                      {[
                        { name: 'Black', checked: false },
                        { name: 'Brown', checked: true },
                        { name: 'Tan', checked: false }
                      ].map((color) => (
                        <label key={color.name} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={color.checked}
                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                            style={{ accentColor: '#A89F91' }}
                          />
                          <span className="text-sm text-neutral-700" style={{ fontFamily: 'Signika' }}>
                            {color.name}
                          </span>
                        </label>
                      ))}
                    </div>
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
                          <Sparkles className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#A89F91' }} />
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
                    <SelectTrigger className="w-full sm:w-48 text-sm">
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
                    <SelectTrigger className="w-full sm:w-48 text-sm">
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
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <div className="flex items-center gap-2 md:gap-4">
                  <h2 className="text-lg md:text-2xl text-neutral-800" style={{ fontFamily: 'Cornerstone' }}>
                    {selectedCategory === 'all' ? 'Complete Collection' : 
                     categories.find(c => c.value === selectedCategory)?.label}
                  </h2>
                  <Badge variant="secondary" className="text-xs border" style={{ fontFamily: 'Argent CF', borderColor: '#A89F91', color: '#A89F91', backgroundColor: 'transparent' }}>
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
                        backgroundColor: gridSize === option.value ? '#A89F91' : 'transparent'
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
                <div className={`grid ${getGridClasses()} gap-3 md:gap-6`}>
                  {filteredProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className={`group cursor-pointer bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-neutral-300`}
                    >
                      <div className="relative overflow-hidden bg-neutral-50 aspect-square">
                        <ProductImageGallery
                          images={product.product_images.map(img => img.image_url)}
                          productName={product.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500 ease-out"
                        />
                        <div className="absolute top-2 md:top-4 right-2 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 md:p-2">
                            <Star className="h-3 w-3 md:h-4 md:w-4" style={{ color: '#A89F91' }} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 md:p-6">
                        <div className="mb-1 md:mb-2">
                          <Badge variant="outline" className="text-xs uppercase tracking-wider border" style={{ fontFamily: 'Argent CF', borderColor: '#A89F91', color: '#A89F91' }}>
                            {product.category.replace('-', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-sm md:text-lg font-semibold text-neutral-900 mb-1 md:mb-2 group-hover:text-neutral-700 transition-colors leading-tight" style={{ fontFamily: 'Cornerstone' }}>
                          {product.name}
                        </h3>
                        <p className="text-xs md:text-sm text-neutral-600 mb-1 md:mb-2 hidden md:block" style={{ fontFamily: 'Signika' }}>
                          Sizes: | Colors:
                        </p>
                        <p className="text-sm md:text-xl font-bold text-neutral-800 mb-2 md:mb-4" style={{ fontFamily: 'Cornerstone' }}>
                          ₹{product.price.toLocaleString()}
                        </p>
                        <Button 
                          className="w-full text-white hover:opacity-90 uppercase tracking-wider text-xs md:text-sm py-1.5 md:py-2 border-0"
                          style={{ fontFamily: 'Argent CF', backgroundColor: '#A89F91' }}
                          onClick={() => window.location.href = `/imcolus/${product.category}/${product.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 md:py-20 bg-white border border-neutral-200 rounded-lg">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Filter className="h-8 w-8 md:h-12 md:w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-neutral-800 mb-2" style={{ fontFamily: 'Cornerstone' }}>No Styles Found</h3>
                  <p className="text-sm md:text-base text-neutral-600 mb-4 md:mb-6 px-4" style={{ fontFamily: 'Signika' }}>
                    {selectedCategory === 'all' 
                      ? 'No products available at the moment.' 
                      : `No styles found matching your current filters.`
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange('all');
                      setSortBy('featured');
                    }}
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

      <Footer brand="bhyross" />
    </div>
  );
};

export default ImcolusPage;