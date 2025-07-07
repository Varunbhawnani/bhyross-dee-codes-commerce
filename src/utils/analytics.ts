// src/utils/analytics.ts
import ReactGA from 'react-ga4';

// Your GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-EQLW0SQFS8';

// Initialize Google Analytics
export const initializeAnalytics = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID, {
    // Remove debug property as it's not supported in GA4
    testMode: process.env.NODE_ENV === 'development',
    gtagOptions: {
      send_page_view: true
    }
  });
};

// Track page views
export const trackPageView = (page: string, title?: string) => {
  ReactGA.send({
    hitType: 'pageview',
    page: page,
    title: title || document.title
  });
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: any) => {
  ReactGA.event(eventName, parameters);
};

// E-commerce tracking functions
export const trackPurchase = (transactionId: string, items: any[], value: number) => {
  ReactGA.event('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'INR',
    items: items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

export const trackAddToCart = (item: any) => {
  ReactGA.event('add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [{
      item_id: item.productId,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand,
      price: item.price,
      quantity: item.quantity
    }]
  });
};

export const trackRemoveFromCart = (item: any) => {
  ReactGA.event('remove_from_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [{
      item_id: item.productId,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand,
      price: item.price,
      quantity: item.quantity
    }]
  });
};

export const trackViewItem = (item: any) => {
  ReactGA.event('view_item', {
    currency: 'INR',
    value: item.price,
    items: [{
      item_id: item.productId,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand,
      price: item.price,
      quantity: 1
    }]
  });
};

export const trackBeginCheckout = (items: any[], value: number) => {
  ReactGA.event('begin_checkout', {
    currency: 'INR',
    value: value,
    items: items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

export const trackSearch = (searchTerm: string) => {
  ReactGA.event('search', {
    search_term: searchTerm
  });
};

export const trackSelectContent = (contentType: string, contentId: string) => {
  ReactGA.event('select_content', {
    content_type: contentType,
    content_id: contentId
  });
};

export const trackLogin = (method: string) => {
  ReactGA.event('login', {
    method: method
  });
};

export const trackSignUp = (method: string) => {
  ReactGA.event('sign_up', {
    method: method
  });
};

// Track user engagement
export const trackEngagement = (engagementType: string, value?: number) => {
  ReactGA.event('engagement', {
    engagement_type: engagementType,
    value: value
  });
};