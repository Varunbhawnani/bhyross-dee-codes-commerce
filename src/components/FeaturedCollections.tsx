
import React from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { Card } from '@/components/ui/card';

interface FeaturedCollectionsProps {
  brand: 'bhyross' | 'deecodes';
}

const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ brand }) => {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts(brand);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  const getPrimaryImage = (product: any): string => {
    if (!product.products?.product_images || product.products.product_images.length === 0) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
    }
    
    const primaryImage = product.products.product_images.find((img: any) => img.is_primary);
    return primaryImage?.image_url || product.products.product_images[0]?.image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img
                  src={getPrimaryImage(item)}
                  alt={item.products?.name || 'Featured Product'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">{item.products?.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  ₹{item.products?.price?.toLocaleString()}
                </p>
                <Link to={`/${brand}/oxford/${item.product_id}`}>
                  <button className="w-full bg-neutral-900 text-white py-2 px-4 rounded hover:bg-neutral-800 transition-colors">
                    View Details
                  </button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
