
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogIn, LogOut, Menu } from 'lucide-react';
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
  const { getTotalItems, toggleCart } = useCart();
  const { user, signOut, isAdmin } = useAuth();
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
    alert('Search functionality coming soon!');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900">
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

          {/* Category Navigation and Dashboard Button - Hidden on mobile */}
          {brand && (
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
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
              <Link
                to="/"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1 border border-neutral-300 rounded-md transition-colors duration-200"
              >
                Dashboard
              </Link>
            </div>
          )}

          {/* Mobile Category Menu */}
          {brand && (
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-white border border-neutral-200 shadow-lg w-48">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.path} asChild>
                      <Link to={`/${brand}/${category.path}`} className="w-full">
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-white border border-neutral-200 shadow-lg">
                  <DropdownMenuItem className="font-medium text-xs sm:text-sm">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" className="flex items-center">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleCart}
              className="relative"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
