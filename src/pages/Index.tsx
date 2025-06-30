
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Sparkles } from 'lucide-react';

const Index: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
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
    { value: 'loafer', label: 'Loafer' }
  ];

  // Combine all products
  const allProducts = [
    ...(bhyrossProducts || []),
    ...(deecodesProducts || []),
    ...(imcolusProducts || [])
  ];

  // Filter products based on selected brand and category
  const filteredProducts = allProducts.filter(product => {
    const brandMatch = selectedBrand === 'all' || product.brand === selectedBrand;
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    return brandMatch && categoryMatch;
  });

  // Sort products by creation date (newest first)
  const sortedProducts = filteredProducts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'bhyross': return 'text-bhyross-500';
      case 'deecodes': return 'text-deecodes-500';
      case 'imcolus': return 'text-blue-600';
      default: return 'text-neutral-600';
    }
  };

  const getBrandButtonColor = (brand: string) => {
    switch (brand) {
      case 'bhyross': return 'bg-bhyross-500 hover:bg-bhyross-600';
      case 'deecodes': return 'bg-deecodes-500 hover:bg-deecodes-600';
      case 'imcolus': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-neutral-600 hover:bg-neutral-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-16">
        

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 text-center mb-4">
              Our Complete Collection
            </h2>
            <p className="text-neutral-600 text-center max-w-2xl mx-auto">
              Explore handcrafted footwear from all our brands in one place. Filter by brand or category to find your perfect match.
            </p>
          </div>

          {/* Filter Section */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8 bg-neutral-50 p-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Filter Products:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px]">
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
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
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="relative overflow-hidden rounded-t-lg bg-neutral-100 aspect-square">
                    <ProductImageGallery
                      images={product.product_images.map(img => img.image_url)}
                      productName={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white ${getBrandColor(product.brand)} capitalize`}>
                        {product.brand}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 mb-2">{product.name}</h3>
                    <p className="text-neutral-600 text-sm mb-2 capitalize">{product.category.replace('-', ' ')}</p>
                    <p className={`font-bold text-lg ${getBrandColor(product.brand)} mb-3`}>
                      ₹{product.price.toLocaleString()}
                    </p>
                    <Button 
                      className="w-full bg-black text-white"

                      onClick={() => window.location.href = `/${product.brand}/${product.category}/${product.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg">
                No products found matching your filters. Try adjusting your selection.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer brand="bhyross" />
    </div>
  );
};

export default Index;
