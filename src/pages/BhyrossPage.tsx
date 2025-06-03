
import React from 'react';
import Navigation from '@/components/Navigation';
import BannerCarousel from '@/components/BannerCarousel';
import FeaturedCollections from '@/components/FeaturedCollections';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BhyrossPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="bhyross" />
      
      {/* Banner Carousel */}
      <BannerCarousel brand="bhyross" />

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/bhyross/oxford" className="group">
              <div className="bg-neutral-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop"
                  alt="Oxford Collection"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold">Oxford</h3>
                </div>
              </div>
            </Link>
            <Link to="/bhyross/derby" className="group">
              <div className="bg-neutral-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop"
                  alt="Derby Collection"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold">Derby</h3>
                </div>
              </div>
            </Link>
            <Link to="/bhyross/monk-strap" className="group">
              <div className="bg-neutral-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop"
                  alt="Monk Strap Collection"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold">Monk Strap</h3>
                </div>
              </div>
            </Link>
            <Link to="/bhyross/loafer" className="group">
              <div className="bg-neutral-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1533563906091-fdfdffc3e3c4?w=400&h=300&fit=crop"
                  alt="Loafer Collection"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold">Loafer</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <FeaturedCollections brand="bhyross" />

      {/* About Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Crafted with Excellence</h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-8">
            Bhyross represents the pinnacle of Italian craftsmanship, combining traditional techniques 
            with contemporary design. Each pair is meticulously handcrafted using the finest materials 
            to create footwear that embodies both luxury and comfort.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👑</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Materials</h3>
              <p className="text-neutral-600">Only the finest Italian leather and materials</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Handcrafted</h3>
              <p className="text-neutral-600">Each pair meticulously crafted by skilled artisans</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Timeless Design</h3>
              <p className="text-neutral-600">Classic styles that never go out of fashion</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BhyrossPage;
