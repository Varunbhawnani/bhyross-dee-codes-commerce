import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useBannerImages } from '@/hooks/useBannerImages';
import BannerCarousel from '@/components/BannerCarousel';
import { Button } from '@/components/ui/button';
 import { useCategories } from '@/hooks/useCategories';
 import { SEO, generateBreadcrumbSchema } from '@/components/SEO';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Grid3X3, Grid2X2, LayoutGrid, ShoppingBag, Palette, Package, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Optimizes Supabase image URLs with width, quality, and WebP format
 */
const getOptimizedImageUrl = (url: string, width: number, quality: number = 75): string => {
  if (!url || !url.includes('supabase.co')) return url;
  const separator = url.includes('?') ? '&' : '?';
  // Also add height parameter to force resize
  return url;
};

  const Index: React.FC = () => {
  

  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedSortBy, setSelectedSortBy] = useState<string>('featured');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [gridColumns, setGridColumns] = useState<number>(3);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [touchedCard, setTouchedCard] = useState<string | null>(null);
const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

   const { data: banners, isLoading: bannersLoading } = useBannerImages('home');
  
  const { data: bhyrossProducts } = useProducts('bhyross');
  const { data: deecodesProducts } = useProducts('deecodes');
  const { data: imcolusProducts } = useProducts('imcolus');

  const { data: categoriesData } = useCategories();

  const brands = [
    { value: 'all', label: 'All Brands' },
    { value: 'imcolus', label: 'Imcolus' },
    { value: 'bhyross', label: 'Bhyross' },
    { value: 'deecodes', label: 'Dee Codes' }
  ];

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
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'name-za', label: 'Name: Z to A' },
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

  // Combine all products
  const allProducts = [
    ...(bhyrossProducts || []),
    ...(deecodesProducts || []),
    ...(imcolusProducts || [])
  ];

  // SEO Schema for homepage
  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Imcolus",
    "url": "https://imcolus.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://imcolus.in/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://www.facebook.com/imcolus",
      "https://www.instagram.com/imcolus",
      "https://twitter.com/imcolus"
    ]
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" }
  ]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Imcolus",
    "url": "https://imcolus.in",
    "logo": "https://imcolus.in/logo.png",
    "description": "Premium formal shoes for men - Oxford, Derby, Loafers & Monk Straps",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [homepageSchema, breadcrumbSchema, organizationSchema]
  };

  // Get unique colors from all products dynamically
  // Get unique colors from all products dynamically
  const getAvailableColors = () => {
    const uniqueColors = new Set<string>();
    
    allProducts.forEach(product => {
      product.product_variants?.forEach(variant => {
        if (variant.color_name) {
          uniqueColors.add(variant.color_name.toLowerCase());
        }
      });
    });

    
    
    return [
      { value: 'all', label: 'All Colors' },
      ...Array.from(uniqueColors).sort().map(color => ({
        value: color,
        label: color.charAt(0).toUpperCase() + color.slice(1)
      }))
    ];
  };

  const colors = getAvailableColors();

  // Filter products based on all selected filters
  const filteredProducts = allProducts.filter(product => {
    const brandMatch = selectedBrand === 'all' || product.brand === selectedBrand;
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    let priceMatch = true;
    if (selectedPriceRange !== 'all') {
      const price = product.price;
      switch (selectedPriceRange) {
        case '0-500':
          priceMatch = price < 500;
          break;
        case '500-1000':
          priceMatch = price >= 500 && price < 1000;
          break;
        case '1000-1500':
          priceMatch = price >= 1000 && price < 1500;
          break;
        case '1500-2000':
          priceMatch = price >= 1500 && price < 2000;
          break;
        case '2000-2500':
          priceMatch = price >= 2000 && price < 2500;
          break;
        case '2500-3000':
          priceMatch = price >= 2500 && price < 3000;
          break;
        case '3000+':
          priceMatch = price >= 3000;
          break;
      }
    }
    
    // Additional filters (mock implementation for now)
    // Additional filters
    const colorMatch = selectedColor === 'all' || 
      (product.product_variants && product.product_variants.some(variant => 
        variant.color_name?.toLowerCase().includes(selectedColor.toLowerCase())
      ));
    const sizeMatch = selectedSize === 'all' || (product.sizes && product.sizes.includes(parseInt(selectedSize)));
    
    return brandMatch && categoryMatch && priceMatch && colorMatch && sizeMatch;
  });

  // Sort products based on selected sort option
  // Sort products based on selected sort option
const sortedProducts = [...filteredProducts].sort((a, b) => {
  switch (selectedSortBy) {
    case 'featured':
      // Random/mixed order for featured - consistent per session
      return Math.sin(a.id.charCodeAt(0) + b.id.charCodeAt(0)) - 0.5;
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
      return Math.sin(a.id.charCodeAt(0) + b.id.charCodeAt(0)) - 0.5;
  }
});
  const getBrandColor = (brand: string) => {
  switch (brand) {
    case 'bhyross': return 'text-bhyross-500';
    case 'deecodes': return 'text-deecodes-500';
    case 'imcolus': return 'text-black'; // Change from 'text-blue-600' to 'text-black'
    default: return 'text-neutral-600';
  }
};

  const getBrandAccent = (brand: string) => {
  switch (brand) {
    case 'bhyross': return 'border-bhyross-500';
    case 'deecodes': return 'border-deecodes-500';
    case 'imcolus': return 'border-black'; // Change from 'border-blue-600' to 'border-black'
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

  const handleCardClick = (product: any) => {
  window.location.href = `/${product.brand}/${product.category}/${product.id}`;
};

const handleCardTouch = (productId: string) => {
  setTouchedCard(productId);
  setTimeout(() => setTouchedCard(null), 200);
};

const handleSwipe = (productId: string, direction: 'left' | 'right', imageCount: number) => {
  const currentIndex = currentImageIndex[productId] || 0;
  let newIndex;
  
  if (direction === 'right') {
    newIndex = currentIndex === imageCount - 1 ? 0 : currentIndex + 1;
  } else {
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
  const imageUrl = allImages[index]?.image_url || allImages[0]?.image_url || '';
  
  // Return optimized URL - smaller sizes to match displayed dimensions
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return getOptimizedImageUrl(imageUrl, isMobile ? 350 : 400, isMobile ? 70 : 75);
};

  const resetFilters = () => {
  setSelectedBrand('all');
  setSelectedCategory('all');
  setSelectedPriceRange('all');
  setSelectedColor('all');
  setSelectedSize('all');
  setSelectedSortBy('featured');
};

const hasActiveFilters = selectedBrand !== 'all' || selectedCategory !== 'all' || selectedPriceRange !== 'all' || 
  selectedColor !== 'all' || selectedSize !== 'all' || selectedSortBy !== 'featured';

    if (bannersLoading ) {
        return (
          <div className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-16 flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neutral-900 mx-auto"></div>
                <p className="mt-4 text-neutral-600" style={{ fontFamily: 'Signika' }}>Loading Collection...</p>
              </div>
            </div>
            <Footer brand="deecodes" />
          </div>
        );
      }

      

  return (
    <>
      <SEO
        title="Premium Formal Shoes for Men | Oxford, Derby, Loafers & Monk Straps"
        description="Shop authentic leather formal shoes online. Discover Oxford shoes, Derby shoes, Loafers, and Monk Straps from Imcolus, Bhyross & Dee Codes. Premium quality men's formal footwear with express shipping across India."
        keywords="formal shoes for men, oxford shoes, derby shoes, loafers, monk strap shoes, leather formal shoes, mens dress shoes, office shoes, buy formal shoes online india, premium formal footwear, imcolus shoes, bhyross shoes, deecodes shoes"
        image="https://lovable.dev/opengraph-image-p98pqg.png"
        type="website"
        schema={combinedSchema}
        canonical="https://imcolus.in/"
      />
    <div className="min-h-screen bg-gray-50">
      <div style={{ fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
        {/* Global Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none z-0">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#8a7e50ff 1px, transparent 1px), linear-gradient(90deg, #8a7e50ff 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>
        <Navigation />
      </div>
      <main className="pt-16 min-h-screen">
      <BannerCarousel brand="collections" />
      
      <div>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
 <div className="text-center mb-8">
  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
    Premium Formal Shoes for Men
  </h1>
    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
  Shop authentic leather formal shoes online - Oxford shoes, Derby shoes, Loafers, and Monk Straps from <Link to="/imcolus" className="text-blue-600 hover:underline">Imcolus</Link>, <Link to="/bhyross" className="text-blue-600 hover:underline">Bhyross</Link> & <Link to="/deecodes" className="text-blue-600 hover:underline">Dee Codes</Link>
</p>
  </div>
  {/* Hidden SEO content - Google reads it, users don't see it */}
  <div className="sr-only">
    <h2>Why Choose Our Formal Shoes Collection</h2>
    <p>Discover our complete collection of formal footwear for men. From classic designs to contemporary styles, find the perfect formal shoes that combine quality craftsmanship with exceptional comfort for every professional occasion.</p>
    <h3>Premium Quality</h3>
    <p>Every pair is crafted with attention to detail, using high-quality materials that ensure durability and long-lasting comfort for daily professional wear.</p>
    <h3>Diverse Styles</h3>
    <p>From timeless classics to modern designs, our extensive collection caters to every professional's style preference and workplace dress code requirements.</p>
    <h3>Perfect Fit</h3>
    <p>Available in multiple sizes and widths, ensuring you find the perfect fit. Our formal shoes combine style with all-day comfort for the modern professional.</p>
  </div>
</div>
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
              {/* Top Controls */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="hidden sm:flex items-center gap-2">
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

  <div className="hidden sm:flex items-center gap-4">
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
  className={`group cursor-pointer bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-neutral-300 lg:cursor-default ${
    touchedCard === product.id ? 'scale-95 shadow-sm' : ''
  }`}
  onClick={() => window.innerWidth < 1024 && handleCardClick(product)}
  onTouchStart={() => handleCardTouch(product.id)}
>
  <div className="relative overflow-hidden bg-neutral-50 aspect-square">
    {/* Desktop Version - simple image with lazy loading */}
{/* Desktop Version - simple image with lazy loading */}
{/* Desktop Version - with arrow controls */}
<div className="hidden lg:block relative">
  <img 
    src={getCurrentImage(product)} 
    alt={product.name}
    className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500 ease-out"
    loading="lazy"
    decoding="async"
    width="400"
    height="400"
    style={{ aspectRatio: '1/1' }}
    srcSet={`
      ${getOptimizedImageUrl(product.product_variants.flatMap(v => v.product_images || [])[currentImageIndex[product.id] || 0]?.image_url || '', 350, 75)} 350w,
      ${getOptimizedImageUrl(product.product_variants.flatMap(v => v.product_images || [])[currentImageIndex[product.id] || 0]?.image_url || '', 400, 75)} 400w,
      ${getOptimizedImageUrl(product.product_variants.flatMap(v => v.product_images || [])[currentImageIndex[product.id] || 0]?.image_url || '', 500, 75)} 500w
    `}
    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
    width="350"
    height="350"
    style={{ aspectRatio: '1/1' }}
  />
  {/* Mobile interactive overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</div>
    
    <div className="absolute top-3 left-3">
      <span className={`px-3 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm ${getBrandColor(product.brand)} capitalize border ${getBrandAccent(product.brand)}`}>
        {product.brand}
      </span>
    </div>
  </div>
  
  {/* Visual separator */}
  <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent lg:hidden"></div>
  
  <div className="p-3 md:p-4">
    <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base line-clamp-2">{product.name}</h3>
    <p className="text-neutral-600 text-xs md:text-sm mb-2 capitalize">{product.category.replace('-', ' ')}</p>
    <p className={`font-bold text-base md:text-lg ${getBrandColor(product.brand)} mb-3`}>
      ₹{product.price.toLocaleString()}
    </p>
    <Button 
      className="w-full bg-black text-white hover:bg-gray-800 text-sm md:text-base py-2 lg:block hidden"
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
      </div>
      </main>

      <Footer brand="bhyross" />
    </div>
    </>
  );
};

export default Index;