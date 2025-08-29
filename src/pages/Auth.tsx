import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Mail, Lock, CheckCircle, AlertCircle, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/Logo';

const Auth = () => {
  const { user, loading, signIn, signUp, resendConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (type: 'signin' | 'signup') => {
    if (!email || !password) return;
    
    setIsSubmitting(true);
    setAuthError('');
    
    if (type === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message === 'Email not confirmed') {
          setAuthError('email_not_confirmed');
        } else {
          setAuthError(error.message);
        }
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message?.includes('rate limit')) {
          setAuthError('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          setAuthError(error.message);
        }
      } else {
        setSignupSuccess(true);
        setSignupEmail(email);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    const emailToUse = signupEmail || email;
    const { error } = await resendConfirmation(emailToUse);
    
    if (error) {
      if (error.message?.includes('rate limit')) {
        setAuthError('Rate limit exceeded. Please wait a moment before resending.');
      } else {
        setAuthError(error.message);
      }
    } else {
      setAuthError('');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-royal px-4">
      <div className="mb-8">
        <Logo variant="color" src="/lovable-uploads/c6c5c284-49c5-4e08-976c-035d6d52da2b.png" className="h-16 sm:h-20 w-auto drop-shadow-lg" />
      </div>
      
      <Card className="w-full max-w-md shadow-royal">
        <CardHeader className="text-center">
          <CardDescription className="text-muted-foreground">
            from balances due to a more balanced you
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {signupSuccess && (
            <Alert className="mb-4 border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription>
                Check your email! We've sent a confirmation link to {signupEmail}.
                <Button
                  variant="link"
                  onClick={handleResendConfirmation}
                  disabled={isResending || resendCooldown > 0}
                  className="h-auto p-0 ml-1 text-success"
                >
                  {isResending ? (
                    <>
                      <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend email'
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {authError && authError !== 'email_not_confirmed' && (
            <Alert className="mb-4 border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          {authError === 'email_not_confirmed' && (
            <Alert className="mb-4 border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>
                Please confirm your email before signing in.
                <Button
                  variant="link"
                  onClick={handleResendConfirmation}
                  disabled={isResending || resendCooldown > 0}
                  className="h-auto p-0 ml-1 text-warning"
                >
                  {isResending ? (
                    <>
                      <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend confirmation'
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}


          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" disabled={signupSuccess}>Sign In</TabsTrigger>
              <TabsTrigger value="signup" disabled={signupSuccess}>Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isSubmitting}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit('signin')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-royal hover:opacity-90 transition-opacity"
                  onClick={() => handleSubmit('signin')}
                  disabled={isSubmitting || !email || !password}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (6+ characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isSubmitting}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit('signup')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-royal hover:opacity-90 transition-opacity"
                  onClick={() => handleSubmit('signup')}
                  disabled={isSubmitting || !email || !password}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;