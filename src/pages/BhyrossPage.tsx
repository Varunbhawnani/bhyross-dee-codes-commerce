
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Award, Shield, Truck } from 'lucide-react';

const BhyrossPage = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation brand="bhyross" />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-bhyross-50 to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                <span className="brand-bhyross">Bhyross</span>
                <br />
                <span className="text-neutral-700">Premium Footwear</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Discover the art of traditional shoemaking. Each Bhyross shoe is meticulously crafted 
                using time-honored techniques and the finest materials from around the world.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-bhyross-500 hover:bg-bhyross-600">
                  Shop Collection
                </Button>
                <Button size="lg" variant="outline">
                  Our Story
                </Button>
              </div>
            </div>
            
            <div className="relative animate-scale-in animation-delay-200">
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center"
                alt="Bhyross Premium Shoe"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose Bhyross
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Experience the difference that premium materials and expert craftsmanship make
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <feature.icon className="h-12 w-12 text-bhyross-500 mx-auto mb-4" />
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
      <section className="py-16 bg-gradient-to-br from-neutral-50 to-bhyross-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Explore Our Collections
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              From classic Oxfords to modern Loafers, find the perfect style for every occasion
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={category.path} to={`/bhyross/${category.path}`}>
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

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Bhyross for their formal footwear needs
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

export default BhyrossPage;
