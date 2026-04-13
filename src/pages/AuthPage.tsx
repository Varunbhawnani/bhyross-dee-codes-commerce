import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, User, Mail, Lock, Sparkles } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const analytics = useAnalytics();

  useEffect(() => {
    setMounted(true);
    
    // Track page view for auth page
    analytics.trackUserJourney('auth_page_viewed', {
      auth_type: isLogin ? 'login' : 'signup',
      page_path: location.pathname
    });
  }, []);

  // Track mode switch
  useEffect(() => {
    if (mounted) {
      analytics.trackEvent('auth_mode_switch', {
        new_mode: isLogin ? 'login' : 'signup',
        previous_mode: isLogin ? 'signup' : 'login'
      });
    }
  }, [isLogin, mounted]);

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

  const handleGoogleSignIn = async () => {
    if (googleLoading || authLoading) {
      return;
    }
    
    setGoogleLoading(true);
    
    // Track Google sign-in attempt
    analytics.trackEvent('google_signin_attempt', {
      auth_type: isLogin ? 'login' : 'signup'
    });
    
    try {
      console.log('Attempting Google sign in...');
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign in error:', error);
        
        // Track Google sign-in failure
        analytics.trackError('google_signin_error', error.message, 'auth_page');
        
        toast({
          title: "Google Sign-in failed",
          description: error.message || "An error occurred during Google sign-in.",
          variant: "destructive",
        });
      } else {
        // Track successful Google sign-in
        analytics.trackLogin('google');
        analytics.trackUserJourney('google_auth_success', {
          auth_type: isLogin ? 'login' : 'signup'
        });
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // Track unexpected Google sign-in error
      analytics.trackError('google_signin_unexpected_error', error.message, 'auth_page');
      
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || authLoading) {
      return;
    }

    // Track form submission attempt
    analytics.trackEvent('auth_form_submit', {
      auth_type: isLogin ? 'login' : 'signup',
      has_email: !!email.trim(),
      has_password: !!password.trim(),
      has_first_name: !isLogin ? !!firstName.trim() : undefined,
      has_last_name: !isLogin ? !!lastName.trim() : undefined
    });

    // Basic validation
    if (!email.trim()) {
      analytics.trackError('validation_error', 'Email is required', 'auth_form');
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      analytics.trackError('validation_error', 'Password is required', 'auth_form');
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
          
          // Track login failure
          analytics.trackError('login_error', error.message, 'auth_form');
          
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
        
        // Track successful login
        analytics.trackLogin('email');
        analytics.trackUserJourney('email_login_success');
        
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        
      } else {
        // Sign up validation
        if (!firstName.trim() || !lastName.trim()) {
          analytics.trackError('validation_error', 'Name is required', 'auth_form');
          toast({
            title: "Name required",
            description: "Please enter your first and last name.",
            variant: "destructive",
          });
          return;
        }

        if (!isPasswordStrong) {
          analytics.trackError('validation_error', 'Password is too weak', 'auth_form');
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
          
          // Track signup failure
          analytics.trackError('signup_error', error.message, 'auth_form');
          
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
        
        // Track successful signup
        analytics.trackSignUp('email');
        analytics.trackUserJourney('email_signup_success');
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in.",
        });
        setIsLogin(true);
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Track unexpected auth error
      analytics.trackError('auth_unexpected_error', error.message, 'auth_form');
      
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setFocusedField('');
  };

  // Track field focus for engagement
  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    analytics.trackEngagement('field_focus', 1);
  };

  const handleFieldBlur = (fieldName: string) => {
    setFocusedField('');
    analytics.trackEngagement('field_blur', 1);
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-2xl shadow-lg">
          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-2 sm:py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gray-300 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-32 h-32 bg-gray-400 rounded-full opacity-10 animate-pulse delay-2000"></div>
      </div>

      <Card className={`w-full max-w-md p-4 sm:p-8 backdrop-blur-sm bg-white/95 border-0 shadow-2xl transition-all duration-700 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } hover:shadow-3xl relative overflow-hidden`}>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-50"></div>
        
        <div className="relative z-10">
          {/* Header with animation */}
          <div className="text-center mb-4 sm:mb-8">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Sparkles className="h-6 w-6 text-gray-600 animate-pulse" />
              <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                Imcolus
              </Link>
              <Sparkles className="h-6 w-6 text-gray-600 animate-pulse delay-500" />
            </div>
            <p className={`text-gray-600 transition-all duration-500 ${
              isLogin ? 'text-base' : 'text-lg font-medium'
            }`}>
              {isLogin ? 'Welcome back to your dashboard' : 'Join our community'}
            </p>
          </div>

          {/* Mode Toggle with smooth animation */}
          <div className="mb-4 sm:mb-8">
            <div className="flex bg-gray-100 p-1 rounded-xl relative">
              <div className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-md transition-all duration-300 ${
                isLogin ? 'left-1' : 'left-1/2'
              }`}></div>
              <button
                onClick={() => !isLogin && handleModeSwitch()}
                className={`relative z-10 flex-1 py-3 text-center text-sm font-medium transition-all duration-300 ${
                  isLogin ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => isLogin && handleModeSwitch()}
                className={`relative z-10 flex-1 py-3 text-center text-sm font-medium transition-all duration-300 ${
                  isLogin ? 'text-gray-500 hover:text-gray-700' : 'text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Google Sign-in Button with exact Google colors */}
          <div className="mb-4 sm:mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 sm:h-12 flex items-center justify-center space-x-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || authLoading || loading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </>
              )}
            </Button>
          </div>

          {/* Animated Divider */}
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name fields with smooth transition */}
            <div className={`transition-all duration-500 ease-in-out ${
              isLogin ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-32 mb-4 sm:mb-6'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                      focusedField === 'firstName' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => handleFieldFocus('firstName')}
                      onBlur={() => handleFieldBlur('firstName')}
                      required={!isLogin}
                      className="pl-10 pr-12 h-10 sm:h-12 border-2 border-gray-200 focus:border-gray-400 transition-all duration-300 hover:border-gray-300"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                      focusedField === 'lastName' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => handleFieldFocus('lastName')}
                      onBlur={() => handleFieldBlur('lastName')}
                      required={!isLogin}
                      className="pl-10 pr-12 h-10 sm:h-12 border-2 border-gray-200 focus:border-gray-400 transition-all duration-300 hover:border-gray-300"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email field with icon and animation */}
            <div className="relative">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={() => handleFieldBlur('email')}
                  required
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-gray-400 transition-all duration-300 hover:border-gray-300"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field with enhanced UI */}
            <div className="relative">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={() => handleFieldBlur('password')}
                  required
                  className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-gray-400 transition-all duration-300 hover:border-gray-300"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300 disabled:opacity-50"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password strength indicator with smooth animations */}
              {!isLogin && password && (
                <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-700">Password strength:</p>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-4 rounded-full transition-all duration-300 ${
                            i < score ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'length', text: 'At least 8 characters' },
                      { key: 'uppercase', text: 'One uppercase letter' },
                      { key: 'lowercase', text: 'One lowercase letter' },
                      { key: 'number', text: 'One number' },
                      { key: 'special', text: 'One special character' }
                    ].map(({ key, text }) => (
                      <div
                        key={key}
                        className={`flex items-center space-x-2 transition-all duration-300 ${
                          requirements[key] ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {requirements[key] ? (
                          <CheckCircle className="h-3 w-3 flex-shrink-0 animate-in zoom-in-75 duration-200" />
                        ) : (
                          <XCircle className="h-3 w-3 flex-shrink-0" />
                        )}
                        <span className="text-xs">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit button with enhanced styling */}
            <Button 
              type="submit" 
              className="w-full h-10 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              disabled={loading || authLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  {!loading && <span className="text-lg">→</span>}
                </span>
              )}
            </Button>
          </form>

          {/* Bottom navigation */}
          <div className="mt-8 space-y-4 text-center">
            <div className="border-t border-gray-200 pt-6">
              <Link 
                to="/" 
                className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300"
                onClick={() => analytics.trackEvent('navigate_home_from_auth')}
              >
                <span>←</span>
                <span>Back to home</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;