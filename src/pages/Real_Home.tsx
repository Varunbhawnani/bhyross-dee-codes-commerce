import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { useBannerImages } from '@/hooks/useBannerImages';
import BannerCarousel from '@/components/BannerCarousel';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, Shield, Award, Clock, Eye, Sparkles, Crown, Target } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Real_Home: React.FC = () => {
  const { data: bhyrossProducts } = useProducts('bhyross');
  const { data: deeCodesProducts } = useProducts('deecodes');
  const { data: imcolusProducts } = useProducts('imcolus');

  const { data: banners, isLoading: bannersLoading } = useBannerImages('home');

  const brandColors = {
    imcolus: '#A89F91',
    deecodes: '#5A6F8D',
    bhyross: '#6F2232'
  };

  const brandInfo = {
    bhyross: {
      name: 'BHYROSS',
      tagline: 'DISTINGUISHED EXCELLENCE',
      description: 'Exquisite craftsmanship meets timeless elegance. Each pair represents the pinnacle of formal footwear artistry, designed for the discerning professional.',
      color: brandColors.bhyross,
      featured: bhyrossProducts?.slice(0, 2) || [],
      icon: Crown
    },
    deecodes: {
      name: 'DEE CODES',
      tagline: 'SMART SOPHISTICATION',
      description: 'Contemporary design philosophy meets classic formal traditions. Thoughtfully engineered footwear that seamlessly adapts to your professional lifestyle.',
      color: brandColors.deecodes,
      featured: deeCodesProducts?.slice(0, 2) || [],
      icon: Target
    },
    imcolus: {
      name: 'IMCOLUS',
      tagline: 'HERITAGE & INNOVATION',
      description: 'Where traditional craftsmanship meets modern design philosophy. Creating footwear that stands the test of time with uncompromising quality.',
      color: brandColors.imcolus,
      featured: imcolusProducts?.slice(0, 2) || [],
      icon: Sparkles
    }
  };

  // Mix featured products from all brands
  const allFeaturedProducts = [
    ...brandInfo.bhyross.featured.map(p => ({ ...p, brandInfo: brandInfo.bhyross })),
    ...brandInfo.deecodes.featured.map(p => ({ ...p, brandInfo: brandInfo.deecodes })),
    ...brandInfo.imcolus.featured.map(p => ({ ...p, brandInfo: brandInfo.imcolus }))
  ].slice(0, 8); // Limit to 8 products total

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const categoryDisplayNames = {
    'oxford': 'Oxford',
    'derby': 'Derby',
    'monk-strap': 'Monk Strap',
    'loafer': 'Loafer'
  };
if (bannersLoading ) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neutral-900 mx-auto"></div>
            <p className="mt-4 text-neutral-600" style={{ fontFamily: 'Signika' }}>Loading Dee Codes Collection...</p>
          </div>
        </div>
        <Footer brand="deecodes" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
        <main className="pt-16">
      
      {/* Hero Section */}
      <section 
  className={`relative overflow-hidden pt-4 md:pt-16 ${
    banners && banners.length > 0 
      ? 'bg-cover bg-center min-h-[300px] md:min-h-[500px] lg:min-h-[600px]' 
      : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
  }`}
  style={banners && banners.length > 0 ? {
    backgroundImage: `url(${banners[0].image_url})`
  } : {}}
>
       <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 via-transparent to-slate-900/5"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-slate-200/30 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-slate-300/20 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative container mx-auto px-4 py-6 md:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-3 md:mb-6">
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4 tracking-tight gradient-text font-cornerstone">
                IMCOLUS
              </h1>
              <div className="w-16 md:w-24 h-0.5 mx-auto mb-3 md:mb-6 bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
            </div>
            
            <p className="text-base md:text-xl lg:text-2xl mb-2 md:mb-4 text-slate-700 font-light font-signika">
              Curating Excellence in Formal Footwear
            </p>
            
            <p className="text-xs md:text-base mb-4 md:mb-8 text-slate-600 max-w-2xl mx-auto leading-relaxed font-signika">
              Discover two distinguished brands under one legacy of craftsmanship. From distinguished excellence 
              to smart sophistication, we create footwear that defines your professional presence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-slate-900 text-white hover:bg-slate-800 font-semibold px-5 md:px-8 py-2 md:py-3 rounded-full font-argent transition-all duration-300 shadow-lg hover:shadow-xl text-xs md:text-base"
                onClick={() => window.location.href = `/`}
              >
                EXPLORE COLLECTIONS
                <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-5 md:px-8 py-2 md:py-3 rounded-full font-argent transition-all duration-300 text-xs md:text-base"
                onClick={() => window.location.href = `/about`}
              >
                OUR HERITAGE
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-slate-900 font-cornerstone">
              Our Distinguished Brands
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-signika leading-relaxed">
              Two unique philosophies, one unwavering commitment to excellence. Each brand represents 
              a distinct approach to formal footwear, crafted for different aspects of your professional journey.
            </p>
          </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Bhyross */}
            <div className="brand-card group">
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl bg-white rounded-2xl h-full transition-all duration-300">
                <div 
                  className="h-1 bg-gradient-to-r opacity-80"
                  style={{ 
                    background: `linear-gradient(90deg, ${brandInfo.bhyross.color} 0%, ${brandInfo.bhyross.color}CC 100%)` 
                  }}
                ></div>
                <CardContent className="p-8 md:p-12 flex flex-col justify-center items-center text-center min-h-[350px] md:min-h-[400px]">
                  <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-6">
                    <div>
                      <h3 
                        className="text-2xl md:text-3xl font-bold mb-2 md:mb-3"
                        style={{ color: brandInfo.bhyross.color }}
                      >
                        {brandInfo.bhyross.name}
                      </h3>
                      <p 
                        className="text-xs md:text-sm font-medium mb-4 md:mb-6 opacity-80"
                        style={{ color: brandInfo.bhyross.color }}
                      >
                        {brandInfo.bhyross.tagline}
                      </p>
                    </div>
                    
                    <p className="text-slate-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base max-w-sm mx-auto">
                      {brandInfo.bhyross.description}
                    </p>
                    
                    <Link to="/bhyross">
                      <Button 
                        className="font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300 hover:scale-105 text-sm md:text-base"
                        style={{ 
                          backgroundColor: brandInfo.bhyross.color,
                          color: 'white'
                        }}
                      >
                        DISCOVER BHYROSS
                        <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dee Codes */}
            <div className="brand-card group">
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl bg-white rounded-2xl h-full transition-all duration-300">
                <div 
                  className="h-1 bg-gradient-to-r opacity-80"
                  style={{ 
                    background: `linear-gradient(90deg, ${brandInfo.deecodes.color} 0%, ${brandInfo.deecodes.color}CC 100%)` 
                  }}
                ></div>
                <CardContent className="p-8 md:p-12 flex flex-col justify-center items-center text-center min-h-[350px] md:min-h-[400px]">
                  <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-6">
                    <div>
                      <h3 
                        className="text-2xl md:text-3xl font-bold mb-2 md:mb-3"
                        style={{ color: brandInfo.deecodes.color }}
                      >
                        {brandInfo.deecodes.name}
                      </h3>
                      <p 
                        className="text-xs md:text-sm font-medium mb-4 md:mb-6 opacity-80"
                        style={{ color: brandInfo.deecodes.color }}
                      >
                        {brandInfo.deecodes.tagline}
                      </p>
                    </div>
                    
                    <p className="text-slate-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base max-w-sm mx-auto">
                      {brandInfo.deecodes.description}
                    </p>
                    
                    <Link to="/deecodes">
                      <Button 
                        className="font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300 hover:scale-105 text-sm md:text-base"
                        style={{ 
                          backgroundColor: brandInfo.deecodes.color,
                          color: 'white'
                        }}
                      >
                        DISCOVER DEE CODES
                        <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mixed Featured Collections */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-slate-900 font-cornerstone">
              Featured Collections
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-signika">
              Discover our most coveted designs across both brands
            </p>
          </div>

          {/* Mixed Products Grid - 2 columns on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-7xl mx-auto">
            {allFeaturedProducts.length > 0 ? (
              allFeaturedProducts.map((product) => (
                <div key={`${product.brand}-${product.id}`} className="product-card">
                  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-white">
                      {product.product_images[0] ? (
                        <img
                          src={product.product_images[0].image_url}
                          alt={product.product_images[0].alt_text || product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <div className="text-slate-400 font-signika text-xs md:text-sm">No Image Available</div>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 md:p-3">
                      <div className="flex items-center justify-between mb-1.5 md:mb-2">
                        <span 
                          className="text-xs font-bold font-argent uppercase"
                          style={{ color: product.brandInfo.color }}
                        >
                          {product.brandInfo.name}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-2 w-2 md:h-2.5 md:w-2.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1 text-slate-900 font-signika text-xs md:text-sm leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-slate-600 text-xs mb-2 font-signika">
                        {categoryDisplayNames[product.category]}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span 
                          className="text-sm md:text-base font-bold font-signika"
                          style={{ color: product.brandInfo.color }}
                        >
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <Button
                        className="w-full font-semibold font-argent text-xs py-1.5 md:py-2"
                        style={{ backgroundColor: product.brandInfo.color }}
                        onClick={() => window.location.href = `/${product.brand}/${product.category}/${product.id}`}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        VIEW
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 md:col-span-2 lg:col-span-4 text-center py-12 md:py-16 text-slate-500">
                <p className="text-base md:text-lg font-signika">
                  Featured collections coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-slate-900 font-cornerstone">
              The IMCOLUS Promise
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-signika">
              What sets us apart in the world of formal footwear excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'PREMIUM MATERIALS',
                description: 'Only the finest leathers and materials sourced from trusted suppliers worldwide, ensuring exceptional quality and durability.'
              },
              {
                icon: Award,
                title: 'MASTER CRAFTSMANSHIP',
                description: 'Each pair is meticulously crafted by skilled artisans with decades of experience, combining traditional techniques with modern precision.'
              },
              {
                icon: Clock,
                title: 'TIMELESS DESIGN',
                description: 'Classic silhouettes that transcend trends, ensuring your investment remains stylish and relevant for years to come.'
              },
              {
                icon: Star,
                title: 'EXCEPTIONAL SERVICE',
                description: 'Personalized attention and comprehensive support throughout your footwear journey, from selection to after-sales care.'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-slate-900 group-hover:to-slate-800 transition-all duration-500 shadow-lg">
                  <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-slate-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xs md:text-sm font-bold mb-2 md:mb-3 text-slate-900 font-argent">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-signika text-xs md:text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900 font-cornerstone">
                  Our Craftsmanship
                </h2>
                <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 font-signika leading-relaxed">
                  Every pair of IMCOLUS footwear is a testament to our unwavering commitment to excellence. 
                  Our master craftsmen employ time-honored techniques passed down through generations, 
                  ensuring each shoe meets the highest standards of quality and sophistication.
                </p>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1 font-argent text-xs md:text-sm">HAND-SELECTED MATERIALS</h4>
                      <p className="text-slate-600 font-signika text-xs md:text-sm">Premium leather sourced from the finest tanneries worldwide</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1 font-argent text-xs md:text-sm">PRECISION CONSTRUCTION</h4>
                      <p className="text-slate-600 font-signika text-xs md:text-sm">Every stitch, every cut, every detail perfected by master artisans</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1 font-argent text-xs md:text-sm">QUALITY ASSURANCE</h4>
                      <p className="text-slate-600 font-signika text-xs md:text-sm">Rigorous quality checks ensure perfection in every pair</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
  {/* Main container with enhanced 3D shadow */}
  <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2">
    {/* Multiple shadow layers for depth */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl md:rounded-3xl transform translate-x-1.5 translate-y-1.5 md:translate-x-2 md:translate-y-2 opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl md:rounded-3xl transform translate-x-1 translate-y-1 opacity-40"></div>
    
    {/* Main image container */}
    <div className="relative bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
      {/* Subtle inner border glow */}
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-slate-100/10 pointer-events-none"></div>
      
      {/* Image placeholder - replace src with your Supabase URL */}
      <img 
        src="https://rfssuewzrvhatnwolmnp.supabase.co/storage/v1/object/public/products//ChatGPT%20Image%20Jul%202,%202025,%2006_05_00%20PM.png" 
        alt="Craftsmanship Image"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Subtle overlay for enhanced contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 pointer-events-none"></div>
      
      {/* Optional corner accent */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-60 shadow-lg"></div>
    </div>
  </div>
  
  {/* Additional ambient shadow */}
  <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-400/20 to-slate-600/20 transform translate-y-4 md:translate-y-6 scale-95 blur-xl -z-10"></div>
</div>
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer brand="imcolus" />
    </div>
  );
};

export default Real_Home;