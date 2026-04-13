// src/utils/facebookPixel.ts
// Facebook Pixel Integration with proper duplicate prevention and ONLY standard events

declare global {
  interface Window {
    fbq: any;
    _fbPixelInitialized?: boolean;
    _fbPixelEvents?: Set<string>; // Track fired events to prevent duplicates
  }
}

const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;
const isDevelopment = import.meta.env.MODE === 'development';

// Initialize Facebook Pixel with proper duplicate prevention
export const initializeFacebookPixel = () => {
  // Prevent double initialization
  if (window._fbPixelInitialized) {
    console.log('Facebook Pixel: Already initialized, skipping...');
    return;
  }

  if (!FB_PIXEL_ID) {
    console.warn('Facebook Pixel ID not found in environment variables');
    return;
  }

  // Initialize event tracking set
  if (!window._fbPixelEvents) {
    window._fbPixelEvents = new Set();
  }

  // Check if fbq already exists (maybe loaded by other scripts)
  if (window.fbq) {
    console.log('Facebook Pixel: fbq already exists, just initializing with Pixel ID...');
    window.fbq('init', FB_PIXEL_ID);
    // Only track initial PageView once
    if (!window._fbPixelEvents.has('initial_pageview')) {
      window.fbq('track', 'PageView');
      window._fbPixelEvents.add('initial_pageview');
    }
    window._fbPixelInitialized = true;
    return;
  }

  // Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  // Initialize with your Pixel ID
  window.fbq('init', FB_PIXEL_ID);
  
  // Track initial PageView only once
  if (!window._fbPixelEvents.has('initial_pageview')) {
    window.fbq('track', 'PageView');
    window._fbPixelEvents.add('initial_pageview');
  }

  // Add noscript fallback
  if (typeof document !== 'undefined' && !document.querySelector('noscript[data-fb-pixel]')) {
    const noscript = document.createElement('noscript');
    noscript.setAttribute('data-fb-pixel', 'true');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);
  }

  window._fbPixelInitialized = true;
  console.log('Facebook Pixel initialized successfully with ID:', FB_PIXEL_ID);
};

// Enhanced tracking with duplicate prevention
const logEvent = (eventName: string, parameters: any) => {
  if (isDevelopment) {
    console.log(`FB Pixel Event: ${eventName}`, parameters);
  }
};

// Create unique event key for deduplication (more specific for certain events)
const createEventKey = (eventName: string, parameters?: any): string => {
  // For ViewContent events, create key based on content_ids to prevent duplicates for same product
  if (eventName === 'ViewContent' && parameters?.content_ids?.length > 0) {
    return `${eventName}_${parameters.content_ids[0]}_${Math.floor(Date.now() / 5000)}`; // 5 second window
  }
  
  // For AddToCart, create key based on content and timestamp window
  if (eventName === 'AddToCart' && parameters?.content_ids?.length > 0) {
    return `${eventName}_${parameters.content_ids[0]}_${Math.floor(Date.now() / 2000)}`; // 2 second window
  }
  
  // For other events, use full parameters but with time window
  const key = `${eventName}_${JSON.stringify(parameters || {})}_${Math.floor(Date.now() / 1000)}`;
  return key;
};

// Track Facebook Pixel events with safety check and enhanced deduplication
export const trackFBEvent = (eventName: string, parameters?: any, allowDuplicates: boolean = false) => {
  if (typeof window.fbq !== 'undefined' && window._fbPixelInitialized) {
    // Validate parameters to prevent tracking with invalid data
    if (eventName === 'AddToCart' || eventName === 'ViewContent') {
      if (parameters?.value === 0 || parameters?.value === null || parameters?.value === undefined) {
        console.warn(`FB Pixel: Skipping ${eventName} event due to invalid value:`, parameters?.value);
        return;
      }
    }
    
    // Create unique key for this event
    const eventKey = allowDuplicates ? null : createEventKey(eventName, parameters);
    
    // Check for duplicates (except for events that should allow duplicates)
    if (!allowDuplicates && eventKey && window._fbPixelEvents?.has(eventKey)) {
      console.log(`FB Pixel: Duplicate event prevented: ${eventName} (${eventKey})`);
      return;
    }

    // Track the event
    window.fbq('track', eventName, parameters);
    logEvent(eventName, parameters);
    
    // Add to events set to prevent duplicates
    if (eventKey && window._fbPixelEvents) {
      window._fbPixelEvents.add(eventKey);
      
      // Clean up old events (keep last 50 to prevent memory issues)
      if (window._fbPixelEvents.size > 50) {
        const eventsArray = Array.from(window._fbPixelEvents);
        window._fbPixelEvents.clear();
        eventsArray.slice(-25).forEach(event => window._fbPixelEvents?.add(event));
      }
    }
  } else {
    console.warn('Facebook Pixel not properly loaded or initialized, event not tracked:', eventName);
  }
};

// STANDARD EVENTS ONLY - Following Meta's official documentation

// AddPaymentInfo
export const trackFBAddPaymentInfo = (value?: number, currency: string = 'INR', contentIds?: string[]) => {
  const parameters: any = {};
  
  if (value !== undefined) {
    parameters.value = value;
    parameters.currency = currency;
  }
  
  if (contentIds && contentIds.length > 0) {
    parameters.content_ids = contentIds;
  }

  trackFBEvent('AddPaymentInfo', parameters);
};

// AddToCart
export const trackFBAddToCart = (value: number, currency: string = 'INR', contentId?: string, contentName?: string, quantity?: number) => {
  // Validate input parameters
  if (!value || value <= 0) {
    console.warn('FB Pixel: AddToCart event skipped - invalid value:', value);
    return;
  }
  
  if (!contentId) {
    console.warn('FB Pixel: AddToCart event skipped - missing contentId');
    return;
  }

  const parameters = {
    value: Number(value), // Ensure it's a number
    currency: currency,
    content_ids: [contentId],
    content_name: contentName || 'Product',
    content_type: 'product',
    ...(quantity && { num_items: quantity })
  };

  trackFBEvent('AddToCart', parameters);
};

// AddToWishlist
export const trackFBAddToWishlist = (value?: number, currency: string = 'INR', contentIds?: string[], contentName?: string) => {
  const parameters: any = {
    content_type: 'product'
  };
  
  if (value !== undefined) {
    parameters.value = value;
    parameters.currency = currency;
  }
  
  if (contentIds && contentIds.length > 0) {
    parameters.content_ids = contentIds;
  }
  
  if (contentName) {
    parameters.content_name = contentName;
  }

  trackFBEvent('AddToWishlist', parameters);
};

// CompleteRegistration
export const trackFBCompleteRegistration = (method?: string) => {
  const parameters: any = {};
  
  if (method) {
    parameters.registration_method = method;
  }

  trackFBEvent('CompleteRegistration', parameters);
};

// Contact
export const trackFBContact = () => {
  trackFBEvent('Contact');
};

// CustomizeProduct
export const trackFBCustomizeProduct = (value?: number, currency: string = 'INR', contentIds?: string[]) => {
  const parameters: any = {};
  
  if (value !== undefined) {
    parameters.value = value;
    parameters.currency = currency;
  }
  
  if (contentIds && contentIds.length > 0) {
    parameters.content_ids = contentIds;
  }

  trackFBEvent('CustomizeProduct', parameters);
};

// Donate
export const trackFBDonate = (value: number, currency: string = 'INR') => {
  const parameters = {
    value: value,
    currency: currency
  };

  trackFBEvent('Donate', parameters);
};

// FindLocation
export const trackFBFindLocation = () => {
  trackFBEvent('FindLocation');
};

// InitiateCheckout
export const trackFBInitiateCheckout = (value: number, currency: string = 'INR', contentIds?: string[], numItems?: number) => {
  const parameters: any = {
    value: value,
    currency: currency,
    content_type: 'product'
  };
  
  if (contentIds && contentIds.length > 0) {
    parameters.content_ids = contentIds;
  }
  
  if (numItems) {
    parameters.num_items = numItems;
  }

  trackFBEvent('InitiateCheckout', parameters);
};

// Lead
export const trackFBLead = (contentName?: string, value?: number, currency: string = 'INR') => {
  const parameters: any = {};
  
  if (contentName) {
    parameters.content_name = contentName;
  }
  
  if (value !== undefined) {
    parameters.value = value;
    parameters.currency = currency;
  }

  trackFBEvent('Lead', parameters);
};

// Purchase
export const trackFBPurchase = (value: number, currency: string = 'INR', contentIds?: string[], orderData?: any) => {
  const parameters = {
    value: value,
    currency: currency,
    content_type: 'product',
    ...(contentIds && contentIds.length > 0 && { content_ids: contentIds }),
    ...(contentIds && { num_items: contentIds.length }),
    ...(orderData && {
      order_id: orderData.orderId,
      content_name: orderData.items?.map((item: any) => item.name).join(', '),
    })
  };

  // Allow duplicates for purchase events (different orders)
  trackFBEvent('Purchase', parameters, true);
};

// Schedule
export const trackFBSchedule = () => {
  trackFBEvent('Schedule');
};

// Search
export const trackFBSearch = (searchString: string, contentCategory?: string) => {
  const parameters: any = {
    search_string: searchString
  };
  
  if (contentCategory) {
    parameters.content_category = contentCategory;
  }

  trackFBEvent('Search', parameters);
};

// StartTrial
export const trackFBStartTrial = (value: string = '0.00', currency: string = 'USD', predictedLtv: string = '0.00') => {
  const parameters = {
    value: value,
    currency: currency,
    predicted_ltv: predictedLtv
  };

  trackFBEvent('StartTrial', parameters);
};

// SubmitApplication
export const trackFBSubmitApplication = () => {
  trackFBEvent('SubmitApplication');
};

// Subscribe
export const trackFBSubscribe = (value: string = '0.00', currency: string = 'USD', predictedLtv: string = '0.00') => {
  const parameters = {
    value: value,
    currency: currency,
    predicted_ltv: predictedLtv
  };

  trackFBEvent('Subscribe', parameters);
};

// ViewContent
export const trackFBViewContent = (value: number, currency: string = 'INR', contentId?: string, contentName?: string, contentCategory?: string) => {
  // Validate input parameters
  if (!value || value <= 0) {
    console.warn('FB Pixel: ViewContent event skipped - invalid value:', value);
    return;
  }
  
  if (!contentId) {
    console.warn('FB Pixel: ViewContent event skipped - missing contentId');
    return;
  }

  const parameters = {
    value: Number(value), // Ensure it's a number
    currency: currency,
    content_ids: [contentId],
    content_name: contentName || 'Product',
    content_type: 'product',
    ...(contentCategory && { content_category: contentCategory })
  };

  trackFBEvent('ViewContent', parameters);
};

// REMOVED: trackFBPageView - we'll handle route changes differently
// This was causing the duplicate PageView events

// Custom route change tracking (replaces PageView for navigation)
export const trackFBRouteChange = (pageName?: string, path?: string) => {
  if (typeof window.fbq !== 'undefined' && window._fbPixelInitialized) {
    const parameters = {
      page_name: pageName,
      page_path: path,
      timestamp: Date.now()
    };
    
    // Use trackCustom to avoid PageView conflicts
    window.fbq('trackCustom', 'RouteChange', parameters);
    logEvent('RouteChange', parameters);
  }
};

// Helper function to check if Facebook Pixel is loaded
export const isFacebookPixelLoaded = (): boolean => {
  return typeof window.fbq !== 'undefined' && window._fbPixelInitialized === true;
};

// Utility functions - REMOVED non-standard events, keeping only helpers
export const fbPixelUtils = {
  // Clear event cache (useful for testing)
  clearEventCache: () => {
    if (window._fbPixelEvents) {
      window._fbPixelEvents.clear();
      console.log('FB Pixel event cache cleared');
    }
  }
};

export default {
  initialize: initializeFacebookPixel,
  trackEvent: trackFBEvent,
  
  // Standard Events
  trackAddPaymentInfo: trackFBAddPaymentInfo,
  trackAddToCart: trackFBAddToCart,
  trackAddToWishlist: trackFBAddToWishlist,
  trackCompleteRegistration: trackFBCompleteRegistration,
  trackContact: trackFBContact,
  trackCustomizeProduct: trackFBCustomizeProduct,
  trackDonate: trackFBDonate,
  trackFindLocation: trackFBFindLocation,
  trackInitiateCheckout: trackFBInitiateCheckout,
  trackLead: trackFBLead,
  trackPurchase: trackFBPurchase,
  trackSchedule: trackFBSchedule,
  trackSearch: trackFBSearch,
  trackStartTrial: trackFBStartTrial,
  trackSubmitApplication: trackFBSubmitApplication,
  trackSubscribe: trackFBSubscribe,
  trackViewContent: trackFBViewContent,
  

  
  // Utilities
  isLoaded: isFacebookPixelLoaded,
  utils: fbPixelUtils
};