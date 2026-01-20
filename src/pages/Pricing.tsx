import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Heart, Shield, Zap, Users, ChartBar, CreditCard, Loader2, Sparkles } from 'lucide-react';
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
    isTrialing,
    tierName, 
    tierEmoji, 
    amount: currentAmount, 
    subscriptionEnd,
    trialEnd,
    loading: subLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  } = useSubscriptionStatus();

  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const tierInfo = getTierInfo(selectedAmount);

  // Calculate days remaining in trial
  const getTrialDaysRemaining = () => {
    if (!trialEnd) return 0;
    const now = new Date();
    const end = new Date(trialEnd);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Handle cancel redirect (success now goes to /checkout-success)
  useEffect(() => {
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      toast({
        title: 'Checkout canceled',
        description: 'No worries! Come back anytime when you\'re ready.',
        variant: 'destructive',
      });
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to start your free trial.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsProcessing(true);
    try {
      const checkoutUrl = await createCheckout(selectedAmount);
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
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
  const trialDaysRemaining = getTrialDaysRemaining();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center">
            <Logo className="h-8" variant="dark" />
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
          /* Current Subscriber View (Active or Trialing) */
          <Card className={`border-2 ${isTrialing ? 'border-chart-3/50 bg-gradient-to-br from-chart-3/5 to-background' : 'border-primary/50 bg-gradient-to-br from-primary/5 to-background'}`}>
            <CardHeader className="text-center">
              <div className="text-5xl mb-2">{tierEmoji}</div>
              <CardTitle className="text-2xl">
                You're a <span className="text-primary">{tierName}</span>!
              </CardTitle>
              {isTrialing ? (
                <CardDescription className="text-lg">
                  <span className="inline-flex items-center gap-2 text-chart-3 font-medium">
                    <Sparkles className="h-4 w-4" />
                    Free Trial — {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining
                  </span>
                </CardDescription>
              ) : (
                <CardDescription className="text-lg">
                  Thank you for supporting Zero Hero at ${currentAmount}/month
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isTrialing ? (
                <div className="bg-chart-3/10 border border-chart-3/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-foreground">
                    Your trial ends on{' '}
                    <span className="font-semibold">
                      {trialEnd && new Date(trialEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Then ${currentAmount}/month — cancel anytime before to avoid charges
                  </p>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Your subscription renews on{' '}
                  {subscriptionEnd && new Date(subscriptionEnd).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Cancellation & Subscription Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Your Subscription Rights
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Cancel anytime</strong> — no penalties, no hidden fees, no questions asked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      After cancellation, you'll retain <strong>full access until{' '}
                      {(subscriptionEnd || trialEnd) && new Date(subscriptionEnd || trialEnd!).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>You <strong>won't be charged again</strong> after your subscription ends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Your data is always yours — <strong>export it anytime</strong> from Data Management</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
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
              <CardDescription className="text-base mt-2">
                <span className="inline-flex items-center gap-2 text-chart-3 font-medium">
                  <Sparkles className="h-4 w-4" />
                  Start with 7 days free
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Price Display */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">${selectedAmount}</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  after your free trial
                </p>
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
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start 7-Day Free Trial
                  </>
                )}
              </Button>

              {/* Trust Indicators */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>✨ Try free for 7 days, then ${selectedAmount}/month</p>
                <p className="text-xs">
                  Cancel anytime • No hidden fees • Secure payment via Stripe
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
