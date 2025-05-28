
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Zap, DollarSign } from 'lucide-react';

const DeeCodesPage = () => {
  const categories = [
    {
      name: 'Oxford',
      path: 'oxford',
      description: 'Professional style at an affordable price',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Derby',
      path: 'derby',
      description: 'Versatile everyday formal shoes',
      image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Monk Strap',
      path: 'monk-strap',
      description: 'Modern buckle design with contemporary appeal',
      image: 'https://images.unsplash.com/photo-1571245078683-3bbf52d98bf6?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Loafer',
      path: 'loafer',
      description: 'Comfortable slip-on style for daily wear',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center'
    }
  ];

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

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="deecodes" />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-deecodes-50 to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                <span className="brand-deecodes">Dee Codes</span>
                <br />
                <span className="text-neutral-700">Smart Value</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Quality formal footwear that fits your budget. Modern design meets reliable 
                construction for the smart shopper who values both style and savings.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-deecodes-500 hover:bg-deecodes-600">
                  Shop Collection
                </Button>
                <Button size="lg" variant="outline">
                  Why Choose Us
                </Button>
              </div>
            </div>
            
            <div className="relative animate-scale-in animation-delay-200">
              <img
                src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop&crop=center"
                alt="Dee Codes Quality Shoe"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
              <div className="absolute top-6 right-6 bg-deecodes-500 text-white px-4 py-2 rounded-full font-semibold">
                Starting ₹2,999
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Smart Choice for Smart Shoppers
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Get the quality you deserve without the premium price tag
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <feature.icon className="h-12 w-12 text-deecodes-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-neutral-50 to-deecodes-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Find Your Perfect Style
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Professional looks for every occasion, all at prices that make sense
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={category.path} to={`/deecodes/${category.path}`}>
                <Card className="group overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-deecodes-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Quality You Can Trust, Prices You'll Love
          </h2>
          <p className="text-xl text-deecodes-100 mb-8 max-w-3xl mx-auto">
            Don't compromise on style or comfort. Our shoes undergo rigorous quality testing 
            to ensure they meet the highest standards while keeping costs reasonable.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div>
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-deecodes-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-deecodes-100">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1 Year</div>
              <div className="text-deecodes-100">Quality Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Loved by Customers Everywhere
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              See why thousands choose Dee Codes for their formal footwear needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                  <div className="text-sm text-neutral-500">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeeCodesPage;
