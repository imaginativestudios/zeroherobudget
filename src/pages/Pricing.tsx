import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Heart, Shield, Zap, Users, ChartBar, CreditCard, Loader2, Lock, Lightbulb, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { toast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { STRIPE_PRICES, type PricingInterval } from '@/lib/constants';
import { cn } from '@/lib/utils';
import SparklesIcon from '@/components/icons/SparklesIcon';

const features = [
  { icon: ChartBar, text: 'Unlimited budget tracking' },
  { icon: Zap, text: 'AI-powered insights' },
  { icon: Users, text: 'Household sharing' },
  { icon: Shield, text: 'Bank-level security' },
  { icon: CreditCard, text: 'Debt snowball calculator' },
  { icon: Heart, text: 'Support our mission' },
];

const trustBadges = [
  { icon: Shield, text: '256-bit encryption' },
  { icon: Lock, text: 'Stripe secured' },
  { icon: CreditCard, text: 'Cancel anytime' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-48 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <div className="absolute inset-0 -m-8 rounded-full bg-primary/8 blur-2xl" />
            <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Choose Your Plan
            </h1>
          </div>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            Start with 7 days free. All features included. Cancel anytime.
        </motion.p>

          {/* ROI Pro Tip Card */}
          <motion.div
            className="mt-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          >
            <div className="relative rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
              
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-accent-foreground shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground/80">Pro Tip</span>
                <span className="text-sm font-semibold text-foreground">"Is this app a bill or an investment?"</span>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap mb-1.5">
                <span className="text-sm font-bold text-foreground">$47 <span className="font-normal text-muted-foreground">lazy cash found</span></span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-sm font-bold text-foreground">4 mo <span className="font-normal text-muted-foreground">debt payoff cut</span></span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-sm font-bold text-foreground">$1,200+ <span className="font-normal text-muted-foreground">interest saved</span></span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Zero Hero is designed to <span className="text-foreground font-semibold">pay for itself 10× over</span>.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subscribed ? (
          /* Current Subscriber View */
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <Card className={`border-2 ${isTrialing ? 'border-chart-3/50 bg-gradient-to-br from-chart-3/5 to-background' : 'border-primary/50 bg-gradient-to-br from-primary/5 to-background'}`}>
              <CardHeader className="text-center">
                <div className="text-5xl mb-2">🏰</div>
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
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature.text}</span>
                    </div>
                  ))}
                </div>

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

            {/* Pricing Cards */}
            <motion.div
              className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Monthly Card */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card
                  className={cn(
                    "border-2 cursor-pointer transition-all duration-300 h-full",
                    selectedInterval === 'monthly'
                      ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border/50 hover:border-border"
                  )}
                  onClick={() => setSelectedInterval('monthly')}
                >
                  <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-lg font-semibold">Monthly</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-foreground tracking-tight">${STRIPE_PRICES.monthly.amount}</span>
                      <span className="text-muted-foreground text-base">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">Billed monthly</p>
                    <p className="text-xs text-muted-foreground mt-1">Flexible, cancel anytime</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Annual Card */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative"
              >
                <Card
                  className={cn(
                    "border-2 cursor-pointer transition-all duration-300 h-full overflow-hidden",
                    selectedInterval === 'annual'
                      ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border/50 hover:border-border"
                  )}
                  onClick={() => setSelectedInterval('annual')}
                >
                  <div className="flex justify-center pt-5 pb-0">
                    <span className="bg-accent text-accent-foreground text-xs px-4 py-1.5 rounded-full font-bold shadow-sm animate-pulse">
                      BEST VALUE
                    </span>
                  </div>
                  <CardHeader className="text-center pb-2 pt-3">
                    <CardTitle className="text-lg font-semibold">Annual</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-foreground tracking-tight">${STRIPE_PRICES.annual.amount}</span>
                      <span className="text-muted-foreground text-base">/yr</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      ${STRIPE_PRICES.annual.monthlyEquivalent}/mo • <span className="line-through opacity-60">$144</span>{' '}
                      <span className="text-primary font-semibold">Save ${STRIPE_PRICES.annual.savings}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Best for committed budgeters</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Features */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-2xl mx-auto py-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Subscribe Button */}
            <motion.div
              className="max-w-md mx-auto space-y-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 -m-2 rounded-2xl bg-primary/10 blur-xl" />
                <Button
                  size="lg"
                  className="relative w-full text-lg py-6 shadow-lg shadow-primary/20"
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
                      <SparklesIcon size={20} className="mr-2" />
                      Start 7-Day Free Trial
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>
                  ✨ Try free for 7 days, then ${selectedPrice.amount}/{selectedInterval === 'annual' ? 'year' : 'month'}
                </p>
                <p className="text-xs">
                  Cancel anytime • No hidden fees • Secure payment via Stripe
                </p>
              </div>
            </motion.div>
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
              All features included with every plan.
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
          <p>© {new Date().getFullYear()} Zero Hero. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
