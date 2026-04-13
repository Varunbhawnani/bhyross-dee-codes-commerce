import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth state to resolve
    if (!loading) {
      if (user) {
        toast({
          title: "Welcome!",
          description: "You've been successfully signed in with Google.",
        });
        navigate('/', { replace: true });
      } else {
        toast({
          title: "Sign-in failed",
          description: "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
      }
    }
  }, [user, loading, navigate, toast]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Completing sign-in...</span>
      </div>
    </div>
  );
};

export default AuthCallback;