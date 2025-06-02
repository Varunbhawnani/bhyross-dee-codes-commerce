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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Floating Elements for Premium Feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 animate-bounce" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-100 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '6s' }} />
      </div>

      {/* Background Overlay Effects */}
      <div className="absolute inset-0 transition-all duration-700">
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            hoveredBrand === 'bhyross' ? 'opacity-10' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-200/30 to-orange-300/30" />
        </div>
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            hoveredBrand === 'deecodes' ? 'opacity-10' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-200/30 to-blue-300/30" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Trust Badges */}
          <div className={`flex justify-center items-center gap-6 mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-800">Trusted Quality</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
              <Award className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-800">Premium Craft</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-800">5.0 Rating</span>
            </div>
          </div>

          {/* Main Title with Professional Typography */}
          <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight ${isLoaded ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Premium
            </span>
            <span className="mx-4 text-gray-600">&</span>
            <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              Affordable
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-medium ${isLoaded ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
            Discover exceptional formal footwear crafted for every occasion and budget
          </p>

         {/* Professional Feature Cards - FIXED FOR VISIBILITY */}
<div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 ${isLoaded ? 'animate-fade-in-up animation-delay-600' : 'opacity-0'}`}>
  <div className="stagger-item stagger-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 card-hover shadow-lg">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 mx-auto">
      <Shield className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-2 text-center">Quality Assurance</h3>
    <p className="text-gray-700 text-sm text-center">Rigorous quality control ensures every pair meets our premium standards</p>
  </div>
  <div className="stagger-item stagger-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 card-hover shadow-lg">
    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center mb-4 mx-auto">
      <Award className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-2 text-center">Expert Craftsmanship</h3>
    <p className="text-gray-700 text-sm text-center">Handcrafted by skilled artisans with decades of experience</p>
  </div>
  <div className="stagger-item stagger-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 card-hover shadow-lg">
    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mb-4 mx-auto">
      <Star className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-2 text-center">Customer Satisfaction</h3>
    <p className="text-gray-700 text-sm text-center">Over 10,000 satisfied customers worldwide trust our quality</p>
  </div>
</div>

          {/* Brand Selection Buttons with Modern Interactions */}
          <div className={`flex flex-col lg:flex-row gap-8 items-center justify-center ${isLoaded ? 'animate-scale-in animation-delay-800' : 'opacity-0'}`}>
            {/* Bhyross Button */}
            <button
              onMouseEnter={() => setHoveredBrand('bhyross')}
              onMouseLeave={() => setHoveredBrand(null)}
              onClick={() => handleNavigation('/bhyross')}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 text-white px-12 py-8 rounded-3xl btn-professional shine-effect shadow-xl hover:shadow-2xl min-w-[300px] transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-1">Explore Bhyross</h3>
                  <p className="text-orange-100 text-sm font-medium">Premium Craftsmanship</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-200 text-orange-200" />
                    ))}
                    <span className="text-orange-200 text-xs ml-2">4.9/5.0</span>
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
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white px-12 py-8 rounded-3xl btn-professional shine-effect shadow-xl hover:shadow-2xl min-w-[300px] transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-1">Explore Dee Codes</h3>
                  <p className="text-blue-100 text-sm font-medium">Value & Durability</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-blue-200 text-blue-200" />
                    ))}
                    <span className="text-blue-200 text-xs ml-2">4.8/5.0</span>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-2 group-hover:scale-110" />
              </div>
            </button>
          </div>

          {/* Trust Elements */}
          <div className={`mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500 ${isLoaded ? 'animate-fade-in animation-delay-1000' : 'opacity-0'}`}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Secure Shopping</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Quality Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Rated Excellence</span>
            </div>
          </div>
        </div>

        {/* Refined Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center opacity-60">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>

      <style >{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-scale-in { animation: scale-in 0.5s ease-out; }

        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }

        .stagger-item {
          opacity: 0;
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .btn-professional {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-professional:active {
          transform: translateY(0);
          transition: all 0.1s;
        }

        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shine 0.6s ease-in-out;
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Index;
