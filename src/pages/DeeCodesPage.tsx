import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Zap, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

// Types for your data
interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: ProductImage[];
}

interface Category {
  id: string;
  name: string;
  path: string;
  description: string;
  image_url: string;
}

const DeeCodesPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products with images
  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .eq('category', 'derby')
        .limit(6);

      if (productsError) throw productsError;

      const transformedProducts: Product[] = (productsData?.map(product => ({
  ...product,
  images: product.product_images?.map(image => ({
    ...image,
    product_id: product.id // Add the missing product_id
  })) || []
})) as Product[]) || [];
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
  try {
    // @ts-ignore
    const { data: categoriesData, error: categoriesError } = await supabase
  .from('categories' as any)
  .select('*')
  .eq('brand', 'deecodes');
    
    if (categoriesError) throw categoriesError;
    // @ts-ignore
    setCategories(categoriesData || []);
  } catch (err) {
    console.error('Error fetching categories:', err);
    setError('Failed to load categories');
  }
};

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Helper function to get primary image or first image for a product
  const getPrimaryImage = (product: Product): string => {
    if (!product.images || product.images.length === 0) {
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'; // fallback
    }
    
    const primaryImage = product.images.find(img => img.is_primary);
    if (primaryImage) return primaryImage.image_url;
    
    // Sort by sort_order and get first image
    const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
    return sortedImages[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop';
  };

  // Static data (you can also move these to database)
  const features = [
    {
      icon: DollarSign,
      title: 'Unbeatable Value',
      description: 'Premium quality at prices that won\'t break the bank'
    },
    {
      icon: Zap,
      title: 'Quick Delivery',
      description: 'Fast shipping to get your shoes when you need them'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Dedicated support and hassle-free returns'
    }
  ];

  const testimonials = [
    {
      name: 'Vikash Singh',
      role: 'Software Engineer',
      rating: 5,
      comment: 'Amazing value for money. These shoes look great and are very comfortable for daily office wear.'
    },
    {
      name: 'Neha Gupta',
      role: 'Marketing Manager',
      rating: 5,
      comment: 'Ordered for my team. Everyone loves the quality and the price point is perfect for corporate orders.'
    },
    {
      name: 'Arjun Patel',
      role: 'College Student',
      rating: 5,
      comment: 'Perfect for college interviews and presentations. Great quality at a student-friendly price.'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand="deecodes" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand="deecodes" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="deecodes" />
      
      <section className="hero">
        <img 
          src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Modern lifestyle sneakers" 
          className="hero-background" 
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Code Your Style</h1>
          <p className="hero-subtitle">Smart design meets everyday comfort for the modern lifestyle</p>
          <a href="#" className="cta-button dee-codes">Shop Now</a>
        </div>
      </section>

      <section className="products-section">
        <h2 className="section-title dee-codes">Featured Collection</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={getPrimaryImage(product)} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    // Fallback image if the image fails to load
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop';
                  }}
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price dee-codes">${product.price}</p>
                <Link 
                  to={`/deecodes/${product.category}/${product.id}`}
                  className="mt-2 inline-block bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section - if you have categories data */}
      {categories.length > 0 && (
        <section className="categories-section mt-16">
          <h2 className="section-title dee-codes">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.path}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Rest of your existing sections */}
      <section className="why-section">
        <div className="why-container">
          <h2 className="section-title dee-codes">Why Dee Codes?</h2>
          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon dee-codes">💡</div>
              <h3 className="why-title">Smart Innovation</h3>
              <p className="why-description">Cutting-edge materials and technology integrated seamlessly into everyday designs, delivering performance without compromise.</p>
            </div>
            <div className="why-item">
              <div className="why-icon dee-codes">🌟</div>
              <h3 className="why-title">Accessible Style</h3>
              <p className="why-description">Premium design philosophy made affordable, ensuring everyone can access quality footwear that elevates their daily experience.</p>
            </div>
            <div className="why-item">
              <div className="why-icon dee-codes">🚀</div>
              <h3 className="why-title">Future Forward</h3>
              <p className="why-description">Always evolving, always improving. We stay ahead of trends to bring you tomorrow's comfort and style, today.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Keep all your other existing sections... */}
      <section className="collection-showcase">
        <div className="collection-content">
          <div className="collection-text dee-codes">
            <h2>Code Your Future</h2>
            <p>Dee Codes represents the intersection of technology and style. Our innovative approach combines sustainable materials with cutting-edge design, creating footwear that adapts to your dynamic lifestyle.</p>
            <div className="collection-stats">
              <div className="stat-item">
                <span className="stat-number dee-codes">50+</span>
                <span className="stat-label">Tech Features</span>
              </div>
              <div className="stat-item">
                <span className="stat-number dee-codes">24/7</span>
                <span className="stat-label">Comfort</span>
              </div>
              <div className="stat-item">
                <span className="stat-number dee-codes">100%</span>
                <span className="stat-label">Sustainable</span>
              </div>
            </div>
          </div>
          <div className="collection-visual">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Modern sneaker technology" className="collection-image" />
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="section-title dee-codes">What Our Community Says</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-quote">"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">👤</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Join the Movement</h2>
          <p className="newsletter-subtitle">Get early access to new drops, exclusive member benefits, and the latest in footwear innovation.</p>
          <form className="newsletter-form">
            <input type="email" className="newsletter-input" placeholder="Enter your email" required />
            <button type="submit" className="newsletter-btn dee-codes">Subscribe</button>
          </form>
        </div>
      </section>

       <Footer brand="deecodes" />
    </div>
  );
};

export default DeeCodesPage;
