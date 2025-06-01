import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Star, CheckCircle2 } from 'lucide-react';

const ModernLandingPage = () => {
  const [hoveredBrand, setHoveredBrand] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 relative overflow-hidden">
      {/* Simple Background Elements - No mouse tracking */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-slate-200/20 to-gray-200/20 rounded-full blur-3xl top-10 left-10 animate-pulse" />
        <div className="absolute w-80 h-80 bg-gradient-to-r from-amber-100/30 to-orange-100/30 rounded-full blur-3xl bottom-10 right-10 animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600 mb-6">
              <Shield className="w-4 h-4 mr-2 text-slate-500" />
              Premium Formal Footwear Since 2020
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              <span className="brand-bhyross-modern">Bhyross</span>
              <span className="text-slate-300 mx-4 font-light">&</span>
              <span className="brand-deecodes-modern">Dee Codes</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Where <span className="font-semibold text-amber-700">artisan craftsmanship</span> meets{' '}
              <span className="font-semibold text-slate-700">contemporary excellence</span> in professional footwear
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              Premium Materials
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              Expert Craftsmanship
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              Professional Quality
            </div>
          </div>
        </div>

        {/* Brand Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* Bhyross Card */}
          <div
            className={`group relative cursor-pointer transition-all duration-500 hover:scale-105 ${
              hoveredBrand === 'bhyross' ? '' : hoveredBrand ? 'opacity-80' : ''
            } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setHoveredBrand('bhyross')}
            onMouseLeave={() => setHoveredBrand(null)}
          >
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-500 border border-slate-200/50">
              {/* Simple Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl" />

              <div className="relative p-8 sm:p-10 min-h-[450px] flex flex-col justify-between">
                {/* Brand Header */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center px-3 py-1 bg-amber-100 rounded-full text-xs font-medium text-amber-800">
                      <Award className="w-3 h-3 mr-1" />
                      Premium Collection
                    </div>
                    <div className="flex items-center text-amber-600">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold brand-bhyross-modern mb-4">
                    Bhyross
                  </h2>
                  
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Exquisite craftsmanship for the distinguished professional. Every pair represents decades of traditional bootmaking expertise.
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-4" />
                      <span className="text-slate-700 font-medium">Hand-stitched Italian leather</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-4" />
                      <span className="text-slate-700 font-medium">Goodyear welt construction</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-4" />
                      <span className="text-slate-700 font-medium">Premium comfort technology</span>
                    </div>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="space-y-6">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold text-slate-900">₹15,999</span>
                      <span className="text-slate-500 ml-2">onwards</span>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      Free delivery
                    </div>
                  </div>
                  
                  <Link to="/bhyross" className="block">
                    <button className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg group/btn">
                      <span className="flex items-center justify-center">
                        Explore Bhyross Collection
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Dee Codes Card */}
          <div
            className={`group relative cursor-pointer transition-all duration-500 hover:scale-105 ${
              hoveredBrand === 'deecodes' ? '' : hoveredBrand ? 'opacity-80' : ''
            } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setHoveredBrand('deecodes')}
            onMouseLeave={() => setHoveredBrand(null)}
          >
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-500 border border-slate-200/50">
              {/* Simple Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-50/30" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200/20 to-gray-200/20 rounded-full blur-2xl" />

              <div className="relative p-8 sm:p-10 min-h-[450px] flex flex-col justify-between">
                {/* Brand Header */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Value Collection
                    </div>
                    <div className="flex items-center text-slate-600">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                      <Star className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold brand-deecodes-modern mb-4">
                    Dee Codes
                  </h2>
                  
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Smart value for the modern professional. Quality construction and contemporary design at an accessible price point.
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full mr-4" />
                      <span className="text-slate-700 font-medium">Durable synthetic materials</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full mr-4" />
                      <span className="text-slate-700 font-medium">Modern comfort design</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full mr-4" />
                      <span className="text-slate-700 font-medium">Professional appearance</span>
                    </div>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="space-y-6">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold text-slate-900">₹2,999</span>
                      <span className="text-slate-500 ml-2">onwards</span>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      Free delivery
                    </div>
                  </div>
                  
                  <Link to="/deecodes" className="block">
                    <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg group/btn">
                      <span className="flex items-center justify-center">
                        Explore Dee Codes Collection
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div 
          className={`mt-16 text-center transition-all duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-slate-500 text-sm font-medium">
            Crafted with precision • Designed for professionals • Built to last
          </p>
        </div>
      </div>

      <style>
        {`
        .brand-bhyross-modern {
          background: linear-gradient(135deg, #92400e 0%, #b45309 50%, #a3450a 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .brand-deecodes-modern {
          background: linear-gradient(135deg, #1e293b 0%, #374151 50%, #334155 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        `}
      </style>
    </div>
  );
};

export default ModernLandingPage;