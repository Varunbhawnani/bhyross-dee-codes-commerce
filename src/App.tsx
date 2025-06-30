
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import BhyrossPage from "./pages/BhyrossPage";
import DeeCodesPage from "./pages/DeeCodesPage";
import ImcolusPage from "./pages/ImcolusPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import CraftsmanshipPage from "./pages/CraftsmanshipPage";
import CollectionsPage from "./pages/CollectionsPage";
import SizeGuidePage from "./pages/SizeGuidePage";

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
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/imcolus" element={<ImcolusPage />} />
                  <Route path="/bhyross" element={<BhyrossPage />} />
                  <Route path="/deecodes" element={<DeeCodesPage />} />
                  <Route path="/imcolus/:category" element={<CategoryPage />} />
                  <Route path="/bhyross/:category" element={<CategoryPage />} />
                  <Route path="/deecodes/:category" element={<CategoryPage />} />
                  <Route path="/imcolus/:category/:productId" element={<ProductPage />} />
                  <Route path="/bhyross/:category/:productId" element={<ProductPage />} />
                  <Route path="/deecodes/:category/:productId" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  
                  {/* Shared brand pages */}
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/craftsmanship" element={<CraftsmanshipPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/size-guide" element={<SizeGuidePage />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
