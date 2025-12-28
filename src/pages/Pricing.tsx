import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Heart, Shield, Zap, Users, ChartBar, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { toast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';

const getTierInfo = (amount: number) => {
  if (amount <= 5) return { name: 'Starter', emoji: '🌱', color: 'text-tier-starter' };
  if (amount <= 9) return { name: 'Supporter', emoji: '💪', color: 'text-tier-supporter' };
  if (amount <= 12) return { name: 'Champion', emoji: '🏆', color: 'text-tier-champion' };
  return { name: 'Hero', emoji: '🦸', color: 'text-tier-hero' };
};

const features = [
  { icon: ChartBar, text: 'Unlimited budget tracking' },
  { icon: Zap, text: 'AI-powered insights' },
  { icon: Users, text: 'Household sharing' },
  { icon: Shield, text: 'Bank-level security' },
  { icon: CreditCard, text: 'Debt snowball calculator' },
  { icon: Heart, text: 'Support our mission' },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { 
    subscribed, 
    tierName, 
    tierEmoji, 
    amount: currentAmount, 
    subscriptionEnd,
    loading: subLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  } = useSubscriptionStatus();

  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const tierInfo = getTierInfo(selectedAmount);

  // Handle success/cancel redirects
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast({
        title: 'Welcome to Zero Hero! 🎉',
        description: 'Thank you for subscribing! Your support means the world to us.',
      });
      checkSubscription();
      // Clear the URL params
      navigate('/pricing', { replace: true });
    } else if (canceled === 'true') {
      toast({
        title: 'Checkout canceled',
        description: 'No worries! Come back anytime when you\'re ready.',
        variant: 'destructive',
      });
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, checkSubscription, navigate]);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsProcessing(true);
    try {
      const checkoutUrl = await createCheckout(selectedAmount);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create checkout';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    try {
      const portalUrl = await openCustomerPortal();
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open portal';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = authLoading || subLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <Logo className="h-8 w-8" variant="dark" />
            <span className="font-bold text-xl text-foreground">Zero Hero</span>
          </button>
          {user ? (
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pay What You Can
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everyone deserves financial freedom. Choose what works for your budget — 
            all features included at every level.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subscribed ? (
          /* Current Subscriber View */
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="text-center">
              <div className="text-5xl mb-2">{tierEmoji}</div>
              <CardTitle className="text-2xl">
                You're a <span className="text-primary">{tierName}</span>!
              </CardTitle>
              <CardDescription className="text-lg">
                Thank you for supporting Zero Hero at ${currentAmount}/month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-sm text-muted-foreground">
                Your subscription renews on{' '}
                {subscriptionEnd && new Date(subscriptionEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Manage Subscription
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* New Subscriber View */
          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              <div className="text-5xl mb-2">{tierInfo.emoji}</div>
              <CardTitle className={`text-3xl ${tierInfo.color}`}>
                {tierInfo.name} Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Price Display */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">${selectedAmount}</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Slider */}
              <div className="px-4 space-y-4">
                <Slider
                  value={[selectedAmount]}
                  onValueChange={(value) => setSelectedAmount(value[0])}
                  min={3}
                  max={15}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$3</span>
                  <span className="font-medium text-foreground">Choose your price</span>
                  <span>$15</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 py-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={handleSubscribe}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Subscribe for ${selectedAmount}/month
                  </>
                )}
              </Button>

              {/* Trust Indicators */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>✨ Cancel anytime • No hidden fees • 100% of features</p>
                <p className="text-xs">
                  Secure payment powered by Stripe
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transparency Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Why Pay What You Can?</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
            <p>
              We believe financial tools should be accessible to everyone, regardless of income.
              Whether you're just starting out or doing well financially, you get the same 
              powerful features.
            </p>
            <p>
              Those who can pay more help subsidize access for those who can't. 
              It's community-powered financial freedom.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Zero Hero. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
