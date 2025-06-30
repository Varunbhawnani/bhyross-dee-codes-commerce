
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useBannerImages } from '@/hooks/useBannerImages';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

const BhyrossPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: banners, isLoading: bannersLoading } = useBannerImages('bhyross');
  const { data: products, isLoading: productsLoading } = useProducts('bhyross');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'oxford', label: 'Oxford' },
    { value: 'derby', label: 'Derby' },
    { value: 'monk-strap', label: 'Monk Strap' },
    { value: 'loafer', label: 'Loafer' }
  ];

  const filteredProducts = products?.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  ) || [];

  if (bannersLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading Bhyross Collection...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-16">
        {/* Banner Carousel */}
        {banners && banners.length > 0 && (
          <BannerCarousel banners={banners} />
        )}

        {/* Brand Header */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold brand-bhyross mb-6">
              Bhyross
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Where tradition meets innovation. Discover our curated collection of premium footwear 
              crafted for the discerning gentleman who values both style and substance.
            </p>
          </div>

          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Filter by Category:</span>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
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

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-neutral-100 aspect-square mb-4">
                    <ProductImageGallery
                      images={product.product_images}
                      productName={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">{product.name}</h3>
                  <p className="text-neutral-600 text-sm mb-2 capitalize">{product.category.replace('-', ' ')}</p>
                  <p className="font-bold text-bhyross-500">₹{product.price.toLocaleString()}</p>
                  <Button 
                    className="w-full mt-3 bg-bhyross-500 hover:bg-bhyross-600"
                    onClick={() => window.location.href = `/bhyross/${product.category}/${product.id}`}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg">
                {selectedCategory === 'all' 
                  ? 'No products available at the moment.' 
                  : `No products found in ${categories.find(c => c.value === selectedCategory)?.label} category.`
                }
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BhyrossPage;
