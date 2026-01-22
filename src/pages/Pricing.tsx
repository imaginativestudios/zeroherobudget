import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Heart, Shield, Zap, Users, ChartBar, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { toast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { STRIPE_PRICES, type PricingInterval } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
    interval: currentInterval,
    amount: currentAmount, 
    subscriptionEnd,
    trialEnd,
    loading: subLoading,
    createCheckout,
    openCustomerPortal,
  } = useSubscriptionStatus();

  const [selectedInterval, setSelectedInterval] = useState<PricingInterval>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

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
      const checkoutUrl = await createCheckout(selectedInterval);
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
  const selectedPrice = STRIPE_PRICES[selectedInterval];

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
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with 7 days free. All features included. Cancel anytime.
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
              <div className="text-5xl mb-2">🏰</div>
              <CardTitle className="text-2xl">
                You're subscribed!
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
                  {currentInterval === 'annual' ? 'Annual' : 'Monthly'} Plan — ${currentAmount}/{currentInterval === 'annual' ? 'year' : 'month'}
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
                    Then ${currentAmount}/{currentInterval === 'annual' ? 'year' : 'month'} — cancel anytime before to avoid charges
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
          <div className="space-y-8">
            {/* Interval Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setSelectedInterval('monthly')}
                  className={cn(
                    "px-6 py-2 rounded-md text-sm font-medium transition-all",
                    selectedInterval === 'monthly'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedInterval('annual')}
                  className={cn(
                    "px-6 py-2 rounded-md text-sm font-medium transition-all relative",
                    selectedInterval === 'annual'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Annual
                  <span className="absolute -top-2 -right-2 bg-chart-3 text-chart-3-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    Save $10
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Monthly Card */}
              <Card 
                className={cn(
                  "border-2 cursor-pointer transition-all",
                  selectedInterval === 'monthly' 
                    ? "border-primary bg-gradient-to-br from-primary/5 to-background" 
                    : "border-border hover:border-border/80"
                )}
                onClick={() => setSelectedInterval('monthly')}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">Monthly</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">${STRIPE_PRICES.monthly.amount}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Billed monthly</p>
                </CardContent>
              </Card>

              {/* Annual Card */}
              <Card 
                className={cn(
                  "border-2 cursor-pointer transition-all relative",
                  selectedInterval === 'annual' 
                    ? "border-primary bg-gradient-to-br from-primary/5 to-background" 
                    : "border-border hover:border-border/80"
                )}
                onClick={() => setSelectedInterval('annual')}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-chart-3 text-chart-3-foreground text-xs px-3 py-1 rounded-full font-bold">
                    BEST VALUE
                  </span>
                </div>
                <CardHeader className="text-center pb-2 pt-6">
                  <CardTitle className="text-lg">Annual</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">${STRIPE_PRICES.annual.amount}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    ${STRIPE_PRICES.annual.monthlyEquivalent}/month • Save ${STRIPE_PRICES.annual.savings}!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto py-4">
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
            <div className="max-w-md mx-auto space-y-4">
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
                <p>
                  ✨ Try free for 7 days, then ${selectedPrice.amount}/{selectedInterval === 'annual' ? 'year' : 'month'}
                </p>
                <p className="text-xs">
                  Cancel anytime • No hidden fees • Secure payment via Stripe
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transparency Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
            <p>
              No hidden fees, no surprise charges. Choose monthly for flexibility or annual for savings.
              All features included with every plan.
            </p>
            <p>
              Start your 7-day free trial today and cancel anytime if it's not right for you.
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
