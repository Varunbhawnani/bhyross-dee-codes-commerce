import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { WishlistProvider } from '@/contexts/WishlistContext';

// Eager load critical pages only
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Real_Home";

// Lazy load all other pages
const BhyrossPage = lazy(() => import("./pages/BhyrossPage"));
const DeeCodesPage = lazy(() => import("./pages/DeeCodesPage"));
const ImcolusPage = lazy(() => import("./pages/ImcolusPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SizeGuidePage = lazy(() => import("./pages/SizeGuidePage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const BulkInquiryPage = lazy(() => import('@/pages/BulkInquiryPage'));

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

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SettingsProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <div className="min-h-screen">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Eager loaded routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/home" element={<Home />} />
                        
                        {/* Lazy loaded routes */}
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                        <Route path="/imcolus" element={<ImcolusPage />} />
                        <Route path="/bhyross" element={<BhyrossPage />} />
                        <Route path="/deecodes" element={<DeeCodesPage />} />
                        <Route path="/imcolus/:category/:productId" element={<ProductPage />} />
                        <Route path="/bhyross/:category/:productId" element={<ProductPage />} />
                        <Route path="/deecodes/:category/:productId" element={<ProductPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/bulk-inquiry" element={<BulkInquiryPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/size-guide" element={<SizeGuidePage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                  <Toaster />
                  <Sonner />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </SettingsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;