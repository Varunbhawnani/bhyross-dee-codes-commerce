// src/utils/utmTracking.ts
import { trackEvent } from './analytics';

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  utm_source_platform?: string;
  utm_creative_format?: string;
  utm_marketing_tactic?: string;
}

// Get UTM parameters from URL
export const getUTMParams = (url?: string): UTMParams => {
  const urlToUse = url || window.location.href;
  const urlParams = new URLSearchParams(new URL(urlToUse).search);
  
  const utmParams: UTMParams = {};
  
  // Standard UTM parameters
  if (urlParams.get('utm_source')) utmParams.utm_source = urlParams.get('utm_source')!;
  if (urlParams.get('utm_medium')) utmParams.utm_medium = urlParams.get('utm_medium')!;
  if (urlParams.get('utm_campaign')) utmParams.utm_campaign = urlParams.get('utm_campaign')!;
  if (urlParams.get('utm_term')) utmParams.utm_term = urlParams.get('utm_term')!;
  if (urlParams.get('utm_content')) utmParams.utm_content = urlParams.get('utm_content')!;
  if (urlParams.get('utm_id')) utmParams.utm_id = urlParams.get('utm_id')!;
  
  // Additional Facebook/Instagram specific parameters
  if (urlParams.get('utm_source_platform')) utmParams.utm_source_platform = urlParams.get('utm_source_platform')!;
  if (urlParams.get('utm_creative_format')) utmParams.utm_creative_format = urlParams.get('utm_creative_format')!;
  if (urlParams.get('utm_marketing_tactic')) utmParams.utm_marketing_tactic = urlParams.get('utm_marketing_tactic')!;
  
  return utmParams;
};

// Store UTM parameters in sessionStorage for the session
export const storeUTMParams = (utmParams: UTMParams) => {
  if (Object.keys(utmParams).length > 0) {
    // Store in memory instead of sessionStorage (Claude.ai restriction)
    (window as any).utmParams = utmParams;
    
    // Track the UTM parameters
    trackEvent('utm_tracked', {
      ...utmParams,
      timestamp: new Date().toISOString()
    });
  }
};

// Get stored UTM parameters
export const getStoredUTMParams = (): UTMParams => {
  return (window as any).utmParams || {};
};

// Clear stored UTM parameters
export const clearStoredUTMParams = () => {
  delete (window as any).utmParams;
};

// Track campaign attribution
export const trackCampaignAttribution = (action: string, additionalData?: any) => {
  const utmParams = getStoredUTMParams();
  
  if (Object.keys(utmParams).length > 0) {
    trackEvent('campaign_attribution', {
      action,
      ...utmParams,
      ...additionalData,
      timestamp: new Date().toISOString()
    });
  }
};

// Initialize UTM tracking on page load
export const initializeUTMTracking = () => {
  const utmParams = getUTMParams();
  
  if (Object.keys(utmParams).length > 0) {
    storeUTMParams(utmParams);
    
    console.log('UTM Parameters detected:', utmParams);
    
    // Track the campaign entry
    trackEvent('campaign_entry', {
      ...utmParams,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }
};

// Function to capture UTM parameters (used by Navigation component)
export const captureUTMParameters = () => {
  const utmParams = getUTMParams();
  
  if (Object.keys(utmParams).length > 0) {
    storeUTMParams(utmParams);
    
    console.log('UTM Parameters captured:', utmParams);
    
    // Track the UTM capture event
    trackEvent('utm_parameters_captured', {
      ...utmParams,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to build URLs with UTM parameters for your ads
export const buildUTMUrl = (baseUrl: string, params: UTMParams): string => {
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
};

// Predefined UTM builders for your common campaigns
export const buildFacebookAdUrl = (baseUrl: string, campaignName: string, adSetName?: string, adName?: string): string => {
  return buildUTMUrl(baseUrl, {
    utm_source: 'facebook',
    utm_medium: 'cpc',
    utm_campaign: campaignName,
    utm_content: adSetName,
    utm_term: adName,
    utm_source_platform: 'facebook_ads'
  });
};

export const buildInstagramAdUrl = (baseUrl: string, campaignName: string, adSetName?: string, adName?: string): string => {
  return buildUTMUrl(baseUrl, {
    utm_source: 'instagram',
    utm_medium: 'cpc',
    utm_campaign: campaignName,
    utm_content: adSetName,
    utm_term: adName,
    utm_source_platform: 'instagram_ads'
  });
};

export const buildOrganicSocialUrl = (baseUrl: string, platform: string, postType?: string): string => {
  return buildUTMUrl(baseUrl, {
    utm_source: platform,
    utm_medium: 'social',
    utm_campaign: 'organic',
    utm_content: postType || 'post'
  });
};