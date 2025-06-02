import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ data: any; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to check admin status with timeout and error handling
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    console.log('🔍 Checking admin status for user:', userId);
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout')), 5000);
      });

      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.log('ℹ️ No admin role found for user:', error.message);
        return false;
      }

      const hasAdminRole = data?.role === 'admin' || data?.role === 'super_admin';
      console.log('✅ Admin status result:', hasAdminRole);
      return hasAdminRole || false;
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  };

  // Separate function to handle admin status check without blocking auth state
  const updateAdminStatus = async (userId: string) => {
    try {
      const adminStatus = await checkAdminStatus(userId);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('❌ Error updating admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Auth useEffect starting...');
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      console.log('📡 Getting initial session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        }

        if (mounted) {
          console.log('✅ Setting initial session:', session?.user?.email || 'No user');
          setSession(session);
          setUser(session?.user ?? null);
          
          // CRITICAL FIX: Set loading to false FIRST, then check admin status separately
          console.log('✅ Setting loading to false (initial)');
          setLoading(false);
          
          // Check admin status separately without blocking loading state
          if (session?.user) {
            updateAdminStatus(session.user.id);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
        if (mounted) {
          console.log('⚠️ Setting loading to false (error)');
          setLoading(false);
          setIsAdmin(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state listener
    console.log('👂 Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          // CRITICAL FIX: Set loading to false FIRST
          console.log('✅ Setting loading to false (auth change)');
          setLoading(false);

          // Check admin status separately without blocking auth state
          if (session?.user) {
            updateAdminStatus(session.user.id);
          } else {
            setIsAdmin(false);
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth useEffect...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    console.log('📝 Signing up user:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          },
        },
      });

      if (error) {
        console.error('❌ SignUp error:', error);
      } else {
        console.log('✅ SignUp successful');
      }

      return { data, error };
    } catch (error) {
      console.error('❌ SignUp catch error:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Signing in user:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ SignIn error:', error);
      } else {
        console.log('✅ SignIn successful');
      }

      return { data, error };
    } catch (error) {
      console.error('❌ SignIn catch error:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out user...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ SignOut error:', error);
      } else {
        console.log('✅ SignOut successful');
      }
      // Clear local state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('❌ SignOut catch error:', error);
    }
  };

  console.log('🎯 Auth state - User:', user?.email || 'None', 'Loading:', loading, 'Admin:', isAdmin);

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};