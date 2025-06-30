
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' }
  ];

  const brands = [
    { name: 'Imcolus', path: '/imcolus' },
    { name: 'Bhyross', path: '/bhyross' },
    { name: 'Dee Codes', path: '/deecodes' }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 z-10">
              <span className="text-2xl font-bold text-neutral-900">
                <span className="text-blue-600">Imcolus</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-blue-600'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Brands Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                    Brands
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-white border border-neutral-200 shadow-lg">
                  {brands.map((brand) => (
                    <DropdownMenuItem key={brand.path} asChild>
                      <Link to={brand.path} className="w-full cursor-pointer hover:bg-neutral-50">
                        {brand.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search Dropdown */}
              <SearchDropdown />
              
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
          <div className="pb-4 border-b border-neutral-200">
            <SearchDropdown onSelect={() => setIsMobileMenuOpen(false)} />
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile Brands */}
            <div className="pt-2">
              <h3 className="font-semibold text-neutral-900 mb-3 px-3">Brands</h3>
              {brands.map((brand) => (
                <Link
                  key={brand.path}
                  to={brand.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>

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
