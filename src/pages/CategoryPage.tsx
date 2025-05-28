import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

const CategoryPage = () => {
  const { category: categoryParam } = useParams();
  const brand = location.pathname.includes('/bhyross/') ? 'bhyross' : 'deecodes';
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Type guard to ensure category is valid
  const isValidCategory = (cat: string | undefined): cat is 'oxford' | 'derby' | 'monk-strap' | 'loafer' => {
    return cat === 'oxford' || cat === 'derby' || cat === 'monk-strap' || cat === 'loafer';
  };
  
  const category = isValidCategory(categoryParam) ? categoryParam : undefined;
  const { data: products = [], isLoading } = useProducts(brand, category);

  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product.id,
      size: 9, // Default size
    });
  };

  const categoryInfo = {
    oxford: {
      title: 'Oxford Shoes',
      description: 'The quintessential formal shoe with closed lacing system, perfect for business meetings and formal events.'
    },
    derby: {
      title: 'Derby Shoes',
      description: 'Versatile open-lace shoes that offer both comfort and style for business casual and formal occasions.'
    },
    'monk-strap': {
      title: 'Monk Strap Shoes',
      description: 'Distinguished shoes featuring buckle closures, offering a unique alternative to traditional laced footwear.'
    },
    loafer: {
      title: 'Loafer Shoes',
      description: 'Slip-on shoes that combine elegance with convenience, ideal for both professional and social settings.'
    }
  };

  const currentCategory = category ? categoryInfo[category] : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand={brand} />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand={brand} />
      
      {/* Breadcrumb */}
      <div className="pt-20 pb-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-neutral-600">
            <Link to="/" className="hover:text-neutral-900">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`/${brand}`} className="hover:text-neutral-900 capitalize">{brand}</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900 capitalize">{categoryParam?.replace('-', ' ')}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="py-12 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              {currentCategory?.title || 'Products'}
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              {currentCategory?.description || 'Browse our collection of premium footwear.'}
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-neutral-500">
              <span>Free Shipping on orders over ₹{brand === 'bhyross' ? '10,000' : '2,500'}</span>
              <span>•</span>
              <span>Easy Returns</span>
              <span>•</span>
              <span>Quality Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900">
              {products.length} Products
            </h2>
            <select className="border border-neutral-300 rounded-lg px-4 py-2 text-sm">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card key={product.id} className="group overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center'}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-2xl font-bold text-neutral-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Link to={`/${brand}/${categoryParam}/${product.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className={`w-full ${
                        brand === 'bhyross' 
                          ? 'bg-bhyross-500 hover:bg-bhyross-600' 
                          : 'bg-deecodes-500 hover:bg-deecodes-600'
                      }`}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
