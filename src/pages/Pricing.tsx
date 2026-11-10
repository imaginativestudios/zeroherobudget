import { LegalFooterNotice } from "@/components/LegalFooterNotice";
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Heart, Shield, Zap, Users, ChartBar, CreditCard, Loader2, Lock, Trophy, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { motion, MotionConfig } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { toast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { SEO } from '@/components/SEO';
import { STRIPE_PRICES, type PricingInterval } from '@/lib/constants';
import { cn } from '@/lib/utils';
import SparklesIcon from '@/components/icons/SparklesIcon';

const trustBadges = [
  { icon: Shield, text: '256-bit encryption' },
  { icon: Lock, text: 'Stripe secured' },
  { icon: CreditCard, text: 'Cancel anytime' },
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

  const getTrialDaysRemaining = () => {
    if (!trialEnd) return 0;
    const now = new Date();
    const end = new Date(trialEnd);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

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
      toast({ title: 'Error', description: message, variant: 'destructive' });
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
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = authLoading || subLoading;
  const trialDaysRemaining = getTrialDaysRemaining();
  const selectedPrice = STRIPE_PRICES[selectedInterval];

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO
        title="Pricing — Zero Hero"
        description="Simple, transparent pricing for Zero Hero. Choose monthly at $5/mo or annual at $50/yr. 7-day free trial, cancel anytime."
        path="/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Zero Hero Subscription",
          "description": "Budget tracking and debt payoff app with AI insights, household sharing, and bank-level security.",
          "brand": { "@type": "Brand", "name": "Zero Hero" },
          "offers": [
            {
              "@type": "Offer",
              "name": "Monthly",
              "price": STRIPE_PRICES.monthly.amount,
              "priceCurrency": "USD",
              "url": "https://zeroherobudget.com/pricing"
            },
            {
              "@type": "Offer",
              "name": "Annual",
              "price": STRIPE_PRICES.annual.amount,
              "priceCurrency": "USD",
              "url": "https://zeroherobudget.com/pricing"
            }
          ]
        }}
      />
      {/* Header */}
      <header className="relative z-10 border-b border-border/40 bg-background">
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

      <main className="relative z-10 container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="relative inline-block mb-6">
            <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Invest in the version of you that's debt-free.
            </h1>
          </div>
          <motion.div
            className="max-w-2xl mx-auto space-y-2 text-muted-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            <p className="text-lg md:text-xl">
              Don't think of it as a cost. Think of it as a strategy.
            </p>
            <p className="text-sm md:text-base">
              Bank sync spots fees, subscriptions and interest you can cut, so <span className="font-semibold text-foreground">Zero Hero can pay for itself</span>.
            </p>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subscribed ? (
          /* Current Subscriber View */
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <Card className="border-2 border-primary/50 bg-white dark:bg-card">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl">You're subscribed!</CardTitle>
                {isTrialing ? (
                  <CardDescription className="text-lg">
                    <span className="inline-flex items-center gap-2 text-chart-3 font-medium">
                      <SparklesIcon size={16} />
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
                        {trialEnd && new Date(trialEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Then ${currentAmount}/{currentInterval === 'annual' ? 'year' : 'month'} — cancel anytime before to avoid charges
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    Your subscription renews on{' '}
                    {subscriptionEnd && new Date(subscriptionEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                
                <ul className="grid sm:grid-cols-2 gap-4">
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    <span className="font-semibold">Bank sync, automatic transactions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    <span>Budgeting, debt payoff and reports</span>
                  </li>
                </ul>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Your Subscription Rights
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span><strong>Cancel anytime</strong> — no penalties, no hidden fees, no questions asked</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        After cancellation, you'll retain <strong>full access until{' '}
                        {(subscriptionEnd || trialEnd) && new Date(subscriptionEnd || trialEnd!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
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
                  <Button variant="outline" onClick={handleManageSubscription} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                    Manage Subscription
                  </Button>
                  <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* New Subscriber View */
          <div className="space-y-10">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground">Choose Your Strategy</h2>
            {/* Interval Toggle */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative inline-flex items-center bg-muted/80 p-1.5 rounded-xl border border-border/50 shadow-sm">
                {/* Sliding indicator */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 rounded-lg bg-card shadow-md border border-border/30"
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    left: selectedInterval === 'monthly' ? '6px' : '50%',
                    right: selectedInterval === 'annual' ? '6px' : '50%',
                  }}
                />
                <button
                  onClick={() => setSelectedInterval('monthly')}
                  className={cn(
                    "relative z-10 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                    selectedInterval === 'monthly' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedInterval('annual')}
                  className={cn(
                    "relative z-10 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                    selectedInterval === 'annual' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Annual
                  <span className="absolute -top-3 -right-3 bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                    −${STRIPE_PRICES.annual.savings}
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Plan Cards */}
            <motion.div
              className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {/* Free */}
              <Card className="bg-white dark:bg-card border border-border h-full flex flex-col">
                <CardHeader className="pb-2 pt-8">
                  <CardTitle className="text-lg font-semibold">Free</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-6 pb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground tracking-tight">$0</span>
                    <span className="text-sm text-muted-foreground">Forever</span>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {['Budgets and spending', 'Debt payoff strategies', 'Reports and achievements'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  >
                    Start free
                  </Button>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="bg-white dark:bg-card border-2 border-primary/50 h-full flex flex-col">
                <CardHeader className="pb-2 pt-8">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-semibold">Premium</CardTitle>
                    {selectedInterval === 'annual' && (
                      <span className="bg-chart-3/10 text-foreground border border-chart-3/20 text-xs px-3 py-1 rounded-full font-semibold">
                        Best value
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-6 pb-8">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-foreground tracking-tight">${selectedPrice.amount}</span>
                      <span className="text-muted-foreground text-base">/{selectedInterval === 'annual' ? 'yr' : 'mo'}</span>
                    </div>
                    {selectedInterval === 'annual' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ${STRIPE_PRICES.annual.monthlyEquivalent}/mo, <span className="line-through">$120</span>{' '}
                        <span className="text-primary font-semibold">Save ${STRIPE_PRICES.annual.savings}</span>
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3 flex-1">
                    <li className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                      <span className="font-semibold">Bank sync, automatic transactions</span>
                    </li>
                  </ul>
                  <div className="space-y-2">
                    <Button size="lg" className="w-full" onClick={handleSubscribe} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                          Processing...
                        </>
                      ) : (
                        'Start 7-day free trial'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Free for 7 days, then ${selectedPrice.amount}/{selectedInterval === 'annual' ? 'year' : 'month'}. Cancel anytime.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <p className="text-center text-xs text-muted-foreground">
              Cancel anytime • No hidden fees • Secure payment via Stripe
            </p>
          </div>
        )}

        {/* Trust Badges */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2.5 rounded-full border border-border/30">
              <badge.icon className="h-4 w-4 text-primary" />
              <span>{badge.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Transparency Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
            <p>
              No hidden fees, no surprise charges. Choose monthly for flexibility or annual for savings.
              Budgeting is free for everyone. Premium adds bank sync.
            </p>
            <p>
              Start your 7-day free trial today and cancel anytime if it's not right for you.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <LegalFooterNotice className="mt-0 border-t-0 pt-0" />
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
};

export default Pricing;
