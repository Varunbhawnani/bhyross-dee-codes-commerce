import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogIn, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import SearchDropdown from '@/components/SearchDropdown';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation paths - Update these paths as needed
  const HOME_PATH = '/bhyross'; // TODO: Replace with your desired home page path
  const COLLECTIONS_PATH = '/'; // Collections page path (currently points to root)
  const ABOUT_PATH = '/about'; // About page path

  const brands = [
    { name: 'Imcolus', path: '/imcolus' },
    { name: 'Bhyross', path: '/bhyross' },
    { name: 'Dee Codes', path: '/deecodes' }
  ];

  

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 z-10">
              <span className="text-2xl font-bold text-neutral-900 drop-shadow-sm">
                <span className="text-blue-600">Imcolus</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Home */}
              <Link
                to={HOME_PATH}
                className={`text-sm font-medium transition-all duration-300 hover:scale-105 drop-shadow-sm ${
                  location.pathname === HOME_PATH
                    ? 'text-blue-600 font-semibold'
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                Home
              </Link>
              
              {/* Collections */}
              <Link
                to={COLLECTIONS_PATH}
                className={`text-sm font-medium transition-all duration-300 hover:scale-105 drop-shadow-sm ${
                  location.pathname === COLLECTIONS_PATH
                    ? 'text-blue-600 font-semibold'
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                Collections
              </Link>
              
              {/* Brands Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 drop-shadow-sm">
                    Brands
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 rounded-xl">
                  {brands.map((brand) => (
                    <DropdownMenuItem key={brand.path} asChild>
                      <Link to={brand.path} className="w-full cursor-pointer hover:bg-white/50 backdrop-blur-sm transition-all duration-200 rounded-lg">
                        {brand.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* About */}
              <Link
                to={ABOUT_PATH}
                className={`text-sm font-medium transition-all duration-300 hover:scale-105 drop-shadow-sm ${
                  location.pathname === ABOUT_PATH
                    ? 'text-blue-600 font-semibold'
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                About
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search Dropdown */}
              <SearchDropdown />
              
              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="z-50 bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 min-w-[200px] relative rounded-xl"
                    sideOffset={5}
                    avoidCollisions={true}
                    collisionPadding={8}
                  >
                    <DropdownMenuItem className="font-medium text-neutral-900 cursor-default rounded-lg">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/30" />
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full cursor-pointer hover:bg-white/50 backdrop-blur-sm transition-all duration-200 rounded-lg">
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/30" />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer hover:bg-red-50/80 backdrop-blur-sm text-red-600 hover:text-red-700 transition-all duration-200 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild className="hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
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
                className="relative hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="hover:bg-white/30 backdrop-blur-sm transition-all duration-300">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/30 transition-transform duration-300 ease-in-out md:hidden shadow-2xl shadow-black/10 ${
        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
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
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                location.pathname === HOME_PATH
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              Home
            </Link>
            
            {/* Collections */}
            <Link
              to={COLLECTIONS_PATH}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                location.pathname === COLLECTIONS_PATH
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              Collections
            </Link>
            
            {/* Mobile Brands */}
            <div className="pt-2">
              <h3 className="font-semibold text-neutral-900 mb-3 px-3 drop-shadow-sm">Brands</h3>
              {brands.map((brand) => (
                <Link
                  key={brand.path}
                  to={brand.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
            
            {/* About */}
            <Link
              to={ABOUT_PATH}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                location.pathname === ABOUT_PATH
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              About
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="pt-4 border-t border-white/30 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-neutral-900 bg-white/50 backdrop-blur-sm rounded-xl">
                  {user.email}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
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
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
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
              className="flex items-center justify-between w-full py-2 px-3 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
            >
              <span className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </span>
              {totalItems > 0 && (
                <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
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