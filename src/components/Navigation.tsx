import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogIn, LogOut, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useWishlist } from '@/hooks/useWishlist';
import SearchDropdown from '@/components/SearchDropdown';
import { captureUTMParameters } from '@/utils/utmTracking';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const { trackEvent } = useAnalytics();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  // Mock wishlist count - replace with actual wishlist hook
  const { getWishlistCount } = useWishlist();
const wishlistCount = getWishlistCount();

  // Track UTM parameters and page views
  useEffect(() => {
    // Capture UTM parameters from the current URL
    captureUTMParameters();
    
    // Track page view with analytics
    trackEvent('page_view', {
      page_location: window.location.href,
      page_path: location.pathname,
      page_title: document.title,
    });
  }, [location.pathname, trackEvent]);

  const handleSignOut = async () => {
    // Track sign out event
    trackEvent('logout', {
      method: 'manual',
      page_location: window.location.href,
    });
    
    await signOut();
    navigate('/');
  };

  const handleCartClick = () => {
    // Track cart view event
    trackEvent('view_cart', {
      items_in_cart: totalItems,
      page_location: window.location.href,
    });
    
    navigate('/cart');
  };

  const handleWishlistClick = () => {
    // Track wishlist view event
    trackEvent('view_wishlist', {
      items_in_wishlist: wishlistCount,
      page_location: window.location.href,
    });
    
    navigate('/wishlist');
  };

  const handleBrandClick = (brandName: string, brandPath: string) => {
    // Track brand navigation
    trackEvent('select_content', {
      content_type: 'brand',
      content_id: brandName.toLowerCase().replace(/\s+/g, '_'),
      content_name: brandName,
      page_location: window.location.href,
    });
    
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  const handleNavigationClick = (linkName: string, linkPath: string) => {
    // Track navigation clicks
    trackEvent('select_content', {
      content_type: 'navigation',
      content_id: linkName.toLowerCase().replace(/\s+/g, '_'),
      content_name: linkName,
      link_url: linkPath,
      page_location: window.location.href,
    });
  };

  const handleAuthClick = () => {
    // Track auth page navigation
    trackEvent('select_content', {
      content_type: 'auth',
      content_id: 'sign_in_button',
      content_name: 'Sign In',
      page_location: window.location.href,
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    // Track mobile menu interactions
    trackEvent('mobile_menu_toggle', {
      action: newState ? 'open' : 'close',
      page_location: window.location.href,
    });
  };

  // Navigation paths - Update these paths as needed
  const HOME_PATH = '/home'; // TODO: Replace with your desired home page path
  const COLLECTIONS_PATH = '/'; // Collections page path (currently points to root)
  const ABOUT_PATH = '/about'; // About page path

  const brands = [
    { name: 'Imcolus Classics', tagline: 'Timeless Elegance', path: '/imcolus', color: '#A89F91' },
    { name: 'Bhyross Signature', tagline: 'Signature Luxury', path: '/bhyross', color: '#6F2232' },
    { name: 'Dee Codes Modern', tagline: 'Everyday Refined', path: '/deecodes', color: '#5A6F8D' }
  ];

  const fontStyles = {
    heading: { fontFamily: 'Cornerstone, serif' } as React.CSSProperties,
    body: { fontFamily: 'Signika, sans-serif' } as React.CSSProperties,
    accent: { fontFamily: 'Argent CF, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' as const } as React.CSSProperties
  };

  // Get brand colors based on current page
  const getBrandColors = () => {
    switch (location.pathname) {
      case '/bhyross':
        return {
          primary: '#6F2232',
          navBg: 'rgba(111, 34, 50, 0.2)',
          navBorder: 'rgba(111, 34, 50, 0.2)',
          hoverBg: 'rgba(111, 34, 50, 0.3)',
          mobileBg: 'rgba(111, 34, 50, 0.2)',
          mobileBorder: 'rgba(111, 34, 50, 0.2)',
          dropdownBg: 'rgba(111, 34, 50, 0.1)',
          gradient: 'linear-gradient(135deg, #6F2232 0%, #8B2A42 100%)'
        };
      case '/imcolus':
        return {
          primary: '#A89F91',
          navBg: 'rgba(168, 159, 145, 0.2)',
          navBorder: 'rgba(168, 159, 145, 0.2)',
          hoverBg: 'rgba(168, 159, 145, 0.3)',
          mobileBg: 'rgba(168, 159, 145, 0.2)',
          mobileBorder: 'rgba(168, 159, 145, 0.2)',
          dropdownBg: 'rgba(168, 159, 145, 0.1)',
          gradient: 'linear-gradient(135deg, #A89F91 0%, #B8AFA1 100%)'
        };
      case '/deecodes':
        return {
          primary: '#5A6F8D',
          navBg: 'rgba(90, 111, 141, 0.2)',
          navBorder: 'rgba(90, 111, 141, 0.2)',
          hoverBg: 'rgba(90, 111, 141, 0.3)',
          mobileBg: 'rgba(90, 111, 141, 0.2)',
          mobileBorder: 'rgba(90, 111, 141, 0.2)',
          dropdownBg: 'rgba(90, 111, 141, 0.1)',
          gradient: 'linear-gradient(135deg, #5A6F8D 0%, #6A7F9D 100%)'
        };
      default:
        return {
          primary: '#667eea',
          navBg: 'rgba(255, 255, 255, 0.2)',
          navBorder: 'rgba(255, 255, 255, 0.2)',
          hoverBg: 'rgba(255, 255, 255, 0.3)',
          mobileBg: 'rgba(255, 255, 255, 0.2)',
          mobileBorder: 'rgba(255, 255, 255, 0.2)',
          dropdownBg: 'rgba(255, 255, 255, 0.1)',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
    }
  };

  const brandColors = getBrandColors();

  // Custom active styles with dynamic gradient
  const getActiveLinkStyle = (isActive: boolean) => ({
    background: isActive ? brandColors.gradient : '',
    WebkitBackgroundClip: isActive ? 'text' : '',
    WebkitTextFillColor: isActive ? 'transparent' : '',
    backgroundClip: isActive ? 'text' : '',
    fontWeight: isActive ? '600' : ''
  });

  const getActiveLinkClasses = (isActive: boolean, path: string) => 
    `text-sm font-medium transition-all duration-300 hover:scale-105 drop-shadow-sm ${
      isActive
        ? 'font-semibold'
        : 'text-neutral-700 hover:text-neutral-900'
    }`;

  const getMobileActiveLinkClasses = (isActive: boolean) =>
    `block py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
      isActive
        ? 'font-semibold'
        : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/50'
    }`;

  const getMobileActiveLinkStyle = (isActive: boolean) => ({
    background: isActive ? brandColors.gradient : '',
    WebkitBackgroundClip: isActive ? 'text' : '',
    WebkitTextFillColor: isActive ? 'transparent' : '',
    backgroundClip: isActive ? 'text' : '',
    backgroundImage: isActive ? '' : '',
    backgroundColor: isActive ? '' : '',
    fontWeight: isActive ? '600' : ''
  });

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-lg shadow-black/5"
        style={{
          backgroundColor: brandColors.navBg,
          borderBottomColor: brandColors.navBorder
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 z-10"
              onClick={() => handleNavigationClick('Logo', '/')}
            >
              <span className="text-2xl font-bold text-black drop-shadow-sm" style={fontStyles.heading}>
                Imcolus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Home */}
              <Link
                to={HOME_PATH}
                className={getActiveLinkClasses(location.pathname === HOME_PATH, HOME_PATH)}
                style={{...fontStyles.body, ...getActiveLinkStyle(location.pathname === HOME_PATH)}}
                onClick={() => handleNavigationClick('Home', HOME_PATH)}
              >
                Home
              </Link>

              {/* Collections */}
              <Link
                to={COLLECTIONS_PATH}
                className={getActiveLinkClasses(location.pathname === COLLECTIONS_PATH, COLLECTIONS_PATH)}
                style={{...fontStyles.body, ...getActiveLinkStyle(location.pathname === COLLECTIONS_PATH)}}
                onClick={() => handleNavigationClick('Collections', COLLECTIONS_PATH)}
              >
                Collections
              </Link>
              
              {/* Brands Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm font-medium text-neutral-700 hover:text-neutral-900 backdrop-blur-sm transition-all duration-300 hover:scale-105 drop-shadow-sm"
                    style={{
                      ...fontStyles.body,
                      '--hover-bg': brandColors.hoverBg
                    } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => trackEvent('brands_dropdown_open', { page_location: window.location.href })}
                  >
                    Brands
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="border border-gray-200 shadow-2xl rounded-2xl min-w-[600px] p-4 sm:bg-white"
                  style={{
                    backgroundColor: `${brandColors.dropdownBg}`,
                    backdropFilter: 'blur(32px)'
                  }}
                >
                  <div className="flex items-stretch justify-center space-x-2">
                    {brands.map((brand, index) => (
                      <DropdownMenuItem key={brand.path} asChild className="p-0 flex-1">
                        <Link 
                          to={brand.path} 
                          className="cursor-pointer transition-all duration-300 rounded-xl flex flex-col items-center justify-center text-center px-4 py-6 group w-[180px] h-[120px] sm:hover:bg-gray-50"
                          style={{
                            '--hover-bg': brandColors.hoverBg
                          } as React.CSSProperties}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={() => handleBrandClick(brand.name, brand.path)}
                        >
                          <span className="text-base font-semibold text-neutral-900 mb-2 leading-tight" style={fontStyles.heading}>
                            {brand.name}
                          </span>
                          <span className="text-sm text-neutral-700 mb-3 leading-tight" style={fontStyles.body}>
                            {brand.tagline}
                          </span>
                          <div 
                            className="w-16 h-1 rounded-full transition-all duration-300 group-hover:w-20 group-hover:h-1.5 shadow-lg"
                            style={{ backgroundColor: brand.color }}
                          />
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* About */}
              <Link
                to={ABOUT_PATH}
                className={getActiveLinkClasses(location.pathname === ABOUT_PATH, ABOUT_PATH)}
                style={{...fontStyles.body, ...getActiveLinkStyle(location.pathname === ABOUT_PATH)}}
                onClick={() => handleNavigationClick('About', ABOUT_PATH)}
              >
                About
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Search Dropdown */}
              <SearchDropdown />
              
              {/* Wishlist */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleWishlistClick}
                className="relative backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{
                  '--hover-bg': brandColors.hoverBg
                } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg" style={fontStyles.accent}>
                    {wishlistCount}
                  </span>
                )}
              </Button>
              
              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="backdrop-blur-sm transition-all duration-300 hover:scale-105"
                      style={{
                        '--hover-bg': brandColors.hoverBg
                      } as React.CSSProperties}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => trackEvent('user_menu_open', { page_location: window.location.href })}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="z-50 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 min-w-[200px] relative rounded-xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                    sideOffset={5}
                    avoidCollisions={true}
                    collisionPadding={8}
                  >
                    <DropdownMenuItem className="font-medium text-neutral-900 cursor-default rounded-lg" style={fontStyles.body}>
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/30" />
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link 
                            to="/admin" 
                            className="w-full cursor-pointer hover:bg-white/50 backdrop-blur-sm transition-all duration-200 rounded-lg" 
                            style={fontStyles.body}
                            onClick={() => handleNavigationClick('Admin Dashboard', '/admin')}
                          >
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/30" />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer hover:bg-red-50/80 backdrop-blur-sm text-red-600 hover:text-red-700 transition-all duration-200 rounded-lg"
                      style={fontStyles.body}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  style={{
                    '--hover-bg': brandColors.hoverBg
                  } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Link 
                    to="/auth" 
                    style={fontStyles.accent}
                    onClick={handleAuthClick}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}
              
              {/* Cart */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCartClick}
                className="relative backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{
                  '--hover-bg': brandColors.hoverBg
                } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg" style={fontStyles.accent}>
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMobileMenu} 
                className="backdrop-blur-sm transition-all duration-300"
                style={{
                  '--hover-bg': brandColors.hoverBg
                } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-16 left-0 right-0 z-40 backdrop-blur-xl border-b transition-transform duration-300 ease-in-out md:hidden shadow-2xl shadow-black/20 ${
        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{
        backgroundColor: brandColors.mobileBg,
        borderBottomColor: brandColors.mobileBorder
      }}
      >
        <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile Search */}
          <div className="pb-4 border-b border-white/30">
            <SearchDropdown onSelect={() => setIsMobileMenuOpen(false)} />
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-2">
            {/* Home */}
            <Link
              to={HOME_PATH}
              onClick={() => {
                handleNavigationClick('Home', HOME_PATH);
                setIsMobileMenuOpen(false);
              }}
              className={getMobileActiveLinkClasses(location.pathname === HOME_PATH)}
              style={{...fontStyles.body, ...getMobileActiveLinkStyle(location.pathname === HOME_PATH)}}
            >
              Home
            </Link>
            
            {/* Collections */}
            <Link
              to={COLLECTIONS_PATH}
              onClick={() => {
                handleNavigationClick('Collections', COLLECTIONS_PATH);
                setIsMobileMenuOpen(false);
              }}
              className={getMobileActiveLinkClasses(location.pathname === COLLECTIONS_PATH)}
              style={{...fontStyles.body, ...getMobileActiveLinkStyle(location.pathname === COLLECTIONS_PATH)}}
            >
              Collections
            </Link>
            
            {/* Mobile Brands */}
            <div className="pt-2">
              <h3 className="font-semibold text-neutral-900 mb-3 px-3 drop-shadow-sm" style={fontStyles.heading}>Brands</h3>
              <div className="space-y-3">
                {brands.map((brand, index) => (
                  <Link
                    key={brand.path}
                    to={brand.path}
                    onClick={() => handleBrandClick(brand.name, brand.path)}
                    className="flex flex-col items-center text-center py-3 px-3 mx-2 rounded-xl text-neutral-700 hover:text-neutral-900 backdrop-blur-sm transition-all duration-300"
                    style={{
                      '--hover-bg': brandColors.hoverBg
                    } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-sm font-semibold mb-1" style={fontStyles.heading}>{brand.name}</span>
                    <span className="text-xs text-neutral-600 mb-2" style={fontStyles.body}>{brand.tagline}</span>
                    <div 
                      className="w-8 h-0.5 rounded-full"
                      style={{ backgroundColor: brand.color }}
                    />
                  </Link>
                ))}
              </div>
            </div>
            
            {/* About */}
            <Link
              to={ABOUT_PATH}
              onClick={() => {
                handleNavigationClick('About', ABOUT_PATH);
                setIsMobileMenuOpen(false);
              }}
              className={getMobileActiveLinkClasses(location.pathname === ABOUT_PATH)}
              style={{...fontStyles.body, ...getMobileActiveLinkStyle(location.pathname === ABOUT_PATH)}}
            >
              About
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="pt-4 border-t border-white/30 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-neutral-900 backdrop-blur-sm rounded-xl" 
                  style={{
                    ...fontStyles.body,
                    backgroundColor: brandColors.hoverBg
                  }}
                >
                  {user.email}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => {
                      handleNavigationClick('Admin Dashboard', '/admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 backdrop-blur-sm transition-all duration-300"
                    style={{
                      ...fontStyles.body,
                      '--hover-bg': brandColors.hoverBg
                    } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left py-2 px-3 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/80 backdrop-blur-sm transition-all duration-300"
                  style={fontStyles.body}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => {
                  handleAuthClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 backdrop-blur-sm transition-all duration-300"
                style={{
                  ...fontStyles.accent,
                  '--hover-bg': brandColors.hoverBg
                } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            )}
            
            {/* Mobile Wishlist */}
            <button
              onClick={() => {
                handleWishlistClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 backdrop-blur-sm transition-all duration-300"
              style={{
                ...fontStyles.body,
                '--hover-bg': brandColors.hoverBg
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="bg-pink-500/90 backdrop-blur-sm text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg" style={fontStyles.accent}>
                  {wishlistCount}
                </span>
              )}
            </button>
            
            
            <button
              onClick={() => {
                handleCartClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 backdrop-blur-sm transition-all duration-300"
              style={{
                ...fontStyles.body,
                '--hover-bg': brandColors.hoverBg
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </span>
              {totalItems > 0 && (
                <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg" style={fontStyles.accent}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;