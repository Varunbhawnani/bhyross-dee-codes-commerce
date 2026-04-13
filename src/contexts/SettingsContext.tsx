import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface BrandSocialMedia {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  [key: string]: string;
}

export interface SettingsState {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockThreshold: number;
  currency: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    bhyross: BrandSocialMedia;
    deecodes: BrandSocialMedia;
    imcolus: BrandSocialMedia;
  };
}

const defaultSettings: SettingsState = {
  siteName: 'Imcolus',
  siteDescription: 'Premium formal footwear crafted for the modern professional',
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  orderNotifications: true,
  lowStockThreshold: 10,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  contactEmail: 'support@imcolus.com',
  contactPhone: '+91 98765 43210',
  address: '123 Fashion Street\nMumbai, Maharashtra 400001\nIndia',
  socialMedia: {
    bhyross: {
      facebook: 'https://www.facebook.com/profile.php?id=61577605751349',
      instagram: 'https://instagram.com/bhyross',
      twitter: 'https://twitter.com/bhyross',
      linkedin: 'https://linkedin.com/company/bhyross'
    },
    deecodes: {
      facebook: 'https://www.facebook.com/profile.php?id=61563305607460',
      instagram: 'https://instagram.com/deecodes',
      twitter: 'https://twitter.com/deecodes',
      linkedin: 'https://linkedin.com/company/deecodes'
    },
    imcolus: {
      facebook: 'https://www.facebook.com/imcolus',
      instagram: 'https://instagram.com/imcolus',
      twitter: 'https://twitter.com/imcolus',
      linkedin: 'https://linkedin.com/company/imcolus'
    }
  }
};

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to safely parse social media JSON
const parseSocialMedia = (socialMediaData: any): SettingsState['socialMedia'] => {
  if (typeof socialMediaData === 'object' && socialMediaData !== null) {
    return {
      bhyross: {
        facebook: socialMediaData.bhyross?.facebook || defaultSettings.socialMedia.bhyross.facebook,
        instagram: socialMediaData.bhyross?.instagram || defaultSettings.socialMedia.bhyross.instagram,
        twitter: socialMediaData.bhyross?.twitter || defaultSettings.socialMedia.bhyross.twitter,
        linkedin: socialMediaData.bhyross?.linkedin || defaultSettings.socialMedia.bhyross.linkedin,
      },
      deecodes: {
        facebook: socialMediaData.deecodes?.facebook || defaultSettings.socialMedia.deecodes.facebook,
        instagram: socialMediaData.deecodes?.instagram || defaultSettings.socialMedia.deecodes.instagram,
        twitter: socialMediaData.deecodes?.twitter || defaultSettings.socialMedia.deecodes.twitter,
        linkedin: socialMediaData.deecodes?.linkedin || defaultSettings.socialMedia.deecodes.linkedin,
      },
      imcolus: {
        facebook: socialMediaData.imcolus?.facebook || defaultSettings.socialMedia.imcolus.facebook,
        instagram: socialMediaData.imcolus?.instagram || defaultSettings.socialMedia.imcolus.instagram,
        twitter: socialMediaData.imcolus?.twitter || defaultSettings.socialMedia.imcolus.twitter,
        linkedin: socialMediaData.imcolus?.linkedin || defaultSettings.socialMedia.imcolus.linkedin,
      }
    };
  }
  return defaultSettings.socialMedia;
};

// Fetch settings from Supabase
const fetchSettings = async (): Promise<SettingsState> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return defaultSettings;
  }

  return {
    siteName: data.site_name || defaultSettings.siteName,
    siteDescription: data.site_description || defaultSettings.siteDescription,
    maintenanceMode: data.maintenance_mode || defaultSettings.maintenanceMode,
    allowRegistration: data.allow_registration || defaultSettings.allowRegistration,
    emailNotifications: data.email_notifications || defaultSettings.emailNotifications,
    orderNotifications: data.order_notifications || defaultSettings.orderNotifications,
    lowStockThreshold: data.low_stock_threshold || defaultSettings.lowStockThreshold,
    currency: data.currency || defaultSettings.currency,
    timezone: data.timezone || defaultSettings.timezone,
    contactEmail: data.contact_email || defaultSettings.contactEmail,
    contactPhone: data.contact_phone || defaultSettings.contactPhone,
    address: data.address || defaultSettings.address,
    socialMedia: parseSocialMedia(data.social_media),
  };
};

// Save settings to Supabase with improved error handling
const saveSettingsToDb = async (settings: SettingsState): Promise<void> => {
  try {
    // First check if we have any existing settings
    const { data: existingData, error: fetchError } = await supabase
      .from('site_settings')
      .select('id')
      .single();

    const settingsData: Database['public']['Tables']['site_settings']['Insert'] = {
      site_name: settings.siteName,
      site_description: settings.siteDescription,
      maintenance_mode: settings.maintenanceMode,
      allow_registration: settings.allowRegistration,
      email_notifications: settings.emailNotifications,
      order_notifications: settings.orderNotifications,
      low_stock_threshold: settings.lowStockThreshold,
      currency: settings.currency,
      timezone: settings.timezone,
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone,
      address: settings.address,
      social_media: settings.socialMedia as unknown as Database['public']['Tables']['site_settings']['Insert']['social_media'],
      updated_at: new Date().toISOString(),
    };

    let result;
    
    if (existingData && !fetchError) {
      // Update existing record
      result = await supabase
        .from('site_settings')
        .update(settingsData)
        .eq('id', existingData.id);
    } else {
      // Insert new record
      result = await supabase
        .from('site_settings')
        .insert(settingsData);
    }

    if (result.error) {
      console.error('Supabase error details:', {
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code
      });
      throw result.error;
    }

  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data: settings = defaultSettings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    mutateAsync: saveSettingsMutation,
    isPending: isSaving,
  } = useMutation({
    mutationFn: saveSettingsToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    queryClient.setQueryData(['settings'], (oldSettings: SettingsState) => ({
      ...oldSettings,
      ...newSettings,
    }));
  };

  const saveSettings = async () => {
    const currentSettings = queryClient.getQueryData(['settings']) as SettingsState;
    await saveSettingsMutation(currentSettings);
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    saveSettings,
    isLoading,
    isSaving,
    error: error as Error | null,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};