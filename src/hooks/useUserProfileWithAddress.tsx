import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfileWithAddress {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useUserProfileWithAddress = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileWithAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Omit<UserProfileWithAddress, 'id' | 'created_at'>>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  // Check if user has saved address
  const hasAddress = () => {
    return !!(profile && 
             profile.address && 
             profile.city && 
             profile.state && 
             profile.pincode);
  };

  // Get full name
  const getFullName = () => {
    if (!profile) return '';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    fetchProfile,
    hasAddress,
    getFullName
  };
};