// src/hooks/useAnalytics.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackPageView, 
  trackEvent,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewItem,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackSelectContent,
  trackLogin,
  trackSignUp,
  trackEngagement
} from '@/utils/analytics';
import { 
  trackFBPageView, 
  trackFBAddToCart, 
  trackFBViewContent, 
  trackFBInitiateCheckout, 
  trackFBPurchase,
  trackFBSearch,
  trackFBLead,
  trackFBCompleteRegistration,
  isFacebookPixelLoaded
} from '@/utils/facebookPixel';
import { trackCampaignAttribution } from '@/utils/utmTracking';

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    const pagePath = location.pathname + location.search;
    const pageTitle = document.title;
    
    // Track in Google Analytics
    trackPageView(pagePath, pageTitle);
    
    // Track in Facebook Pixel
    if (isFacebookPixelLoaded()) {
      trackFBPageView();
    }
    
    // Track campaign attribution for page views
    trackCampaignAttribution('page_view', {
      page: pagePath,
      title: pageTitle
    });
    
  }, [location]);

  // Analytics functions to use in components
  const analytics = {
    // E-commerce tracking
    trackProductView: (product: any) => {
      const item = {
        productId: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price
      };
      
      trackViewItem(item);
      
      if (isFacebookPixelLoaded()) {
        trackFBViewContent(product.price, 'INR', product.id, product.name);
      }
      
      trackCampaignAttribution('view_item', { product_id: product.id });
    },

    trackAddToCart: (product: any, quantity: number = 1) => {
      const item = {
        productId: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        quantity: quantity
      };
      
      trackAddToCart(item);
      
      if (isFacebookPixelLoaded()) {
        trackFBAddToCart(product.price * quantity, 'INR', product.id, product.name);
      }
      
      trackCampaignAttribution('add_to_cart', { 
        product_id: product.id, 
        value: product.price * quantity 
      });
    },

    trackRemoveFromCart: (product: any, quantity: number = 1) => {
      const item = {
        productId: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        quantity: quantity
      };
      
      trackRemoveFromCart(item);
      
      trackCampaignAttribution('remove_from_cart', { 
        product_id: product.id, 
        value: product.price * quantity 
      });
    },

    trackBeginCheckout: (cartItems: any[], totalValue: number) => {
      const items = cartItems.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        category: item.category,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity
      }));
      
      trackBeginCheckout(items, totalValue);
      
      if (isFacebookPixelLoaded()) {
        trackFBInitiateCheckout(totalValue, 'INR', items.map(item => item.productId));
      }
      
      trackCampaignAttribution('begin_checkout', { 
        value: totalValue, 
        items_count: items.length 
      });
    },

    trackPurchase: (transactionId: string, cartItems: any[], totalValue: number) => {
      const items = cartItems.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        category: item.category,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity
      }));
      
      trackPurchase(transactionId, items, totalValue);
      
      if (isFacebookPixelLoaded()) {
        trackFBPurchase(totalValue, 'INR', items.map(item => item.productId));
      }
      
      trackCampaignAttribution('purchase', { 
        transaction_id: transactionId,
        value: totalValue, 
        items_count: items.length 
      });
    },

    // User actions
    trackSearch: (searchTerm: string) => {
      trackSearch(searchTerm);
      
      if (isFacebookPixelLoaded()) {
        trackFBSearch(searchTerm);
      }
      
      trackCampaignAttribution('search', { search_term: searchTerm });
    },

    trackLogin: (method: string = 'email') => {
      trackLogin(method);
      trackCampaignAttribution('login', { method });
    },

    trackSignUp: (method: string = 'email') => {
      trackSignUp(method);
      
      if (isFacebookPixelLoaded()) {
        trackFBCompleteRegistration();
      }
      
      trackCampaignAttribution('sign_up', { method });
    },

    // Content interactions
    trackBrandSelection: (brandName: string) => {
      trackSelectContent('brand', brandName);
      trackCampaignAttribution('select_brand', { brand: brandName });
    },

    trackCategorySelection: (categoryName: string) => {
      trackSelectContent('category', categoryName);
      trackCampaignAttribution('select_category', { category: categoryName });
    },

    // Engagement tracking
    trackEngagement: (type: string, value?: number) => {
      trackEngagement(type, value);
      trackCampaignAttribution('engagement', { type, value });
    },

    // Custom events
    trackCustomEvent: (eventName: string, parameters?: any) => {
      trackEvent(eventName, parameters);
      trackCampaignAttribution('custom_event', { event_name: eventName, ...parameters });
    },

    // Add the trackEvent function to the returned object
    trackEvent: (eventName: string, parameters?: any) => {
      trackEvent(eventName, parameters);
      trackCampaignAttribution('custom_event', { event_name: eventName, ...parameters });
    }
  };

  return analytics;
};