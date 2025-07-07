// src/utils/facebookPixel.ts
// Facebook Pixel Integration - Ready for when you get your Pixel ID

// Declare fbq function for TypeScript
declare global {
  interface Window {
    fbq: any;
  }
}

// Your Facebook Pixel ID - Replace with your actual Pixel ID when you get it
const FB_PIXEL_ID = 'YOUR_FACEBOOK_PIXEL_ID'; // Replace this with your actual Pixel ID

// Initialize Facebook Pixel
export const initializeFacebookPixel = () => {
  if (FB_PIXEL_ID === 'YOUR_FACEBOOK_PIXEL_ID') {
    console.log('Facebook Pixel ID not set. Please update FB_PIXEL_ID in facebookPixel.ts');
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

  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');
};

// Track Facebook Pixel events
export const trackFBEvent = (eventName: string, parameters?: any) => {
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', eventName, parameters);
  }
};

// E-commerce tracking for Facebook Pixel
export const trackFBPurchase = (value: number, currency: string = 'INR', contentIds?: string[]) => {
  trackFBEvent('Purchase', {
    value: value,
    currency: currency,
    content_ids: contentIds,
    content_type: 'product'
  });
};

export const trackFBAddToCart = (value: number, currency: string = 'INR', contentId?: string, contentName?: string) => {
  trackFBEvent('AddToCart', {
    value: value,
    currency: currency,
    content_ids: [contentId],
    content_name: contentName,
    content_type: 'product'
  });
};

export const trackFBViewContent = (value: number, currency: string = 'INR', contentId?: string, contentName?: string) => {
  trackFBEvent('ViewContent', {
    value: value,
    currency: currency,
    content_ids: [contentId],
    content_name: contentName,
    content_type: 'product'
  });
};

export const trackFBInitiateCheckout = (value: number, currency: string = 'INR', contentIds?: string[]) => {
  trackFBEvent('InitiateCheckout', {
    value: value,
    currency: currency,
    content_ids: contentIds,
    content_type: 'product'
  });
};

export const trackFBSearch = (searchString: string) => {
  trackFBEvent('Search', {
    search_string: searchString
  });
};

export const trackFBLead = () => {
  trackFBEvent('Lead');
};

export const trackFBCompleteRegistration = () => {
  trackFBEvent('CompleteRegistration');
};

// Custom events for your business
export const trackFBCustomEvent = (eventName: string, parameters?: any) => {
  trackFBEvent(eventName, parameters);
};

// Track page views (call this on route changes)
export const trackFBPageView = () => {
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'PageView');
  }
};

// Helper function to check if Facebook Pixel is loaded
export const isFacebookPixelLoaded = (): boolean => {
  return typeof window.fbq !== 'undefined' && FB_PIXEL_ID !== 'YOUR_FACEBOOK_PIXEL_ID';
};

// Instructions for getting your Facebook Pixel ID:
/*
TO GET YOUR FACEBOOK PIXEL ID:

1. Go to Facebook Business Manager (business.facebook.com)
2. Click on "All Tools" in the left menu
3. Under "Measure & Report", click on "Events Manager"
4. Click on "Connect Data Sources" then "Web"
5. Click "Get Started" and choose "Facebook Pixel"
6. Enter your website URL and click "Continue"
7. Choose "Install code manually" if you want to use this implementation
8. Copy your Pixel ID (it looks like: 1234567890123456)
9. Replace 'YOUR_FACEBOOK_PIXEL_ID' above with your actual Pixel ID

Example campaigns to track:
- Track users who visit product pages
- Track users who add items to cart
- Track users who complete purchases
- Create lookalike audiences based on your customers
- Retarget cart abandoners

*/