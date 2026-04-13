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
  trackEngagement,
  trackViewCart,
  trackUserJourney,
  trackCartAbandonment,
  trackError,
  setUserProperties
} from '@/utils/analytics';
import { 
  trackFBAddToCart, 
  trackFBViewContent, 
  trackFBInitiateCheckout, 
  trackFBPurchase,
  trackFBSearch,
  trackFBLead,
  trackFBCompleteRegistration,
  trackFBAddToWishlist,
  trackFBAddPaymentInfo,
  trackFBContact,
  trackFBCustomizeProduct,
  trackFBDonate,
  trackFBFindLocation,
  trackFBSchedule,
  trackFBStartTrial,
  trackFBSubmitApplication,
  trackFBSubscribe,
  isFacebookPixelLoaded
} from '@/utils/facebookPixel';
import { trackCampaignAttribution } from '@/utils/utmTracking';

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views on route change with proper deduplication
  useEffect(() => {
    const pagePath = location.pathname + location.search;
    const pageTitle = document.title;
    
    // Track in Google Analytics
    trackPageView(pagePath, pageTitle);
    
    // Track route change in Facebook Pixel (NOT PageView to avoid duplicates)
    
    // Track campaign attribution for page views
    trackCampaignAttribution('page_view', {
      page: pagePath,
      title: pageTitle
    });
    
  }, [location]);

  // Analytics functions to use in components
  const analytics = {
    // E-commerce tracking with better deduplication
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
        trackFBViewContent(product.price, 'INR', product.id, product.name, product.category);
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
        trackFBAddToCart(product.price * quantity, 'INR', product.id, product.name, quantity);
      }
      
      trackCampaignAttribution('add_to_cart', { 
        product_id: product.id, 
        value: product.price * quantity 
      });
    },

    trackAddToWishlist: (product: any) => {
      const item = {
        productId: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price
      };
      
      // Google Analytics - using custom event
      trackEvent('add_to_wishlist', {
        currency: 'INR',
        value: product.price,
        items: [item]
      });
      
      if (isFacebookPixelLoaded()) {
        trackFBAddToWishlist(product.price, 'INR', [product.id], product.name);
      }
      
      trackCampaignAttribution('add_to_wishlist', { 
        product_id: product.id, 
        value: product.price 
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
        trackFBInitiateCheckout(
          totalValue, 
          'INR', 
          items.map(item => item.productId),
          items.reduce((sum, item) => sum + item.quantity, 0)
        );
      }
      
      trackCampaignAttribution('begin_checkout', { 
        value: totalValue, 
        items_count: items.length 
      });
    },

    trackAddPaymentInfo: (cartItems: any[], totalValue: number) => {
      const items = cartItems.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        category: item.category,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity
      }));
      
      // Google Analytics - using custom event
      trackEvent('add_payment_info', {
        currency: 'INR',
        value: totalValue,
        items: items
      });
      
      if (isFacebookPixelLoaded()) {
        trackFBAddPaymentInfo(
          totalValue, 
          'INR', 
          items.map(item => item.productId)
        );
      }
      
      trackCampaignAttribution('add_payment_info', { 
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
        trackFBPurchase(
          totalValue, 
          'INR', 
          items.map(item => item.productId),
          { orderId: transactionId, items }
        );
      }
      
      trackCampaignAttribution('purchase', { 
        transaction_id: transactionId,
        value: totalValue, 
        items_count: items.length 
      });
    },

    // User actions
    trackSearch: (searchTerm: string, category?: string) => {
      trackSearch(searchTerm);
      
      if (isFacebookPixelLoaded()) {
        trackFBSearch(searchTerm, category);
      }
      
      trackCampaignAttribution('search', { search_term: searchTerm });
    },

    trackLogin: (method: string = 'email', user?: any) => {
      trackLogin(method);
      
      // Set user properties if user data is available
      if (user) {
        setUserProperties(user.id, {
          email: user.email,
          signup_date: user.created_at,
          user_type: 'authenticated'
        });
      }
      
      trackCampaignAttribution('login', { method });
    },

    trackSignUp: (method: string = 'email', user?: any) => {
      trackSignUp(method);
      
      // Set user properties for new user
      if (user) {
        setUserProperties(user.id, {
          email: user.email,
          signup_date: user.created_at,
          user_type: 'authenticated'
        });
      }
      
      if (isFacebookPixelLoaded()) {
        trackFBCompleteRegistration(method);
      }
      
      trackCampaignAttribution('sign_up', { method });
    },

    trackLogout: () => {
      // Clear session when user logs out
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('analytics_session_id');
      }
      trackEvent('logout');
      trackCampaignAttribution('logout');
    },

    // Lead generation
    trackLead: (contentName?: string, value?: number) => {
      // Google Analytics - using custom event
      trackEvent('generate_lead', {
        ...(contentName && { content_name: contentName }),
        ...(value && { value: value, currency: 'INR' })
      });
      
      if (isFacebookPixelLoaded()) {
        trackFBLead(contentName, value);
      }
      
      trackCampaignAttribution('generate_lead', { 
        content_name: contentName,
        value: value 
      });
    },

    // Contact
    trackContact: () => {
      trackEvent('contact');
      
      if (isFacebookPixelLoaded()) {
        trackFBContact();
      }
      
      trackCampaignAttribution('contact');
    },

    // Product customization
    trackCustomizeProduct: (product: any) => {
      trackEvent('customize_product', {
        product_id: product.id,
        product_name: product.name,
        value: product.price,
        currency: 'INR'
      });
      
      if (isFacebookPixelLoaded()) {
        trackFBCustomizeProduct(product.price, 'INR', [product.id]);
      }
      
      trackCampaignAttribution('customize_product', { 
        product_id: product.id, 
        value: product.price 
      });
    },

    // Donation
    trackDonate: (amount: number) => {
      trackEvent('donate', {
        value: amount,
        currency: 'INR'
      });
      
      if (isFacebookPixelLoaded()) {
        trackFBDonate(amount, 'INR');
      }
      
      trackCampaignAttribution('donate', { value: amount });
    },

    // Find location
    trackFindLocation: () => {
      trackEvent('find_location');
      
      if (isFacebookPixelLoaded()) {
        trackFBFindLocation();
      }
      
      trackCampaignAttribution('find_location');
    },

    // Schedule appointment
    trackSchedule: () => {
      trackEvent('schedule');
      
      if (isFacebookPixelLoaded()) {
        trackFBSchedule();
      }
      
      trackCampaignAttribution('schedule');
    },

    // Start trial
    trackStartTrial: (value?: string, currency: string = 'USD', predictedLtv?: string) => {
      trackEvent('start_trial', {
        ...(value && { value: value }),
        ...(currency && { currency: currency })
      });
      
      if (isFacebookPixelLoaded()) {
        trackFBStartTrial(value, currency, predictedLtv);
      }
      
      trackCampaignAttribution('start_trial', { 
        value: value,
        currency: currency 
      });
    },

    // Submit application
    trackSubmitApplication: () => {
      trackEvent('submit_application');
      
      if (isFacebookPixelLoaded()) {
        trackFBSubmitApplication();
      }
      
      trackCampaignAttribution('submit_application');
    },

    // Subscribe
    trackSubscribe: (value?: string, currency: string = 'USD', predictedLtv?: string) => {
      trackEvent('subscribe', {
        ...(value && { value: value }),
        ...(currency && { currency: currency })
      });
      
      if (isFacebookPixelLoaded()) {
        trackFBSubscribe(value, currency, predictedLtv);
      }
      
      trackCampaignAttribution('subscribe', { 
        value: value,
        currency: currency 
      });
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

    // Enhanced tracking functions (keeping Google Analytics functionality)
    trackViewCart: (cartItems: any[], totalValue: number) => {
      trackViewCart(cartItems, totalValue);
      trackUserJourney('cart_viewed', { 
        items_count: cartItems.length,
        total_value: totalValue
      });
      trackCampaignAttribution('view_cart', { 
        value: totalValue,
        items_count: cartItems.length 
      });
    },

    trackUserJourney: (milestone: string, additionalData?: any) => {
      trackUserJourney(milestone, additionalData);
      trackCampaignAttribution('user_journey', { 
        milestone,
        ...additionalData 
      });
    },

    trackCartAbandonment: (cartItems: any[], totalValue: number, stage: string) => {
      trackCartAbandonment(cartItems, totalValue, stage);
      trackCampaignAttribution('cart_abandonment', { 
        stage,
        value: totalValue,
        items_count: cartItems.length 
      });
    },

    trackError: (errorType: string, errorMessage: string, errorLocation?: string) => {
      trackError(errorType, errorMessage, errorLocation);
      trackCampaignAttribution('error', { 
        error_type: errorType,
        error_message: errorMessage,
        error_location: errorLocation 
      });
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

    // Generic event tracking
    trackEvent: (eventName: string, parameters?: any) => {
      trackEvent(eventName, parameters);
      trackCampaignAttribution('custom_event', { event_name: eventName, ...parameters });
    }
  };

  return analytics;
};