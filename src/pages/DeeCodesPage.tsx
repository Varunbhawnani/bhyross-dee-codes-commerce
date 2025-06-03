
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const DeeCodesPage = () => {
  const categories = [
    {
      name: 'Oxford',
      path: 'oxford',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center',
      description: 'Professional formal shoes'
    },
    {
      name: 'Derby',
      path: 'derby',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop&crop=center',
      description: 'Versatile everyday footwear'
    },
    {
      name: 'Monk Strap',
      path: 'monk-strap',
      image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop&crop=center',
      description: 'Modern buckle-style shoes'
    },
    {
      name: 'Loafer',
      path: 'loafer',
      image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=300&fit=crop&crop=center',
      description: 'Comfortable slip-on design'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="deecodes" />
      
      <BannerCarousel brand="deecodes" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Dee Codes Collection
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Affordable elegance meets contemporary design. Discover our range of stylish footwear crafted for the modern professional.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.path} to={`/deecodes/${category.path}`}>
              <Card className="group overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-neutral-900">
                      {category.name}
                    </h3>
                    <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-deecodes-600 transition-colors" />
                  </div>
                  <p className="text-neutral-600 text-sm">
                    {category.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Brand Story Section */}
        <div className="mt-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              The Dee Codes Story
            </h2>
            <p className="text-lg text-neutral-600 mb-6">
              Dee Codes represents the perfect balance between quality and affordability. We believe that exceptional footwear should be accessible to everyone, without compromising on style or comfort.
            </p>
            <p className="text-lg text-neutral-600 mb-8">
              Our modern manufacturing techniques combined with carefully selected materials ensure that each pair delivers lasting value and contemporary appeal for today's dynamic lifestyle.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center text-deecodes-600 font-semibold hover:text-deecodes-700 transition-colors"
            >
              Learn More About Our Mission
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center"
              alt="Dee Codes manufacturing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <Footer brand="deecodes" />
    </div>
  );
};

export default DeeCodesPage;
