
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LandingPage = () => {
  const [hoveredBrand, setHoveredBrand] = useState<'bhyross' | 'deecodes' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/5 to-neutral-600/10" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-bhyross-500/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-deecodes-500/10 rounded-full blur-xl animate-float animation-delay-400" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6">
            <span className="brand-bhyross">Bhyross</span>
            <span className="text-neutral-400 mx-4">&</span>
            <span className="brand-deecodes">Dee Codes</span>
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Where <span className="font-semibold text-bhyross-600">premium craftsmanship</span> meets{' '}
            <span className="font-semibold text-deecodes-600">affordable excellence</span> in formal footwear
          </p>
        </div>

        {/* Brand Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* Bhyross Card */}
          <Card
            className={`group relative overflow-hidden cursor-pointer transition-all duration-700 hover-lift ${
              hoveredBrand === 'bhyross' ? 'scale-105' : hoveredBrand ? 'scale-95 opacity-75' : ''
            }`}
            onMouseEnter={() => setHoveredBrand('bhyross')}
            onMouseLeave={() => setHoveredBrand(null)}
          >
            <div className="p-8 sm:p-12 min-h-[400px] flex flex-col justify-between relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-bhyross-50 to-bhyross-100/30" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-bhyross-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold brand-bhyross mb-4">
                    Bhyross
                  </h2>
                  <p className="text-lg text-neutral-600 mb-6">
                    Premium craftsmanship for the discerning gentleman. Each shoe is a masterpiece of traditional techniques and modern design.
                  </p>
                  
                  <div className="space-y-3 text-sm text-neutral-700">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-bhyross-500 rounded-full mr-3" />
                      <span>Hand-stitched construction</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-bhyross-500 rounded-full mr-3" />
                      <span>Premium Italian leather</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-bhyross-500 rounded-full mr-3" />
                      <span>Goodyear welted soles</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-2xl font-bold text-neutral-900">
                    Starting from ₹15,999
                  </div>
                  
                  <Link to="/bhyross" className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-bhyross-500 to-bhyross-600 hover:from-bhyross-600 hover:to-bhyross-700 text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-bhyross-500/25"
                      size="lg"
                    >
                      Explore Bhyross
                      <div className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Dee Codes Card */}
          <Card
            className={`group relative overflow-hidden cursor-pointer transition-all duration-700 hover-lift ${
              hoveredBrand === 'deecodes' ? 'scale-105' : hoveredBrand ? 'scale-95 opacity-75' : ''
            }`}
            onMouseEnter={() => setHoveredBrand('deecodes')}
            onMouseLeave={() => setHoveredBrand(null)}
          >
            <div className="p-8 sm:p-12 min-h-[400px] flex flex-col justify-between relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-deecodes-50 to-deecodes-100/30" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-deecodes-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold brand-deecodes mb-4">
                    Dee Codes
                  </h2>
                  <p className="text-lg text-neutral-600 mb-6">
                    Exceptional value without compromise. Modern design meets reliable quality for the contemporary professional.
                  </p>
                  
                  <div className="space-y-3 text-sm text-neutral-700">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-deecodes-500 rounded-full mr-3" />
                      <span>Durable construction</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-deecodes-500 rounded-full mr-3" />
                      <span>Quality synthetic materials</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-deecodes-500 rounded-full mr-3" />
                      <span>Comfortable daily wear</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-2xl font-bold text-neutral-900">
                    Starting from ₹2,999
                  </div>
                  
                  <Link to="/deecodes" className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-deecodes-500 to-deecodes-600 hover:from-deecodes-600 hover:to-deecodes-700 text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-deecodes-500/25"
                      size="lg"
                    >
                      Explore Dee Codes
                      <div className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Message */}
        <div className="mt-16 text-center animate-fade-in animation-delay-600">
          <p className="text-neutral-500 text-sm">
            Crafted with passion, designed for excellence
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
