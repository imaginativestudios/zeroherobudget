import { useState } from 'react';
import { STRIPE_PRICES } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail, CheckCircle2, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { checkGeoAccess } from '@/hooks/useGeoAccess';


interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
  signupFirst?: boolean;
  contextTitle?: string;
}

type AuthView = 'auth' | 'forgot-password' | 'reset-sent' | 'confirmation-sent';

export function AuthModal({ 
  open, 
  onOpenChange, 
  defaultMode = 'login',
  signupFirst = false,
  contextTitle
}: AuthModalProps) {
  const [showLoginInSignupFirst, setShowLoginInSignupFirst] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [view, setView] = useState<AuthView>('auth');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const { signIn, signUp, resetPassword, resendConfirmation } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        onOpenChange(false);
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Geo-gate: Zero Hero is currently US-only.
      const geo = await checkGeoAccess();
      if (!geo.allowed) {
        onOpenChange(false);
        navigate('/unavailable');
        return;
      }

      const { error } = await signUp(email, password, firstName, lastName);
      
      if (error) {
        // Check if this is a "check your email" message (email confirmation required)
        if (error.message.includes('check your email') || error.message.includes('confirm your account')) {
          setConfirmationEmail(email);
          setView('confirmation-sent');
        } else {
          toast({
            title: 'Signup failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Welcome!',
          description: 'Account created successfully.',
        });
        onOpenChange(false);
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await resendConfirmation(confirmationEmail);
      if (error) {
        toast({
          title: 'Resend failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email sent!',
          description: 'A new confirmation email has been sent.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend confirmation email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: 'Reset failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setView('reset-sent');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset view when closing
      setView('auth');
      setShowLoginInSignupFirst(false);
    }
    onOpenChange(open);
  };

  // Signup-first mode: render a focused signup layout
  if (signupFirst && view === 'auth') {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          {!showLoginInSignupFirst ? (
            // Signup form (primary view)
            <>
              <DialogHeader className="flex flex-col items-center space-y-2">
                <Logo variant="dark" className="h-6 sm:h-8 mb-2" />
                <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                  {contextTitle || 'Create Your Account'}
                </DialogTitle>
                <DialogDescription className="text-center text-sm sm:text-base">
                  7 days free, then just ${STRIPE_PRICES.monthly.amount}/month
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-first-firstname">First Name</Label>
                    <Input
                      id="signup-first-firstname"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-first-lastname">
                      Last Name <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="signup-first-lastname"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-first-email">Email</Label>
                  <Input
                    id="signup-first-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-first-password">Password</Label>
                  <Input
                    id="signup-first-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="royal"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 h-auto text-sm text-primary font-medium"
                    onClick={() => setShowLoginInSignupFirst(true)}
                  >
                    Sign in
                  </Button>
                </p>
              </div>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5 mt-2">
                <Lock className="h-3 w-3" />
                No credit card required
              </p>
            </>
          ) : (
            // Login form (secondary view with back button)
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowLoginInSignupFirst(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <DialogTitle className="text-xl font-bold">Sign In</DialogTitle>
                </div>
                <DialogDescription className="text-left pl-10">
                  Welcome back! Enter your credentials to continue.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-first-login-email">Email</Label>
                  <Input
                    id="signup-first-login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-first-login-password">Password</Label>
                  <Input
                    id="signup-first-login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signup-first-remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      disabled={loading}
                    />
                    <Label 
                      htmlFor="signup-first-remember-me" 
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 h-auto text-sm text-primary"
                    onClick={() => setView('forgot-password')}
                    disabled={loading}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="royal"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        {view === 'auth' && (
          <>
            <DialogHeader className="flex flex-col items-center space-y-2">
              <Logo variant="dark" className="h-6 sm:h-8 mb-2 sm:mb-4" />
              <DialogTitle className="text-xl sm:text-2xl font-bold text-center">Welcome to Zero Hero</DialogTitle>
              <DialogDescription className="text-center text-sm sm:text-base">
                Start your journey to financial freedom
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue={defaultMode} className="w-full">
              <TabsList className="flex border border-border rounded-lg overflow-hidden bg-transparent p-0 h-auto w-full">
                <TabsTrigger 
                  value="login"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-2 sm:px-4 py-2 sm:py-3 
                             bg-background text-foreground/70 font-medium text-sm
                             border-r border-border last:border-r-0
                             hover:bg-muted hover:text-foreground
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                             transition-all cursor-pointer
                             data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                             data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-2 sm:px-4 py-2 sm:py-3 
                             bg-background text-foreground/70 font-medium text-sm
                             border-r border-border last:border-r-0
                             hover:bg-muted hover:text-foreground
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                             transition-all cursor-pointer
                             data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                             data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={loading}
                      />
                      <Label 
                        htmlFor="remember-me" 
                        className="text-sm font-normal cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 h-auto text-sm text-primary"
                      onClick={() => setView('forgot-password')}
                      disabled={loading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="royal"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="royal"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                </form>
              </TabsContent>
            </Tabs>
          </>
        )}

        {view === 'forgot-password' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView('auth')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-xl font-bold">Reset Password</DialogTitle>
              </div>
              <DialogDescription className="text-left pl-10">
                Enter your email and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                variant="royal"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        )}

        {view === 'reset-sent' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Check Your Email</DialogTitle>
              <DialogDescription className="text-center">
                We've sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to reset your password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Button 
                type="button" 
                className="w-full" 
                variant="royal"
                onClick={() => {
                  setView('auth');
                  onOpenChange(false);
                }}
              >
                Back to Login
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-xs"
                  onClick={() => setView('forgot-password')}
                >
                  try again
                </Button>
              </p>
            </div>
          </>
        )}

        {view === 'confirmation-sent' && (
          <>
            <DialogHeader className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold text-center">Check Your Email</DialogTitle>
              <DialogDescription className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Account created successfully!</span>
                </div>
                <p>
                  We've sent a confirmation link to <strong>{confirmationEmail}</strong>.
                  Click the link in the email to activate your account.
                </p>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Button 
                type="button" 
                className="w-full" 
                variant="royal"
                disabled={loading}
                onClick={handleResendConfirmation}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Confirmation Email'
                )}
              </Button>
              <Button 
                type="button" 
                className="w-full" 
                variant="outline"
                onClick={() => setView('auth')}
              >
                Back to Login
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
