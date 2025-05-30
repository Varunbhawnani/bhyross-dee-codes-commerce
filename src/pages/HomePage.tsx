import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Award, Shield, Truck } from 'lucide-react';

type Brand = 'dual' | 'bhyross' | 'dee';

const HomePage: React.FC = () => {
     const categories = [
      {
        name: 'Oxford',
        path: 'oxford',
        description: 'Classic closed-lace design for formal occasions',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Derby',
        path: 'derby',
        description: 'Versatile open-lace style for business and casual',
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Monk Strap',
        path: 'monk-strap',
        description: 'Distinguished buckle closure with European flair',
        image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Loafer',
        path: 'loafer',
        description: 'Slip-on comfort with refined elegance',
        image: 'https://images.unsplash.com/photo-1571245078683-3bbf52d98bf6?w=400&h=300&fit=crop&crop=center'
      }
    ];
  
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
  const [brand, setBrand] = useState<Brand>('dual');
  const bhyrossVideo = useRef<HTMLVideoElement>(null);
  const deeCodesVideo = useRef<HTMLVideoElement>(null);

  // Handlers for hover play/pause
  const handleMouseEnter = (ref: React.RefObject<HTMLVideoElement>) => {
    ref.current?.play().catch(() => {});
  };
  const handleMouseLeave = (ref: React.RefObject<HTMLVideoElement>) => {
    if (ref.current) {
      ref.current.pause();
      ref.current.currentTime = 0;
    }
  };
  
// CSS styles embedded in the component
  const styles = `
    .dual-landing {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .choice-container {
      display: flex;
      gap: 4rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .brand-button {
      position: relative;
      width: 300px;
      height: 400px;
      border: none;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .brand-button:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .video-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .button-text {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      z-index: 2;
    }

    .brand-button.bhyross {
      background: linear-gradient(135deg, #8B4513, #A0522D);
    }

    .brand-button.dee-codes {
      background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    }

    /* Brand Landing Styles */
    .brand-landing {
      min-height: 100vh;
      background: #fff;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .logo {
      font-size: 2rem;
      font-weight: bold;
      text-decoration: none;
    }

    .logo.bhyross {
      color: #8B4513;
    }

    .logo.dee {
      color: #FF6B6B;
    }

    .home-button {
      padding: 0.5rem 1rem;
      background: #333;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .home-button:hover {
      background: #555;
    }

    .hero {
      position: relative;
      height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.4);
      z-index: 2;
    }

    .hero-content {
      position: relative;
      z-index: 3;
      text-align: center;
      color: white;
    }

    .hero-title {
      font-size: 4rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    }

    .hero-subtitle {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    }

    .cta-button {
      padding: 1rem 2rem;
      font-size: 1.2rem;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .cta-button.bhyross {
      background: #8B4513;
      color: white;
    }

    .cta-button.bhyross:hover {
      background: #A0522D;
      transform: translateY(-2px);
    }

    .products-section {
      padding: 4rem 2rem;
      background: #f8f8f8;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      font-weight: bold;
    }

    .section-title.bhyross {
      color: #8B4513;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-5px);
    }

    .product-image {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .product-name {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .product-price {
      font-size: 1.3rem;
      font-weight: bold;
    }

    .product-price.bhyross {
      color: #8B4513;
    }

    .collection-showcase {
      padding: 4rem 2rem;
      background: white;
    }

    .collection-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .collection-text h2 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      color: #8B4513;
    }

    .collection-text p {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      color: #666;
    }

    .collection-stats {
      display: flex;
      gap: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .stat-number.bhyross {
      color: #8B4513;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
    }

    .collection-image {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .process-section {
      padding: 4rem 2rem;
      background: #f8f8f8;
    }

    .process-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .process-step {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .process-number {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      margin: 0 auto 1rem;
    }

    .process-number.bhyross {
      background: #8B4513;
    }

    .process-step h3 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .process-step p {
      color: #666;
      line-height: 1.6;
    }

    .testimonials-section {
      padding: 4rem 2rem;
      background: white;
    }

    .testimonials-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .testimonial-card {
      background: #f8f8f8;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .stars {
      color: #FFD700;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .testimonial-quote {
      font-style: italic;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .author-avatar {
      font-size: 2rem;
    }

    .author-info h4 {
      margin-bottom: 0.2rem;
      color: #333;
    }

    .author-info p {
      color: #666;
      font-size: 0.9rem;
    }

    .why-section {
      padding: 4rem 2rem;
      background: #f8f8f8;
    }

    .why-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .why-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .why-item {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .why-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .why-icon.bhyross {
      color: #8B4513;
    }

    .why-title {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .why-description {
      color: #666;
      line-height: 1.6;
    }

    .newsletter-section {
      padding: 4rem 2rem;
      background: #8B4513;
      color: white;
      text-align: center;
    }

    .newsletter-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .newsletter-subtitle {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .newsletter-form {
      display: flex;
      gap: 1rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .newsletter-input {
      flex: 1;
      padding: 0.8rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
    }

    .newsletter-btn {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s ease;
    }

    .newsletter-btn.bhyross {
      background: #A0522D;
      color: white;
    }

    .newsletter-btn.bhyross:hover {
      background: #CD853F;
    }

    .footer {
      background: #333;
      color: white;
      padding: 3rem 2rem 1rem;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .footer-section h3 {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .footer-section.bhyross h3 {
      color: #8B4513;
    }

    .footer-links {
      list-style: none;
      padding: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-links a {
      color: #ccc;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: white;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    .social-link {
      font-size: 1.5rem;
      text-decoration: none;
      transition: transform 0.3s ease;
    }

    .social-link:hover {
      transform: scale(1.2);
    }

    .footer-bottom {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #555;
      text-align: center;
      color: #ccc;
    }

    @media (max-width: 768px) {
      .choice-container {
        flex-direction: column;
        gap: 2rem;
      }
      
      .brand-button {
        width: 250px;
        height: 300px;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .collection-content {
        grid-template-columns: 1fr;
      }
      
      .newsletter-form {
        flex-direction: column;
      }
      
      .collection-stats {
        justify-content: center;
      }
    }
  `;
  // Render dual landing or brand landing
  return (
    <>
      <style>{styles}</style>
      
      {brand === 'dual' && (
        <section id="dual-landing" className="dual-landing">
            
          <div className="choice-container">
            <button
              className="brand-button bhyross"
              onMouseEnter={() => handleMouseEnter(bhyrossVideo)}
              onMouseLeave={() => handleMouseLeave(bhyrossVideo)}
              onClick={() => setBrand('bhyross')}
              aria-label="Explore Bhyross premium shoe collection"
            >
              <video
                ref={bhyrossVideo}
                className="video-background"
                muted
                loop
              >
                <source src="https://placeholder-video-url/bhyross-craftsmanship.mp4" type="video/mp4" />
              </video>
              <span className="button-text">Explore Bhyross</span>
            </button>

            <button
              className="brand-button dee-codes"
              onMouseEnter={() => handleMouseEnter(deeCodesVideo)}
              onMouseLeave={() => handleMouseLeave(deeCodesVideo)}
              onClick={() => setBrand('dee')}
              aria-label="Explore Dee Codes lifestyle shoe collection"
            >
              <video
                ref={deeCodesVideo}
                className="video-background"
                muted
                loop
              >
                <source src="https://placeholder-video-url/dee-codes-lifestyle.mp4" type="video/mp4" />
              </video>
              <span className="button-text">Explore Dee Codes</span>
            </button>
          </div>
        </section>
      )}

      {brand === 'bhyross' && (
        
        <div id="bhyross-landing" className="brand-landing">
            
            
          <header className="header">
            <Navigation brand="bhyross" />
            <a href="#" className="logo bhyross">BHYROSS</a>
            <a className="home-button" onClick={() => setBrand('dual')}>Home</a>
          </header>
          

          <section className="hero">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Premium leather craftsmanship" className="hero-background" />
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1 className="hero-title">Crafted Excellence</h1>
              <p className="hero-subtitle">Where luxury meets artisanal precision in every step</p>
              <a href="#" className="cta-button bhyross">Shop Now</a>
            </div>
          </section>

          <section className="products-section">
            <h2 className="section-title bhyross">Featured Collection</h2>
            <div className="products-grid">
              <div className="product-card">
                <div className="product-image">👞</div>
                <div className="product-info">
                  <h3 className="product-name">Executive Oxford</h3>
                  <p className="product-price bhyross">$489</p>
                </div>
              </div>
              <div className="product-card">
                <div className="product-image">👞</div>
                <div className="product-info">
                  <h3 className="product-name">Heritage Brogue</h3>
                  <p className="product-price bhyross">$529</p>
                </div>
              </div>
              <div className="product-card">
                <div className="product-image">👞</div>
                <div className="product-info">
                  <h3 className="product-name">Milano Loafer</h3>
                  <p className="product-price bhyross">$399</p>
                </div>
              </div>
              <div className="product-card">
                <div className="product-image">👞</div>
                <div className="product-info">
                  <h3 className="product-name">Windsor Boot</h3>
                  <p className="product-price bhyross">$649</p>
                </div>
              </div>
              <div className="product-card">
                <div className="product-image">👞</div>
                <div className="product-info">
                  <h3 className="product-name">Gentleman Derby</h3>
                  <p className="product-price bhyross">$459</p>
                </div>
              </div>
              <div className="product-card">
                <div className="product-image">👞</div>
                <div className="product-info">
                  <h3 className="product-name">Royal Monk Strap</h3>
                  <p className="product-price bhyross">$579</p>
                </div>
              </div>
            </div>
          </section>

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
                      {categories.map((category, index) => (
                        <Link key={category.path} to={`/bhyross/${category.path}`}>
                          <Card className="group overflow-hidden hover-lift">
                            <div className="relative">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
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
                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-quote">"The quality is absolutely exceptional. These shoes have transformed my professional wardrobe and the comfort is unmatched."</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">👤</div>
                    <div className="author-info">
                      <h4>James Morrison</h4>
                      <p>Investment Banker</p>
                    </div>
                  </div>
                </div>
                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-quote">"I've owned luxury shoes from many brands, but Bhyross stands apart. The attention to detail is extraordinary."</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">👤</div>
                    <div className="author-info">
                      <h4>Michael Chen</h4>
                      <p>Fashion Editor</p>
                    </div>
                  </div>
                </div>
                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-quote">"Worth every penny. The craftsmanship is visible in every stitch, and they've aged beautifully over the years."</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">👤</div>
                    <div className="author-info">
                      <h4>Robert Davies</h4>
                      <p>CEO</p>
                    </div>
                  </div>
                </div>
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
      )}

      {brand === 'dee' && (
        <div id="dee-codes-landing" className="brand-landing">
          <header className="header">
            <a href="#" className="logo dee">DEE CODES</a>
            <a className="home-button" onClick={() => setBrand('dual')}>Home</a>
          </header>
          
          <section className="hero">
            <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Modern lifestyle shoes" className="hero-background" />
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1 className="hero-title">Code Your Style</h1>
              <p className="hero-subtitle">Where modern lifestyle meets digital innovation</p>
              <a href="#" className="cta-button dee">Discover Now</a>
            </div>
          </section>
          
          {/* Add more Dee Codes sections here following the same pattern as Bhyross */}
        </div>
      )}
    </>
  );
};

export default HomePage;
