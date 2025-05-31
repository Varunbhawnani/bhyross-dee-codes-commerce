
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogIn, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationProps {
  brand?: 'bhyross' | 'deecodes';
}

const Navigation: React.FC<NavigationProps> = ({ brand }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = getTotalItems();

  const brandColors = {
    bhyross: 'text-bhyross-500 hover:text-bhyross-600',
    deecodes: 'text-deecodes-500 hover:text-deecodes-600'
  };

  const categories = [
    { name: 'Oxford', path: 'oxford' },
    { name: 'Derby', path: 'derby' },
    { name: 'Monk Strap', path: 'monk-strap' },
    { name: 'Loafer', path: 'loafer' }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to the brand page with search parameter
      const brandPath = brand || 'bhyross';
      navigate(`/${brandPath}/${categories[0].path}?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    } else {
      setIsSearchOpen(!isSearchOpen);
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDashboardClick = () => {
    if (brand) {
      // If we're on a brand page, go to that brand's main page
      navigate(`/${brand}`);
    } else {
      // If we're on the landing page, go to landing page
      navigate('/');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 z-10">
              <span className="text-2xl font-bold text-neutral-900">
                {brand ? (
                  <span className={brand === 'bhyross' ? 'brand-bhyross' : 'brand-deecodes'}>
                    {brand === 'bhyross' ? 'Bhyross' : 'Dee Codes'}
                  </span>
                ) : (
                  <>
                    <span className="brand-bhyross">Bhyross</span>
                    <span className="text-neutral-400 mx-1">&</span>
                    <span className="brand-deecodes">Dee Codes</span>
                  </>
                )}
              </span>
            </Link>

            {/* Desktop Category Navigation */}
            {brand && (
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={handleDashboardClick}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1 border border-neutral-300 rounded-md transition-colors duration-200 hover:border-neutral-400"
                >
                  Dashboard
                </button> 
                {categories.map((category) => (
                  <Link
                    key={category.path}
                    to={`/${brand}/${category.path}`}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      location.pathname.includes(category.path)
                        ? brandColors[brand]
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="px-3 py-1 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                      autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="z-50 bg-white border border-neutral-200 shadow-lg min-w-[200px] relative"
                    sideOffset={5}
                    avoidCollisions={true}
                    collisionPadding={8}
                  >
                    <DropdownMenuItem className="font-medium text-neutral-900 cursor-default">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-200" />
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full cursor-pointer hover:bg-neutral-50">
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-200" />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer hover:bg-neutral-50 text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">
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
                className="relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-16 left-0 right-0 z-40 bg-white border-b border-neutral-200 transition-transform duration-300 ease-in-out md:hidden shadow-lg ${
        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile Search */}
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-200">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            />
            <Button variant="ghost" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Categories */}
          {brand && (
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900 mb-3">Categories</h3>
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={`/${brand}/${category.path}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname.includes(category.path)
                      ? `${brandColors[brand]} bg-neutral-100`
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleDashboardClick();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-300 mt-3"
              >
                Dashboard
              </button>
            </div>
          )}

          {/* Mobile Actions */}
          <div className="pt-4 border-t border-neutral-200 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-neutral-900 bg-neutral-50 rounded-md">
                  {user.email}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left py-2 px-3 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            )}
            
            <button
              onClick={() => {
                handleCartClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            >
              <span className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </span>
              {totalItems > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
