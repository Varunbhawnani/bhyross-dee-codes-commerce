// src/utils/analytics.ts
import ReactGA from 'react-ga4';

// Get GA4 Measurement ID from environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initializeAnalytics = () => {
  // Don't initialize if no measurement ID is provided
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA_MEASUREMENT_ID not found in environment variables');
    return;
  }

  try {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      testMode: import.meta.env.MODE === 'development',
      gtagOptions: {
        send_page_view: false, // We'll handle page views manually
        anonymize_ip: true,
        cookie_flags: 'SameSite=Strict;Secure',
        // Enhanced e-commerce settings
        custom_map: {
          custom_parameter_1: 'user_type',
          custom_parameter_2: 'session_id'
        }
      }
    });
    
    // Set default parameters for all events
    ReactGA.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
      // Add custom dimensions
      custom_map: {
        custom_parameter_1: 'user_type'
      }
    });
    
    console.log('Google Analytics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

// Generate a session ID for guest users
const generateSessionId = () => {
  return 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Get or create session ID for guest tracking
const getSessionId = () => {
  if (typeof window === 'undefined') return null; // SSR check
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Enhanced page view tracking with error handling
export const trackPageView = (page: string, title?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    ReactGA.send({
      hitType: 'pageview',
      page: page,
      title: title || document.title
    });
    
    // Also send as gtag event for better tracking
    ReactGA.gtag('event', 'page_view', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: page,
      user_type: getUserType(),
      session_id: getSessionId()
    });
    
    console.log('Page view tracked:', page);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Helper function to determine user type
const getUserType = () => {
  if (typeof window === 'undefined') return 'unknown'; // SSR check
  
  // Check if user is logged in (you might need to adjust this based on your auth implementation)
  const userToken = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
  return userToken ? 'authenticated' : 'guest';
};

// Enhanced event tracking with better error handling and guest user support
export const trackEvent = (eventName: string, parameters?: any) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const enhancedParameters = {
      ...parameters,
      user_type: getUserType(),
      session_id: getSessionId(),
      timestamp: new Date().toISOString()
    };
    
    ReactGA.event(eventName, enhancedParameters);
    console.log('Event tracked:', eventName, enhancedParameters);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Enhanced e-commerce tracking functions
export const trackPurchase = (transactionId: string, items: any[], value: number, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const purchaseData = {
      transaction_id: transactionId,
      value: value,
      currency: 'INR',
      user_type: userType || getUserType(),
      session_id: getSessionId(),
      items: items.map(item => ({
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category || 'Unknown',
        item_brand: item.brand || 'Unknown',
        price: item.price,
        quantity: item.quantity,
        item_variant: item.size ? `Size ${item.size}` : undefined
      }))
    };
    
    ReactGA.event('purchase', purchaseData);
    console.log('Purchase tracked:', purchaseData);
  } catch (error) {
    console.error('Failed to track purchase:', error);
  }
};

export const trackAddToCart = (item: any, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const cartData = {
      currency: 'INR',
      value: item.price * item.quantity,
      user_type: userType || getUserType(),
      session_id: getSessionId(),
      items: [{
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category || 'Unknown',
        item_brand: item.brand || 'Unknown',
        price: item.price,
        quantity: item.quantity,
        item_variant: item.size ? `Size ${item.size}` : undefined
      }]
    };
    
    ReactGA.event('add_to_cart', cartData);
    console.log('Add to cart tracked:', cartData);
  } catch (error) {
    console.error('Failed to track add to cart:', error);
  }
};

export const trackRemoveFromCart = (item: any, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const cartData = {
      currency: 'INR',
      value: item.price * item.quantity,
      user_type: userType || getUserType(),
      session_id: getSessionId(),
      items: [{
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category || 'Unknown',
        item_brand: item.brand || 'Unknown',
        price: item.price,
        quantity: item.quantity,
        item_variant: item.size ? `Size ${item.size}` : undefined
      }]
    };
    
    ReactGA.event('remove_from_cart', cartData);
    console.log('Remove from cart tracked:', cartData);
  } catch (error) {
    console.error('Failed to track remove from cart:', error);
  }
};

export const trackViewItem = (item: any, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const viewData = {
      currency: 'INR',
      value: item.price,
      user_type: userType || getUserType(),
      session_id: getSessionId(),
      items: [{
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category || 'Unknown',
        item_brand: item.brand || 'Unknown',
        price: item.price,
        quantity: 1,
        item_variant: item.size ? `Size ${item.size}` : undefined
      }]
    };
    
    ReactGA.event('view_item', viewData);
    console.log('View item tracked:', viewData);
  } catch (error) {
    console.error('Failed to track view item:', error);
  }
};

export const trackBeginCheckout = (items: any[], value: number, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const checkoutData = {
      currency: 'INR',
      value: value,
      user_type: userType || getUserType(),
      session_id: getSessionId(),
      items: items.map(item => ({
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category || 'Unknown',
        item_brand: item.brand || 'Unknown',
        price: item.price,
        quantity: item.quantity,
        item_variant: item.size ? `Size ${item.size}` : undefined
      }))
    };
    
    ReactGA.event('begin_checkout', checkoutData);
    console.log('Begin checkout tracked:', checkoutData);
  } catch (error) {
    console.error('Failed to track begin checkout:', error);
  }
};

export const trackSearch = (searchTerm: string, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const searchData = {
      search_term: searchTerm,
      user_type: userType || getUserType(),
      session_id: getSessionId()
    };
    
    ReactGA.event('search', searchData);
    console.log('Search tracked:', searchData);
  } catch (error) {
    console.error('Failed to track search:', error);
  }
};

export const trackSelectContent = (contentType: string, contentId: string, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const selectData = {
      content_type: contentType,
      content_id: contentId,
      user_type: userType || getUserType(),
      session_id: getSessionId()
    };
    
    ReactGA.event('select_content', selectData);
    console.log('Select content tracked:', selectData);
  } catch (error) {
    console.error('Failed to track select content:', error);
  }
};

export const trackLogin = (method: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    // Clear guest session when user logs in
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('analytics_session_id');
    }
    
    const loginData = {
      method: method,
      user_type: 'authenticated',
      session_id: getSessionId() // This will generate a new session ID
    };
    
    ReactGA.event('login', loginData);
    console.log('Login tracked:', loginData);
  } catch (error) {
    console.error('Failed to track login:', error);
  }
};

export const trackSignUp = (method: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const signupData = {
      method: method,
      user_type: 'authenticated',
      session_id: getSessionId()
    };
    
    ReactGA.event('sign_up', signupData);
    console.log('Sign up tracked:', signupData);
  } catch (error) {
    console.error('Failed to track sign up:', error);
  }
};

// Enhanced engagement tracking
export const trackEngagement = (engagementType: string, value?: number, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const engagementData = {
      engagement_type: engagementType,
      value: value,
      user_type: userType || getUserType(),
      session_id: getSessionId()
    };
    
    ReactGA.event('engagement', engagementData);
    console.log('Engagement tracked:', engagementData);
  } catch (error) {
    console.error('Failed to track engagement:', error);
  }
};

// New function to track cart views
export const trackViewCart = (items: any[], value: number, userType?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const cartViewData = {
      currency: 'INR',
      value: value,
      user_type: userType || getUserType(),
      session_id: getSessionId(),
      items: items.map(item => ({
        item_id: item.productId || item.id,
        item_name: item.name,
        item_category: item.category || 'Unknown',
        item_brand: item.brand || 'Unknown',
        price: item.price,
        quantity: item.quantity,
        item_variant: item.size ? `Size ${item.size}` : undefined
      }))
    };
    
    ReactGA.event('view_cart', cartViewData);
    console.log('View cart tracked:', cartViewData);
  } catch (error) {
    console.error('Failed to track view cart:', error);
  }
};

// Function to track user journey milestones
export const trackUserJourney = (milestone: string, additionalData?: any) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const journeyData = {
      milestone: milestone,
      user_type: getUserType(),
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    ReactGA.event('user_journey', journeyData);
    console.log('User journey tracked:', journeyData);
  } catch (error) {
    console.error('Failed to track user journey:', error);
  }
};

// Function to track cart abandonment
export const trackCartAbandonment = (items: any[], value: number, stage: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const abandonmentData = {
      currency: 'INR',
      value: value,
      abandonment_stage: stage,
      user_type: getUserType(),
      session_id: getSessionId(),
      items_count: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0)
    };
    
    ReactGA.event('cart_abandonment', abandonmentData);
    console.log('Cart abandonment tracked:', abandonmentData);
  } catch (error) {
    console.error('Failed to track cart abandonment:', error);
  }
};

// Enhanced error tracking
export const trackError = (errorType: string, errorMessage: string, errorLocation?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    const errorData = {
      error_type: errorType,
      error_message: errorMessage,
      error_location: errorLocation || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
      user_type: getUserType(),
      session_id: getSessionId(),
      timestamp: new Date().toISOString()
    };
    
    ReactGA.event('exception', errorData);
    console.log('Error tracked:', errorData);
  } catch (error) {
    console.error('Failed to track error:', error);
  }
};

// Function to set user properties when user logs in
export const setUserProperties = (userId: string, properties?: any) => {
  if (!GA_MEASUREMENT_ID) return;
  
  try {
    ReactGA.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId,
      custom_map: {
        user_type: 'authenticated'
      },
      ...properties
    });
    
    console.log('User properties set:', { userId, properties });
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
};

// Export utility functions
export { getUserType, getSessionId };