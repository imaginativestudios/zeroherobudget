import { useState } from 'react';
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
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

type AuthView = 'auth' | 'forgot-password' | 'reset-sent' | 'confirmation-sent';

export function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [view, setView] = useState<AuthView>('auth');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const { signIn, signUp, resetPassword, resendConfirmation, signInWithGoogle } = useAuth();
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
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {view === 'auth' && (
          <>
            <DialogHeader className="flex flex-col items-center">
              <Logo variant="dark" className="h-8 mb-4" />
              <DialogTitle className="text-2xl font-bold text-center">Welcome to Zero Hero</DialogTitle>
              <DialogDescription className="text-center">
                Start your journey to financial freedom
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue={defaultMode} className="w-full">
              <TabsList className="flex border border-border rounded-lg overflow-hidden bg-transparent p-0 h-auto w-full">
                <TabsTrigger 
                  value="login"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 
                             bg-background text-foreground/70 font-medium
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
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 
                             bg-background text-foreground/70 font-medium
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

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      const { error } = await signInWithGoogle();
                      if (error) {
                        toast({
                          title: 'Google login failed',
                          description: error.message,
                          variant: 'destructive',
                        });
                        setLoading(false);
                      }
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
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

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      const { error } = await signInWithGoogle();
                      if (error) {
                        toast({
                          title: 'Google signup failed',
                          description: error.message,
                          variant: 'destructive',
                        });
                        setLoading(false);
                      }
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
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
