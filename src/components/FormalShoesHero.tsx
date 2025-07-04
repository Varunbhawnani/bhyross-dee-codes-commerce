import React, { useState, useEffect, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const FormalShoesHero: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [buttonState, setButtonState] = useState<string>('Shop Collection');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  const heroRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroSection = heroRef.current;
      
      if (!heroSection) return;
      
      const heroTop = heroSection.offsetTop;
      const heroBottom = heroTop + heroSection.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress within the hero section
      const scrollIntoHero = Math.max(0, currentScrollY - heroTop);
      const progressPercent = Math.min(100, (scrollIntoHero / viewportHeight) * 100);
      
      setScrollProgress(progressPercent);
      
      // Determine scroll direction
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      setScrollDirection(direction);
      lastScrollY.current = currentScrollY;
      
      // Check if hero section is in viewport
      if (currentScrollY + viewportHeight > heroTop && currentScrollY < heroBottom) {
        const scrollProgressNormalized = scrollIntoHero / viewportHeight;
        
        if (scrollProgressNormalized > 0.1) {
          setIsActive(true);
        }
      } else {
        setIsActive(false);
      }
    };

    const handleMouseMove = (e: MouseEvent): void => {
      const heroSection = heroRef.current;
      if (!heroSection) return;
      
      const rect = heroSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        setMousePosition({ x: mouseX, y: mouseY });
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleButtonClick = (): void => {
    setButtonState('Loading...');
    setTimeout(() => {
      setButtonState('Shop Collection');
      // Add your navigation logic here
      window.location.href = '/';
    }, 600);
  };

  return (
    <div className="relative">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-black opacity-10 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main interactive section - Reduced height */}
      <section ref={heroRef} className="relative h-[120vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-100">
        <div className="sticky top-0 h-screen flex items-center justify-center">
          {/* Enhanced scroll progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-black to-gray-600 transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          
          {/* Ambient lighting effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(0,0,0,0.02) 0%, transparent 50%)`
            }}
          />
          
          <div className="flex w-[90%] max-w-[1400px] h-[80vh] items-center justify-between relative">
            {/* Enhanced Text Panel */}
            <div className={`flex-1 pr-24 z-10 transition-all duration-1000 ${
              isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            } ${scrollDirection === 'up' ? 'translate-x-5' : ''}`}>
              
              <div className={`text-sm tracking-[6px] uppercase mb-6 text-gray-600 transition-all duration-800 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                <span className="inline-block animate-pulse">✦</span> Handcrafted Excellence
              </div>
              
              <h1 className={`text-8xl font-extralight leading-none mb-8 text-black transition-all duration-800 delay-200 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                  TIMELESS<br/>
                  ELEGANCE
                </span>
              </h1>
              
              <p className={`text-xl leading-relaxed mb-10 text-gray-700 max-w-lg transition-all duration-800 delay-400 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                Discover our collection of premium formal shoes, 
                meticulously crafted by master artisans using 
                traditional techniques and the finest materials.
              </p>
              
              <div className={`grid grid-cols-2 gap-8 mb-12 transition-all duration-800 delay-600 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                {[
                  { value: '50+', label: 'Years Experience' },
                  { value: '100%', label: 'Hand Crafted' },
                  { value: 'Premium', label: 'Italian Leather' },
                  { value: '24/7', label: 'Support' }
                ].map((stat, index) => (
                  <div key={index} className="border-l-2 border-gray-300 pl-5 hover:border-black transition-colors duration-300">
                    <div className="text-3xl font-light mb-1 text-black">{stat.value}</div>
                    <div className="text-sm opacity-70 text-gray-600 uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleButtonClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group relative bg-transparent border-2 border-black text-black px-12 py-5 text-sm uppercase tracking-[2px] cursor-pointer transition-all duration-500 hover:bg-black hover:text-white hover:shadow-2xl transform ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                } ${buttonState === 'Loading...' ? 'scale-95' : 'scale-100'} ${isHovered ? 'scale-105' : ''}`}
                style={{ transitionDelay: isActive ? '800ms' : '0ms' }}
              >
                <span className="relative z-10">{buttonState}</span>
                <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>
            </div>
            
            {/* Enhanced Shoe Display */}
            <div className="flex-1 relative h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
              {/* Dynamic floating elements */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-16 h-px bg-gradient-to-r from-black to-transparent opacity-20 transition-all duration-1000 ${
                      isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
                    }`}
                    style={{
                      top: `${20 + i * 15}%`,
                      left: i % 2 === 0 ? '-10%' : 'auto',
                      right: i % 2 === 1 ? '-10%' : 'auto',
                      transform: `translateX(${mousePosition.x * (12 + i * 6)}px) translateY(${mousePosition.y * 5}px)`,
                      transitionDelay: `${500 + i * 100}ms`
                    }}
                  />
                ))}
              </div>
              
              {/* Enhanced 3D Shoe Container */}
              <div 
                className={`relative w-[500px] h-[300px] transition-all duration-1000 ${
                  isActive ? 'scale-100' : 'scale-75'
                } ${scrollDirection === 'up' ? 'scale-110' : ''}`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `scale(${isActive ? 1 : 0.8}) rotateY(${isActive ? 0 : -30}deg) rotateX(${isActive ? 0 : 10}deg) translateX(${mousePosition.x * 20}px) translateY(${mousePosition.y * 15}px)`
                }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"
                  style={{ transform: 'translateZ(-50px)' }}
                />
                
                <div className={`absolute inset-0 transition-all duration-1200 ${isActive ? 'animate-pulse' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                  {/* Enhanced Shoe Shadow */}
                  <div 
                    className="absolute inset-0 border-2 border-gray-400 opacity-20 rounded-full shadow-2xl"
                    style={{ 
                      borderRadius: '150px 40px 40px 150px',
                      transform: 'translateZ(-20px) translateX(15px) translateY(15px)'
                    }}
                  />
                  
                  {/* Main Shoe Outline with gradient */}
                  <div 
                    className="absolute inset-0 border-2 border-black bg-gradient-to-br from-white to-gray-100 relative shadow-xl"
                    style={{ 
                      borderRadius: '150px 40px 40px 150px',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Enhanced inner shoe detail */}
                    <div 
                      className="absolute top-[20%] left-[20%] w-[60%] h-[60%] border-2 border-gray-700 bg-gradient-to-br from-gray-50 to-gray-200"
                      style={{ borderRadius: '100px 20px 20px 100px' }}
                    />
                    
                    {/* Enhanced Sole */}
                    <div 
                      className="absolute bottom-0 left-0 w-full h-[12%] border-2 border-black border-t-0 bg-gradient-to-r from-gray-800 to-black"
                      style={{ borderRadius: '0 0 40px 150px' }}
                    />
                    
                    {/* Enhanced Shoe Details */}
                    <div className="absolute top-[30%] left-[25%] w-[50%] h-[40%]">
                      {/* Animated Eyelets */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-white border-2 border-black rounded-full transition-all duration-300 hover:scale-110"
                          style={{
                            top: `${Math.floor(i / 2) * 25}%`,
                            left: i % 2 === 0 ? '20%' : 'auto',
                            right: i % 2 === 1 ? '20%' : 'auto',
                            animationDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                      
                      {/* Enhanced Laces */}
                      <div className="absolute top-[12.5%] left-[20%] right-[20%] h-px bg-gradient-to-r from-gray-600 to-gray-800 transform rotate-[10deg]" />
                      <div className="absolute top-[37.5%] left-[25%] right-[25%] h-px bg-gradient-to-r from-gray-600 to-gray-800 transform -rotate-[10deg]" />
                      <div className="absolute top-[62.5%] left-[30%] right-[30%] h-px bg-gradient-to-r from-gray-600 to-gray-800 transform rotate-[10deg]" />
                    </div>
                    
                    {/* Shine effect */}
                    <div 
                      className="absolute top-[10%] left-[15%] w-[20%] h-[20%] bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm"
                      style={{ transform: 'translateZ(1px)' }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Enhanced Price Tag */}
              <div className={`absolute bottom-8 right-8 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg transition-all duration-800 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <div className="text-2xl font-light text-black">
                  <span className="text-sm opacity-70 text-gray-600">From </span>
                  <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">$395</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Scroll Indicator */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-800 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="text-xs uppercase tracking-[2px] mb-2 opacity-60 text-gray-600">
              Scroll to Explore
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-black to-transparent animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormalShoesHero;