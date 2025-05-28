
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const CategoryPage = () => {
  const { category } = useParams();
  const brand = location.pathname.includes('/bhyross/') ? 'bhyross' : 'deecodes';
  const { addItem } = useCart();
  const { toast } = useToast();

  // Mock product data
  const products = [
    {
      id: '1',
      name: `Classic ${category?.replace('-', ' ')} Shoe`,
      price: brand === 'bhyross' ? 15999 : 2999,
      originalPrice: brand === 'bhyross' ? 18999 : 3999,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      rating: 4.8,
      reviews: 156
    },
    {
      id: '2',
      name: `Premium ${category?.replace('-', ' ')} Collection`,
      price: brand === 'bhyross' ? 22999 : 3999,
      originalPrice: brand === 'bhyross' ? 25999 : 4999,
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop&crop=center',
      rating: 4.9,
      reviews: 89
    },
    {
      id: '3',
      name: `Modern ${category?.replace('-', ' ')} Style`,
      price: brand === 'bhyross' ? 18999 : 3499,
      originalPrice: brand === 'bhyross' ? 21999 : 4499,
      image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=400&fit=crop&crop=center',
      rating: 4.7,
      reviews: 203
    },
    {
      id: '4',
      name: `Executive ${category?.replace('-', ' ')} Edition`,
      price: brand === 'bhyross' ? 24999 : 4499,
      originalPrice: brand === 'bhyross' ? 27999 : 5499,
      image: 'https://images.unsplash.com/photo-1571245078683-3bbf52d98bf6?w=400&h=400&fit=crop&crop=center',
      rating: 4.9,
      reviews: 127
    },
    {
      id: '5',
      name: `Signature ${category?.replace('-', ' ')} Design`,
      price: brand === 'bhyross' ? 19999 : 3799,
      originalPrice: brand === 'bhyross' ? 22999 : 4799,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      rating: 4.8,
      reviews: 178
    },
    {
      id: '6',
      name: `Professional ${category?.replace('-', ' ')} Line`,
      price: brand === 'bhyross' ? 17999 : 3299,
      originalPrice: brand === 'bhyross' ? 20999 : 4299,
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop&crop=center',
      rating: 4.6,
      reviews: 94
    }
  ];

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: '9', // Default size
      brand: brand as 'bhyross' | 'deecodes'
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
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

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo];

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
            <span className="text-neutral-900 capitalize">{category?.replace('-', ' ')}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="py-12 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              {currentCategory?.title}
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              {currentCategory?.description}
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
              <option>Customer Rating</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card key={product.id} className="group overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      Save ₹{(product.originalPrice - product.price).toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-neutral-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-neutral-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-2xl font-bold text-neutral-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-lg text-neutral-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Link to={`/${brand}/${category}/${product.id}`}>
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
