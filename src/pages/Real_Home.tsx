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
import { useCategories } from '@/hooks/useCategories';

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

  const allFeaturedProducts = [
    ...brandInfo.bhyross.featured.map(p => ({ ...p, brandInfo: brandInfo.bhyross })),
    ...brandInfo.deecodes.featured.map(p => ({ ...p, brandInfo: brandInfo.deecodes })),
    ...brandInfo.imcolus.featured.map(p => ({ ...p, brandInfo: brandInfo.imcolus }))
  ].slice(0, 8);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const { data: categoriesData } = useCategories();

  const categoryDisplayNames = categoriesData?.reduce((acc, cat) => {
    acc[cat.path] = cat.name;
    return acc;
  }, {} as Record<string, string>) || {
    'oxford': 'Oxford',
    'derby': 'Derby',
    'monk-strap': 'Monk Strap',
    'loafer': 'Loafer'
  };

  if (bannersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center px-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-4 border-stone-200 border-t-stone-800 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-stone-800/10 to-transparent animate-pulse"></div>
            </div>
            <p className="mt-6 text-stone-600 font-medium tracking-wide text-sm sm:text-base" style={{ fontFamily: 'Signika' }}>
              Loading Home Page...
            </p>
          </div>
        </div>
        <Footer brand="deecodes" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
    {/* Global Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.09] pointer-events-none z-0">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#8a7e50ff 1px, transparent 1px), linear-gradient(90deg, #8a7e50ff 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <Navigation />
      <main className="pt-16 relative">
        {/* Banner - Clean without overlay */}
        <div className="relative">
          <BannerCarousel brand="home" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10 pointer-events-none"></div>
        </div>

         {/* Brand Showcase - Mobile Optimized */}
<section className="py-8 sm:py-12 md:py-16 relative overflow-hidden">

  <div className="container mx-auto px-4 relative z-10">
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-block mb-2 sm:mb-3 px-4 sm:px-6 py-1.5 sm:py-2 bg-stone-900 text-white text-[10px] sm:text-xs font-bold tracking-widest rounded-full">
        OUR BRANDS
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-stone-900 font-cornerstone px-4">
        Distinguished Brands
      </h2>
      <p className="text-sm sm:text-base md:text-lg text-stone-600 max-w-2xl mx-auto font-signika leading-relaxed px-4">
        Two unique philosophies, one unwavering commitment to excellence
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
      {/* Bhyross - Enhanced Card */}
      <div className="group perspective-1000">
        <Card className="relative overflow-hidden border-0 shadow-xl sm:shadow-2xl hover:shadow-3xl bg-white rounded-2xl sm:rounded-3xl h-full transition-all duration-500 transform hover:-translate-y-2">
          {/* Gradient Border Animation */}
          <div 
            className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: `linear-gradient(135deg, ${brandInfo.bhyross.color}, transparent)`,
              padding: '2px'
            }}
          >
            <div className="w-full h-full bg-white rounded-2xl sm:rounded-3xl"></div>
          </div>

          <div 
            className="h-1.5 sm:h-2 bg-gradient-to-r"
            style={{ 
              background: `linear-gradient(90deg, ${brandInfo.bhyross.color} 0%, ${brandInfo.bhyross.color}AA 100%)` 
            }}
          ></div>

          <CardContent className="relative p-6 sm:p-8 md:p-10 flex flex-col justify-center items-center text-center min-h-[320px] sm:min-h-[380px]">
            {/* Icon with Animation */}
            <div className="mb-4 sm:mb-6 relative">
              <div 
                className="absolute inset-0 rounded-full blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                style={{ backgroundColor: brandInfo.bhyross.color }}
              ></div>
              
            </div>

            <h3 
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight"
              style={{ color: brandInfo.bhyross.color }}
            >
              {brandInfo.bhyross.name}
            </h3>
            
            <div className="mb-4 sm:mb-5 flex items-center gap-2">
              <div className="h-px w-6 sm:w-8 bg-stone-300"></div>
              <p 
                className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest"
                style={{ color: brandInfo.bhyross.color }}
              >
                {brandInfo.bhyross.tagline}
              </p>
              <div className="h-px w-6 sm:w-8 bg-stone-300"></div>
            </div>

            <p className="text-stone-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base max-w-md mx-auto">
              {brandInfo.bhyross.description}
            </p>

            <Link to="/bhyross" className="w-full max-w-xs">
              <Button 
                className="w-full group/btn relative font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-full transition-all duration-300 text-sm sm:text-base overflow-hidden shadow-lg hover:shadow-xl"
                style={{ backgroundColor: brandInfo.bhyross.color }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  DISCOVER BHYROSS
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-black/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Dee Codes - Enhanced Card */}
      <div className="group perspective-1000">
        <Card className="relative overflow-hidden border-0 shadow-xl sm:shadow-2xl hover:shadow-3xl bg-white rounded-2xl sm:rounded-3xl h-full transition-all duration-500 transform hover:-translate-y-2">
          <div 
            className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: `linear-gradient(135deg, ${brandInfo.deecodes.color}, transparent)`,
              padding: '2px'
            }}
          >
            <div className="w-full h-full bg-white rounded-2xl sm:rounded-3xl"></div>
          </div>

          <div 
            className="h-1.5 sm:h-2 bg-gradient-to-r"
            style={{ 
              background: `linear-gradient(90deg, ${brandInfo.deecodes.color} 0%, ${brandInfo.deecodes.color}AA 100%)` 
            }}
          ></div>

          <CardContent className="relative p-6 sm:p-8 md:p-10 flex flex-col justify-center items-center text-center min-h-[320px] sm:min-h-[380px]">
            <div className="mb-4 sm:mb-6 relative">
              <div 
                className="absolute inset-0 rounded-full blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                style={{ backgroundColor: brandInfo.deecodes.color }}
              ></div>
              
            </div>

            <h3 
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight"
              style={{ color: brandInfo.deecodes.color }}
            >
              {brandInfo.deecodes.name}
            </h3>
            
            <div className="mb-4 sm:mb-5 flex items-center gap-2">
              <div className="h-px w-6 sm:w-8 bg-stone-300"></div>
              <p 
                className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest"
                style={{ color: brandInfo.deecodes.color }}
              >
                {brandInfo.deecodes.tagline}
              </p>
              <div className="h-px w-6 sm:w-8 bg-stone-300"></div>
            </div>

            <p className="text-stone-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base max-w-md mx-auto">
              {brandInfo.deecodes.description}
            </p>

            <Link to="/deecodes" className="w-full max-w-xs">
              <Button 
                className="w-full group/btn relative font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-full transition-all duration-300 text-sm sm:text-base overflow-hidden shadow-lg hover:shadow-xl"
                style={{ backgroundColor: brandInfo.deecodes.color }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  DISCOVER DEE CODES
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-black/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</section>

        {/* Parallax Hero Section - Mobile Optimized */}
        <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
          {/* Background Image with Parallax Effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: 'url(https://kyjbzmcdgkmqmlydsqgp.supabase.co/storage/v1/object/public/products/craftsmanship/ChatGPT%20Image%20Aug%2019,%202025,%2009_21_56%20PM.png)',
              backgroundAttachment: 'fixed'
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 text-white font-cornerstone leading-tight drop-shadow-2xl">
                  Curating Excellence in Formal Footwear
                </h1>

                <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-5 sm:mb-6 md:mb-10 text-white font-light font-signika max-w-2xl mx-auto drop-shadow-lg px-4">
                  Where timeless craftsmanship meets contemporary design
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto group relative bg-white text-stone-900 hover:bg-stone-100 font-semibold px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-full font-argent transition-all duration-300 shadow-2xl hover:shadow-3xl text-xs sm:text-sm md:text-base overflow-hidden"
                    onClick={() => window.location.href = `/`}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      EXPLORE COLLECTIONS
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto group border-2 border-white text-black hover:bg-white hover:text-stone-900 font-semibold px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-full font-argent transition-all duration-300 text-xs sm:text-sm md:text-base backdrop-blur-sm"
                    onClick={() => window.location.href = `/about`}
                  >
                    OUR HERITAGE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Collections - Mobile Optimized */}
        <section className="py-8 sm:py-12 md:py-16 relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-block mb-2 sm:mb-3 px-4 sm:px-5 py-1 sm:py-1.5 bg-white text-stone-900 text-[10px] sm:text-xs font-bold tracking-widest rounded-full">
                FEATURED
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-white font-cornerstone px-4">
                Curated Collections
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl mx-auto font-signika px-4">
                Discover our most coveted designs across both brands
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {allFeaturedProducts.length > 0 ? (
                allFeaturedProducts.map((product) => (
                 <div 
                    key={`${product.brand}-${product.id}`} 
                    className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer"
                    onClick={() => window.location.href = `/${product.brand}/${product.category}/${product.id}`}
                  >
                    {/* Gradient Border on Hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${product.brandInfo.color}, transparent)`,
                        padding: '2px'
                      }}
                    >
                      <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl"></div>
                    </div>

                    <div className="relative">
                      {/* Image Container */}
                      <div className="aspect-square overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100 relative">
                        {product.product_variants?.[0]?.product_images?.[0] ? (
                          <>
                            <img
                              src={product.product_variants[0].product_images[0].image_url}
                              alt={product.product_variants[0].product_images[0].alt_text || product.name}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                            <div className="text-stone-400 font-signika text-xs sm:text-sm">No Image</div>
                          </div>
                        )}

                        {/* Brand Badge */}
                        <div 
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-[10px] sm:text-xs font-bold backdrop-blur-sm"
                          style={{ backgroundColor: `${product.brandInfo.color}E6` }}
                        >
                          {product.brandInfo.name}
                        </div>
                      </div>

                      {/* Visual separator - Mobile only */}
                      <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent lg:hidden"></div>

                      {/* Content */}
                      <div className="p-3 sm:p-4">
                        <div className="mb-1.5 sm:mb-2">
  <span className="text-[10px] sm:text-xs text-stone-500 font-semibold uppercase tracking-wide">
    {categoryDisplayNames[product.category]}
  </span>
</div>

                        <h4 className="font-bold mb-2 sm:mb-3 text-stone-900 font-signika text-xs sm:text-sm leading-snug line-clamp-2">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span 
                            className="text-lg sm:text-xl font-bold font-signika"
                            style={{ color:' #000000' }}
                          >
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <Button
  className="w-full group/btn relative font-semibold font-argent text-xs sm:text-sm py-4 sm:py-5 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 lg:flex hidden items-center justify-center"
  style={{ backgroundColor: '#000000' }}
  onClick={() => window.location.href = `/${product.brand}/${product.category}/${product.id}`}
>
  <span className="relative z-10 inline-flex items-center justify-center gap-1.5 sm:gap-2">
    <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" strokeWidth={2} />
    VIEW DETAILS
  </span>
  <div className="absolute inset-0 bg-black/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 xs:col-span-2 lg:col-span-4 text-center py-12 sm:py-20 text-stone-200">
                  <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base sm:text-xl font-signika">Featured collections coming soon</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Choose Us - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="inline-block mb-3 sm:mb-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-stone-900 text-white text-[10px] sm:text-xs font-bold tracking-widest rounded-full">
                OUR PROMISE
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-900 font-cornerstone px-4">
                The IMCOLUS Promise
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-stone-600 max-w-2xl mx-auto font-signika px-4">
                What sets us apart in the world of formal footwear excellence
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: 'PREMIUM MATERIALS',
                  description: 'Finest materials, globally sourced for quality and durability.',
                  color: '#DC2626'
                },
                {
                  icon: Award,
                  title: 'MASTER CRAFTSMANSHIP',
                  description: 'Artisan-crafted with traditional techniques and precision.',
                  color: '#2563EB'
                },
                {
                  icon: Clock,
                  title: 'TIMELESS DESIGN',
                  description: 'Classic silhouettes ensure lasting style and relevance.',
                  color: '#059669'
                },
                {
                  icon: Star,
                  title: 'EXCEPTIONAL SERVICE',
                  description: 'We support your entire footwear journey from selection to after-sales care.',
                  color: '#D97706'
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-stone-100">
                    {/* Top Accent Line */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-xl sm:rounded-t-2xl"
                      style={{ backgroundColor: feature.color }}
                    ></div>

                    {/* Icon */}
                    <div className="relative mb-5 sm:mb-6">
                      <div 
                        className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg"
                        style={{ backgroundColor: `${feature.color}15` }}
                      >
                        <feature.icon 
                          className="h-7 w-7 sm:h-8 sm:w-8 transition-colors duration-500" 
                          style={{ color: feature.color }}
                        />
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold mb-3 sm:mb-4 text-stone-900 font-argent text-center tracking-wide">
                      {feature.title}
                    </h3>

                    <p className="text-stone-600 leading-relaxed font-signika text-xs sm:text-sm text-center">
                      {feature.description}
                    </p>

                    {/* Bottom Decorative Element */}
                    <div className="mt-5 sm:mt-6 flex justify-center">
                      <div 
                        className="w-10 sm:w-12 h-0.5 sm:h-1 rounded-full opacity-50"
                        style={{ backgroundColor: feature.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Craftsmanship Section - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-stone-700/20 rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-stone-600/20 rounded-full blur-2xl sm:blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                {/* Content Side */}
                <div className="order-2 lg:order-1">
                  <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-white text-stone-900 text-[10px] sm:text-xs font-bold tracking-widest rounded-full">
                    CRAFTSMANSHIP
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-white font-cornerstone leading-tight">
                    Our Craftsmanship
                  </h2>

                  <p className="text-sm sm:text-base md:text-lg text-stone-200 mb-8 sm:mb-10 font-signika leading-relaxed">
                    Every pair of IMCOLUS footwear is a testament to our unwavering commitment to excellence. 
                    Our master craftsmen employ time-honored techniques passed down through generations, 
                    ensuring each shoe meets the highest standards of quality and sophistication.
                  </p>

                  <div className="space-y-4 sm:space-y-6">
                    {[
                      {
                        title: 'HAND-SELECTED MATERIALS',
                        description: 'Premium leather sourced from the finest tanneries worldwide',
                        icon: Shield
                      },
                      {
                        title: 'PRECISION CONSTRUCTION',
                        description: 'Every stitch, every cut, every detail perfected by master artisans',
                        icon: Award
                      },
                      {
                        title: 'QUALITY ASSURANCE',
                        description: 'Rigorous quality checks ensure perfection in every pair',
                        icon: Star
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 sm:gap-4 group">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                            <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1.5 sm:mb-2 font-argent text-xs sm:text-sm tracking-wide">
                            {item.title}
                          </h4>
                          <p className="text-stone-300 font-signika text-xs sm:text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Side */}
                <div className="order-1 lg:order-2 relative group">
                  <div className="relative">
                    {/* Decorative Background Layers */}
                    <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-stone-500/30 to-stone-700/30 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                    
                    {/* Main Image Container with 3D Effect */}
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
                      {/* Multiple Shadow Layers */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-stone-300/20 rounded-2xl sm:rounded-3xl transform translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3 -z-10"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-stone-400/30 rounded-2xl sm:rounded-3xl transform translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 -z-20"></div>

                      {/* Image Wrapper */}
                      <div className="relative aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-white/20">
                        <img 
                          src="https://kyjbzmcdgkmqmlydsqgp.supabase.co/storage/v1/object/public/products/craftsmanship/ChatGPT%20Image%20Aug%2019,%202025,%2009_21_56%20PM.png" 
                          alt="Craftsmanship"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Overlay Effects */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-white/10 pointer-events-none"></div>
                        
                        {/* Corner Accents */}
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg animate-pulse"></div>
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 w-2 h-2 sm:w-2 sm:h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                    </div>
                  </div>
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