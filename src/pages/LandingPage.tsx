
import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Award, Star } from 'lucide-react';

const Index = () => {
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-trust-50 via-white to-trust-100">
      {/* Floating Elements for Premium Feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-professional-100 rounded-full opacity-20 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-warm-100 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Background Overlay Effects */}
      <div className="absolute inset-0 transition-all duration-700">
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            hoveredBrand === 'bhyross' ? 'opacity-10' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-warm-200/30 to-warm-300/30" />
        </div>
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            hoveredBrand === 'deecodes' ? 'opacity-10' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-professional-200/30 to-professional-300/30" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Trust Badges */}
          <div className={`flex justify-center items-center gap-6 mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-success-600" />
              <span className="text-sm font-medium text-trust-700">Trusted Quality</span>
            </div>
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
              <Award className="w-4 h-4 text-warm-600" />
              <span className="text-sm font-medium text-trust-700">Premium Craft</span>
            </div>
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warm-400 text-warm-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-trust-700">5.0 Rating</span>
            </div>
          </div>

          {/* Main Title with Professional Typography */}
          <h1 className={`text-5xl md:text-7xl font-bold text-trust-900 mb-6 tracking-tight leading-tight ${isLoaded ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
            <span className="bg-gradient-to-r from-professional-600 to-professional-800 bg-clip-text text-transparent">
              Premium
            </span>
            <span className="mx-4 text-trust-600">&</span>
            <span className="bg-gradient-to-r from-warm-600 to-warm-800 bg-clip-text text-transparent">
              Affordable
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl text-trust-600 mb-12 leading-relaxed font-medium ${isLoaded ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
            Discover exceptional formal footwear crafted for every occasion and budget
          </p>

          {/* Professional Feature Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 ${isLoaded ? 'animate-fade-in-up animation-delay-600' : 'opacity-0'}`}>
            <div className="stagger-item stagger-1 glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-gradient-professional rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-trust-800 mb-2">Quality Assurance</h3>
              <p className="text-trust-600 text-sm">Rigorous quality control ensures every pair meets our premium standards</p>
            </div>
            <div className="stagger-item stagger-2 glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-gradient-warm rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-trust-800 mb-2">Expert Craftsmanship</h3>
              <p className="text-trust-600 text-sm">Handcrafted by skilled artisans with decades of experience</p>
            </div>
            <div className="stagger-item stagger-3 glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-gradient-trust rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-trust-800 mb-2">Customer Satisfaction</h3>
              <p className="text-trust-600 text-sm">Over 10,000 satisfied customers worldwide trust our quality</p>
            </div>
          </div>

          {/* Brand Selection Buttons with Modern Interactions */}
          <div className={`flex flex-col lg:flex-row gap-8 items-center justify-center ${isLoaded ? 'animate-scale-in animation-delay-800' : 'opacity-0'}`}>
            {/* Bhyross Button */}
            <button
              onMouseEnter={() => setHoveredBrand('bhyross')}
              onMouseLeave={() => setHoveredBrand(null)}
              onClick={() => handleNavigation('/bhyross')}
              className="group relative overflow-hidden bg-gradient-warm text-white px-12 py-8 rounded-3xl btn-professional shine-effect shadow-xl hover:shadow-2xl min-w-[300px]"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-1">Explore Bhyross</h3>
                  <p className="text-warm-100 text-sm font-medium">Premium Craftsmanship</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warm-200 text-warm-200" />
                    ))}
                    <span className="text-warm-200 text-xs ml-2">4.9/5.0</span>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-2 group-hover:scale-110" />
              </div>
            </button>

            {/* Dee Codes Button */}
            <button
              onMouseEnter={() => setHoveredBrand('deecodes')}
              onMouseLeave={() => setHoveredBrand(null)}
              onClick={() => handleNavigation('/deecodes')}
              className="group relative overflow-hidden bg-gradient-professional text-white px-12 py-8 rounded-3xl btn-professional shine-effect shadow-xl hover:shadow-2xl min-w-[300px]"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-1">Explore Dee Codes</h3>
                  <p className="text-professional-100 text-sm font-medium">Value & Durability</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-professional-200 text-professional-200" />
                    ))}
                    <span className="text-professional-200 text-xs ml-2">4.8/5.0</span>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-2 group-hover:scale-110" />
              </div>
            </button>
          </div>

          {/* Trust Elements */}
          <div className={`mt-16 flex flex-wrap justify-center items-center gap-8 text-trust-500 ${isLoaded ? 'animate-fade-in animation-delay-1000' : 'opacity-0'}`}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success-600" />
              <span className="text-sm font-medium">Secure Shopping</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-warm-600" />
              <span className="text-sm font-medium">Quality Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-professional-600" />
              <span className="text-sm font-medium">Rated Excellence</span>
            </div>
          </div>
        </div>

        {/* Refined Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-trust-300 rounded-full flex justify-center opacity-60">
            <div className="w-1 h-3 bg-trust-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
