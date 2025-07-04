import React, { useState, useEffect } from 'react';
import { ArrowRight, Crown, Target, Sparkles, Star, Circle, Triangle, Square } from 'lucide-react';

const InteractiveBrandShowcase = ({ brandInfo }) => {
  const [hoveredBrand, setHoveredBrand] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingElements, setFloatingElements] = useState([]);

  // Generate floating elements for background animation
  useEffect(() => {
    const elements = [];
    for (let i = 0; i < 20; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 4,
        duration: Math.random() * 6 + 4,
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)]
      });
    }
    setFloatingElements(elements);
  }, []);

  const handleMouseMove = (e, brand) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const FloatingShape = ({ element }) => {
    const ShapeComponent = element.shape === 'circle' ? Circle : 
                          element.shape === 'square' ? Square : Triangle;
    
    return (
      <div
        className="absolute opacity-5 animate-pulse"
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          animationDelay: `${element.delay}s`,
          animationDuration: `${element.duration}s`,
        }}
      >
        <ShapeComponent 
          size={element.size} 
          className="text-gray-400"
          style={{
            animation: `float ${element.duration}s ease-in-out infinite`,
            animationDelay: `${element.delay}s`
          }}
        />
      </div>
    );
  };

  return (
    <div className="relative py-16 bg-white overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((element) => (
          <FloatingShape key={element.id} element={element} />
        ))}
      </div>

      {/* Main Grid Lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full grid grid-cols-12 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-gray-200 h-full"></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 font-cornerstone">
            Our Distinguished Brands
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto font-signika leading-relaxed">
            Two unique philosophies, one unwavering commitment to excellence. Each brand represents 
            a distinct approach to formal footwear, crafted for different aspects of your professional journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Bhyross Brand Card */}
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredBrand('bhyross')}
            onMouseLeave={() => setHoveredBrand(null)}
            onMouseMove={(e) => handleMouseMove(e, 'bhyross')}
          >
            {/* Magnetic Effect Container */}
            <div className="relative transform transition-all duration-500 ease-out group-hover:scale-105">
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shadow Layers */}
              <div className="absolute inset-0 rounded-2xl bg-black/5 transform translate-x-2 translate-y-2 transition-all duration-500 group-hover:translate-x-4 group-hover:translate-y-4"></div>
              <div className="absolute inset-0 rounded-2xl bg-black/10 transform translate-x-1 translate-y-1 transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
              
              {/* Main Card */}
              <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Brand Color Accent */}
                <div 
                  className="absolute top-0 left-0 w-full h-1 opacity-80 transition-all duration-500"
                  style={{ backgroundColor: brandInfo.bhyross.color }}
                ></div>
                
                {/* Interactive Gradient Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${brandInfo.bhyross.color} 0%, transparent 50%)`
                  }}
                ></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <Crown size={24} style={{ color: brandInfo.bhyross.color }} />
                </div>
                
                {/* Animated Lines */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse"></div>
                  <div className="absolute bottom-8 right-8 w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                {/* Content */}
                <div className="p-12 min-h-[400px] flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                    <Crown 
                      size={40} 
                      style={{ color: brandInfo.bhyross.color }}
                      className="mx-auto mb-4 animate-pulse"
                    />
                    <h3 
                      className="text-3xl font-bold mb-3 transform group-hover:translate-y-1 transition-transform duration-500"
                      style={{ color: brandInfo.bhyross.color }}
                    >
                      {brandInfo.bhyross.name}
                    </h3>
                    <p 
                      className="text-sm font-medium mb-6 opacity-80 transform group-hover:translate-y-1 transition-transform duration-500"
                      style={{ color: brandInfo.bhyross.color }}
                    >
                      {brandInfo.bhyross.tagline}
                    </p>
                  </div>
                  
                  <div className="mb-8 transform group-hover:translate-y-2 transition-transform duration-500 delay-75">
                    <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
                      {brandInfo.bhyross.description}
                    </p>
                  </div>
                  
                  {/* Interactive Button */}
                  <div 
                    className="relative overflow-hidden group/btn cursor-pointer"
                    onClick={() => window.location.href = '/bhyross'}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: brandInfo.bhyross.color }}
                    ></div>
                    <div className="relative px-8 py-3 border-2 border-current rounded-full font-semibold transition-all duration-300 group-hover/btn:text-white"
                         style={{ 
                           color: brandInfo.bhyross.color,
                           borderColor: brandInfo.bhyross.color
                         }}>
                      <span className="flex items-center">
                        DISCOVER BHYROSS
                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {hoveredBrand === 'bhyross' && (
                    <>
                      <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: brandInfo.bhyross.color }}></div>
                      <div className="absolute top-3/4 right-1/4 w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: brandInfo.bhyross.color, animationDelay: '0.5s' }}></div>
                      <div className="absolute top-1/2 left-1/6 w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: brandInfo.bhyross.color, animationDelay: '1s' }}></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dee Codes Brand Card */}
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredBrand('deecodes')}
            onMouseLeave={() => setHoveredBrand(null)}
            onMouseMove={(e) => handleMouseMove(e, 'deecodes')}
          >
            {/* Magnetic Effect Container */}
            <div className="relative transform transition-all duration-500 ease-out group-hover:scale-105">
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shadow Layers */}
              <div className="absolute inset-0 rounded-2xl bg-black/5 transform translate-x-2 translate-y-2 transition-all duration-500 group-hover:translate-x-4 group-hover:translate-y-4"></div>
              <div className="absolute inset-0 rounded-2xl bg-black/10 transform translate-x-1 translate-y-1 transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
              
              {/* Main Card */}
              <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Brand Color Accent */}
                <div 
                  className="absolute top-0 left-0 w-full h-1 opacity-80 transition-all duration-500"
                  style={{ backgroundColor: brandInfo.deecodes.color }}
                ></div>
                
                {/* Interactive Gradient Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${brandInfo.deecodes.color} 0%, transparent 50%)`
                  }}
                ></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <Target size={24} style={{ color: brandInfo.deecodes.color }} />
                </div>
                
                {/* Animated Lines */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse"></div>
                  <div className="absolute bottom-8 right-8 w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                {/* Content */}
                <div className="p-12 min-h-[400px] flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                    <Target 
                      size={40} 
                      style={{ color: brandInfo.deecodes.color }}
                      className="mx-auto mb-4 animate-pulse"
                    />
                    <h3 
                      className="text-3xl font-bold mb-3 transform group-hover:translate-y-1 transition-transform duration-500"
                      style={{ color: brandInfo.deecodes.color }}
                    >
                      {brandInfo.deecodes.name}
                    </h3>
                    <p 
                      className="text-sm font-medium mb-6 opacity-80 transform group-hover:translate-y-1 transition-transform duration-500"
                      style={{ color: brandInfo.deecodes.color }}
                    >
                      {brandInfo.deecodes.tagline}
                    </p>
                  </div>
                  
                  <div className="mb-8 transform group-hover:translate-y-2 transition-transform duration-500 delay-75">
                    <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
                      {brandInfo.deecodes.description}
                    </p>
                  </div>
                  
                  {/* Interactive Button */}
                  <div 
                    className="relative overflow-hidden group/btn cursor-pointer"
                    onClick={() => window.location.href = '/deecodes'}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: brandInfo.deecodes.color }}
                    ></div>
                    <div className="relative px-8 py-3 border-2 border-current rounded-full font-semibold transition-all duration-300 group-hover/btn:text-white"
                         style={{ 
                           color: brandInfo.deecodes.color,
                           borderColor: brandInfo.deecodes.color
                         }}>
                      <span className="flex items-center">
                        DISCOVER DEE CODES
                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {hoveredBrand === 'deecodes' && (
                    <>
                      <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: brandInfo.deecodes.color }}></div>
                      <div className="absolute top-3/4 right-1/4 w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: brandInfo.deecodes.color, animationDelay: '0.5s' }}></div>
                      <div className="absolute top-1/2 left-1/6 w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: brandInfo.deecodes.color, animationDelay: '1s' }}></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .brand-card {
          perspective: 1000px;
        }
        
        .brand-card:hover .card-inner {
          transform: rotateX(2deg) rotateY(2deg);
        }
        
        .magnetic-effect {
          transition: transform 0.3s ease-out;
        }
        
        .magnetic-effect:hover {
          transform: translate3d(var(--mouse-x, 0), var(--mouse-y, 0), 0);
        }
      `}</style>
    </div>
  );
};

export default InteractiveBrandShowcase;