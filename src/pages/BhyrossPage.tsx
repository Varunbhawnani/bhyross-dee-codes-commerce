
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const BhyrossPage = () => {
  const categories = [
    {
      name: 'Oxford',
      path: 'oxford',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center',
      description: 'Classic formal shoes with closed lacing'
    },
    {
      name: 'Derby',
      path: 'derby',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop&crop=center',
      description: 'Versatile shoes with open lacing system'
    },
    {
      name: 'Monk Strap',
      path: 'monk-strap',
      image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop&crop=center',
      description: 'Distinguished shoes with buckle closures'
    },
    {
      name: 'Loafer',
      path: 'loafer',
      image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=300&fit=crop&crop=center',
      description: 'Slip-on shoes for comfort and style'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="bhyross" />
      
      <BannerCarousel brand="bhyross" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Bhyross Collection
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Discover our premium handcrafted leather shoes, meticulously designed for the modern gentleman who values quality and style.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.path} to={`/bhyross/${category.path}`}>
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
                    <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-bhyross-600 transition-colors" />
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
              The Bhyross Heritage
            </h2>
            <p className="text-lg text-neutral-600 mb-6">
              For over two decades, Bhyross has been synonymous with exceptional craftsmanship and timeless elegance. Each pair is meticulously handcrafted using the finest Italian leather and traditional techniques passed down through generations.
            </p>
            <p className="text-lg text-neutral-600 mb-8">
              Our commitment to quality ensures that every shoe not only looks exceptional but also provides unmatched comfort and durability, making them the perfect choice for life's most important moments.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center text-bhyross-600 font-semibold hover:text-bhyross-700 transition-colors"
            >
              Learn More About Our Story
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop&crop=center"
              alt="Bhyross craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <Footer brand="bhyross" />
    </div>
  );
};

export default BhyrossPage;
