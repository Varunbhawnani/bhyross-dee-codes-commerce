import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { WishlistProvider } from '@/contexts/WishlistContext'; // Already imported
import Index from "./pages/Index";
import BhyrossPage from "./pages/BhyrossPage";
import DeeCodesPage from "./pages/DeeCodesPage";
import ImcolusPage from "./pages/ImcolusPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AboutPage from "./pages/AboutPage";
import SizeGuidePage from "./pages/SizeGuidePage";
import Home from "./pages/Real_Home";
import OrderSuccessPage from "./pages/OrderSuccessPage.tsx";
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from '@/pages/WishlistPage';
import AuthCallback from '@/pages/AuthCallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SettingsProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider> {/* Add WishlistProvider here */}
                  <div className="min-h-screen">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                      <Route path="/imcolus" element={<ImcolusPage />} />
                      <Route path="/bhyross" element={<BhyrossPage />} />
                      <Route path="/deecodes" element={<DeeCodesPage />} />
                      <Route path="/imcolus/:category/:productId" element={<ProductPage />} />
                      <Route path="/bhyross/:category/:productId" element={<ProductPage />} />
                      <Route path="/deecodes/:category/:productId" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      
                      {/* Shared brand pages */}
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/size-guide" element={<SizeGuidePage />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                  <Sonner />
                </WishlistProvider> {/* Close WishlistProvider here */}
              </CartProvider>
            </AuthProvider>
          </SettingsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;