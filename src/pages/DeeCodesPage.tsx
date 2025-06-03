
import React from 'react';
import Navigation from '@/components/Navigation';
import BannerCarousel from '@/components/BannerCarousel';
import FeaturedCollections from '@/components/FeaturedCollections';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DeeCodesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="deecodes" />
      
      {/* Banner Carousel */}
      <BannerCarousel brand="deecodes" />

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/deecodes/oxford" className="group">
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
            <Link to="/deecodes/derby" className="group">
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
            <Link to="/deecodes/monk-strap" className="group">
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
            <Link to="/deecodes/loafer" className="group">
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
      <FeaturedCollections brand="deecodes" />

      {/* About Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Modern Comfort Meets Style</h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-8">
            Dee Codes brings you contemporary footwear designed for the modern lifestyle. 
            Our collection combines innovative comfort technology with stylish designs 
            that work seamlessly from office to weekend.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💫</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Design</h3>
              <p className="text-neutral-600">Contemporary styles for today's lifestyle</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comfort Technology</h3>
              <p className="text-neutral-600">Advanced comfort features for all-day wear</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainable</h3>
              <p className="text-neutral-600">Environmentally conscious manufacturing</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DeeCodesPage;
