import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Award, Shield, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const BhyrossPage = () => {
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

      // Transform the data to match our interface
      const transformedProducts: Product[] = (productsData?.map(product => ({
        ...product,
        images: product.product_images || []
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
        .eq('brand', 'bhyross');
      
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
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop'; // fallback
    }
    
    const primaryImage = product.images.find(img => img.is_primary);
    if (primaryImage) return primaryImage.image_url;
    
    // Sort by sort_order and get first image
    const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
    return sortedImages[0]?.image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop';
  };

  // Static fallback categories (used if database categories are not available)
  const fallbackCategories = [
    {
      id: 'oxford',
      name: 'Oxford',
      path: 'oxford',
      description: 'Classic closed-lace design for formal occasions',
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 'derby',
      name: 'Derby',
      path: 'derby',
      description: 'Versatile open-lace style for business and casual',
      image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 'monk-strap',
      name: 'Monk Strap',
      path: 'monk-strap',
      description: 'Distinguished buckle closure with European flair',
      image_url: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 'loafer',
      name: 'Loafer',
      path: 'loafer',
      description: 'Slip-on comfort with refined elegance',
      image_url: 'https://images.unsplash.com/photo-1571245078683-3bbf52d98bf6?w=400&h=300&fit=crop&crop=center'
    }
  ];

  // Static fallback products (used if database products are not available)
  const fallbackProducts = [
    {
      id: '1',
      name: 'Executive Oxford',
      price: 489,
      description: 'Premium leather oxford shoes for business professionals',
      category: 'oxford',
      images: [{ id: '1', product_id: '1', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', is_primary: true, sort_order: 1 }]
    },
    {
      id: '2',
      name: 'Heritage Brogue',
      price: 529,
      description: 'Classic brogue detailing with modern comfort',
      category: 'oxford',
      images: [{ id: '2', product_id: '2', image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop', is_primary: true, sort_order: 1 }]
    },
    {
      id: '3',
      name: 'Milano Loafer',
      price: 399,
      description: 'Italian-inspired slip-on loafers',
      category: 'loafer',
      images: [{ id: '3', product_id: '3', image_url: 'https://images.unsplash.com/photo-1571245078683-3bbf52d98bf6?w=400&h=300&fit=crop', is_primary: true, sort_order: 1 }]
    },
    {
      id: '4',
      name: 'Windsor Boot',
      price: 649,
      description: 'Elegant ankle boots for sophisticated style',
      category: 'boot',
      images: [{ id: '4', product_id: '4', image_url: 'https://images.unsplash.com/photo-1608256246200-53e8b47b24f5?w=400&h=300&fit=crop', is_primary: true, sort_order: 1 }]
    },
    {
      id: '5',
      name: 'Gentleman Derby',
      price: 459,
      description: 'Versatile derby shoes for business and casual wear',
      category: 'derby',
      images: [{ id: '5', product_id: '5', image_url: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop', is_primary: true, sort_order: 1 }]
    },
    {
      id: '6',
      name: 'Royal Monk Strap',
      price: 579,
      description: 'Distinguished monk strap with premium leather',
      category: 'monk-strap',
      images: [{ id: '6', product_id: '6', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', is_primary: true, sort_order: 1 }]
    }
  ];

  // Static data
  const features = [
    {
      icon: Award,
      title: 'Premium Craftsmanship',
      description: 'Hand-stitched by master artisans using traditional techniques'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '2-year warranty covering manufacturing defects'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Complimentary delivery on all orders above ₹10,000'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Business Executive',
      rating: 5,
      comment: 'Exceptional quality and comfort. These shoes have lasted me over two years with daily wear.'
    },
    {
      name: 'Amit Sharma',
      role: 'Wedding Photographer',
      rating: 5,
      comment: 'Perfect for long events. The craftsmanship is evident in every detail.'
    },
    {
      name: 'Priya Mehta',
      role: 'Corporate Lawyer',
      rating: 5,
      comment: 'Bought these for my husband. He absolutely loves the comfort and style.'
    }
  ];

  // Use database data if available, otherwise use fallback data
  const displayProducts = products.length > 0 ? products : fallbackProducts;
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand="bhyross" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation brand="bhyross" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="bhyross" />

      //hero section

      <section className="hero">
        <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Premium leather craftsmanship" className="hero-background" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Crafted Excellence</h1>
          <p className="hero-subtitle">Where luxury meets artisanal precision in every step</p>
          <a href="#" className="cta-button bhyross">Shop Now</a>
        </div>
      </section>

      //product section

      <section className="products-section">
        <h2 className="section-title bhyross">Featured Collection</h2>
        <div className="products-grid">
          {displayProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={getPrimaryImage(product)} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    // Fallback image if the image fails to load
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop';
                  }}
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price bhyross">${product.price}</p>
                <Link 
  to={`/bhyross/${product.category}/${product.id}`}
  className="mt-2 inline-block bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
>
  View Details
</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

//collection showcase section

      <section className="collection-showcase">
        <div className="collection-content">
          <div className="collection-text bhyross">
            <h2>Luxury Redefined</h2>
            <p>Every Bhyross shoe is a masterpiece of Italian craftsmanship, where centuries-old techniques meet contemporary design. Our artisans dedicate over 190 steps to create each pair, ensuring perfection in every detail.</p>
            <div className="collection-stats">
              <div className="stat-item">
                <span className="stat-number bhyross">190+</span>
                <span className="stat-label">Crafting Steps</span>
              </div>
              <div className="stat-item">
                <span className="stat-number bhyross">72hrs</span>
                <span className="stat-label">Creation Time</span>
              </div>
              <div className="stat-item">
                <span className="stat-number bhyross">100%</span>
                <span className="stat-label">Hand-Made</span>
              </div>
            </div>
          </div>
          <div className="collection-visual">
            <img src="https://images.unsplash.com/photo-1608256246200-53e8b47b24f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Luxury shoe crafting process" className="collection-image" />
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="process-container">
          <h2 className="section-title bhyross">The Bhyross Process</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="process-number bhyross">1</div>
              <h3>Selection</h3>
              <p>Premium Italian leather is hand-selected from the finest tanneries in Tuscany, ensuring each hide meets our exacting standards for quality and character.</p>
            </div>
            <div className="process-step">
              <div className="process-number bhyross">2</div>
              <h3>Crafting</h3>
              <p>Master artisans with decades of experience meticulously shape each shoe using traditional techniques passed down through generations.</p>
            </div>
            <div className="process-step">
              <div className="process-number bhyross">3</div>
              <h3>Finishing</h3>
              <p>Every detail is perfected by hand, from the precise stitching to the final polish, creating shoes that exemplify timeless elegance.</p>
            </div>
            <div className="process-step">
              <div className="process-number bhyross">4</div>
              <h3>Quality</h3>
              <p>Rigorous quality control ensures each pair meets our uncompromising standards before earning the Bhyross name.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-neutral-50 to-bhyross-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Explore Our Collections
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
              From classic Oxfords to modern Loafers, find the perfect style for every occasion
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayCategories.map((category, index) => (
              <Link key={category.path} to={`/bhyross/${category.path}`}>
                <Card className="group overflow-hidden hover-lift">
                  <div className="relative">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                      <h3 className="text-base sm:text-lg font-semibold mb-1">{category.name}</h3>
                      <p className="text-xs sm:text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="section-title bhyross">What Our Customers Say</h2>
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

      <section className="why-section">
        <div className="why-container">
          <h2 className="section-title bhyross">Why Bhyross?</h2>
          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon bhyross">✨</div>
              <h3 className="why-title">Premium Materials</h3>
              <p className="why-description">Hand-selected Italian leather and finest materials sourced from renowned tanneries worldwide, ensuring unmatched quality and durability.</p>
            </div>
            <div className="why-item">
              <div className="why-icon bhyross">🏆</div>
              <h3 className="why-title">Master Craftsmanship</h3>
              <p className="why-description">Each pair is meticulously handcrafted by skilled artisans with decades of experience, blending traditional techniques with modern precision.</p>
            </div>
            <div className="why-item">
              <div className="why-icon bhyross">👑</div>
              <h3 className="why-title">Timeless Design</h3>
              <p className="why-description">Classic silhouettes refined for the modern gentleman, creating shoes that transcend trends and become lifetime companions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Stay Connected</h2>
          <p className="newsletter-subtitle">Be the first to know about new collections, exclusive events, and craftsmanship stories.</p>
          <form className="newsletter-form">
            <input type="email" className="newsletter-input" placeholder="Enter your email" required />
            <button type="submit" className="newsletter-btn bhyross">Subscribe</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section bhyross">
            <h3>Bhyross</h3>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Craftsmanship</a></li>
              <li><a href="#">Collections</a></li>
              <li><a href="#">Size Guide</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul className="footer-links">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Care Guide</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Connect</h3>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📧</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Bhyross. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
};

export default BhyrossPage;