import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-stone-50 to-gray-50">
      {/* Background Videos */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            hoveredBrand === 'bhyross' ? 'opacity-30' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-900/20 to-orange-800/20" />
        </div>
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            hoveredBrand === 'deecodes' ? 'opacity-30' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-indigo-800/20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Premium
            </span>
            <span className="mx-4 text-slate-700">&</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Affordable
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 mb-12 leading-relaxed">
            Discover exceptional formal footwear crafted for every occasion and budget
          </p>

          {/* Brand Selection Buttons */}
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {/* Bhyross Button */}
            <button
              onMouseEnter={() => setHoveredBrand('bhyross')}
              onMouseLeave={() => setHoveredBrand(null)}
              onClick={() => handleNavigation('/bhyross')}
              className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-12 py-6 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25"
            >
              <div className="relative z-10 flex items-center space-x-4">
                <div className="text-left">
                  <h3 className="text-2xl font-bold">Explore Bhyross</h3>
                  <p className="text-amber-100 text-sm">Premium Craftsmanship</p>
                </div>
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            {/* Dee Codes Button */}
            <button
              onMouseEnter={() => setHoveredBrand('deecodes')}
              onMouseLeave={() => setHoveredBrand(null)}
              onClick={() => handleNavigation('/deecodes')}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-12 py-6 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              <div className="relative z-10 flex items-center space-x-4">
                <div className="text-left">
                  <h3 className="text-2xl font-bold">Explore Dee Codes</h3>
                  <p className="text-blue-100 text-sm">Value & Durability</p>
                </div>
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;