import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      const redirectTo = (location.state as any)?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    return { requirements, score };
  };

  const { requirements, score } = getPasswordStrength(password);
  const isPasswordStrong = score >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || authLoading) return;

    // Basic validation
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Password required", 
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login for:', email);
        const { error } = await signIn(email.trim(), password);
        
        if (error) {
          console.error('Login error:', error);
          
          if (error.message.includes('Email not confirmed')) {
            toast({
              title: "Email not verified",
              description: "Please check your email and click the verification link before signing in.",
              variant: "destructive",
            });
          } else if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message || "An unexpected error occurred during login.",
              variant: "destructive",
            });
          }
          return;
        }
        
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        
        // Navigation will be handled by useEffect when user state updates
      } else {
        // Sign up validation
        if (!firstName.trim() || !lastName.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your first and last name.",
            variant: "destructive",
          });
          return;
        }

        if (!isPasswordStrong) {
          toast({
            title: "Weak password",
            description: "Please create a stronger password meeting the requirements below.",
            variant: "destructive",
          });
          return;
        }

        console.log('Attempting signup for:', email);
        const { error } = await signUp(email.trim(), password, firstName.trim(), lastName.trim());
        
        if (error) {
          console.error('Signup error:', error);
          
          if (error.message.includes('User already registered')) {
            toast({
              title: "Account exists",
              description: "An account with this email already exists. Please try signing in instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Signup failed",
              description: error.message || "An unexpected error occurred during signup.",
              variant: "destructive",
            });
          }
          return;
        }
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in.",
        });
        setIsLogin(true);
        // Clear form
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-neutral-900">
            Bhyross & Dee Codes
          </Link>
          <p className="text-neutral-600 mt-2 text-sm sm:text-base">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={!isLogin}
                  className="mt-1 text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={!isLogin}
                  className="mt-1 text-sm"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10 text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {!isLogin && password && (
              <div className="mt-2 sm:mt-3 space-y-2">
                <p className="text-xs sm:text-sm font-medium text-neutral-700">Password requirements:</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className={`flex items-center space-x-2 ${requirements.length ? 'text-green-600' : 'text-red-500'}`}>
                    {requirements.length ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <XCircle className="h-3 w-3 flex-shrink-0" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${requirements.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                    {requirements.uppercase ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <XCircle className="h-3 w-3 flex-shrink-0" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${requirements.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                    {requirements.lowercase ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <XCircle className="h-3 w-3 flex-shrink-0" />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${requirements.number ? 'text-green-600' : 'text-red-500'}`}>
                    {requirements.number ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <XCircle className="h-3 w-3 flex-shrink-0" />}
                    <span>One number</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${requirements.special ? 'text-green-600' : 'text-red-500'}`}>
                    {requirements.special ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <XCircle className="h-3 w-3 flex-shrink-0" />}
                    <span>One special character</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full text-sm sm:text-base" 
            disabled={loading || authLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <Link to="/" className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-700">
            ← Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;