import { LegalFooterNotice } from "@/components/LegalFooterNotice";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Check, Sparkles, CreditCard, Loader2, Building2, Shield, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';

const features = [
  'Bank sync, automatic transactions',
  'Debt payoff strategies',
  'Budgets, insights and reports',
  'Achievements and household sharing',
];

const trustBadges = [
  { icon: Shield, text: '256-bit encryption' },
  { icon: Lock, text: 'Stripe secured' },
  { icon: CreditCard, text: 'Cancel anytime' },
];

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    subscribed, 
    isTrialing, 
    interval,
    amount,
    trialEnd,
    loading: subLoading,
    checkSubscription,
    openCustomerPortal,
  } = useSubscriptionStatus();
  
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [hasConfettiFired, setHasConfettiFired] = useState(false);

  // Refresh subscription status on mount
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Fire confetti when subscription is confirmed
  useEffect(() => {
    if (subscribed && !hasConfettiFired) {
      setHasConfettiFired(true);
      
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Celebration burst
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#0D7377', '#F4A259', '#FFD700', '#10B981'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#0D7377', '#F4A259', '#FFD700', '#10B981'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [subscribed, hasConfettiFired]);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const loading = authLoading || subLoading;

  // Format trial end date
  const formattedTrialEnd = trialEnd 
    ? format(new Date(trialEnd), 'MMMM d, yyyy')
    : format(addDays(new Date(), 7), 'MMMM d, yyyy');
  const shortChargeDate = trialEnd
    ? format(new Date(trialEnd), 'MMM d')
    : format(addDays(new Date(), 7), 'MMM d');
  const planLabel = interval === 'annual' ? 'Annual' : 'Monthly';
  const unit = interval === 'annual' ? 'yr' : 'mo';
  const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate('/')}
            className={`rounded-lg transition-transform duration-150 hover:scale-105 ${focusRing}`}
            aria-label="Go to home page"
          >
            <Logo className="h-8" variant="dark" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              {/* Visually hidden h1 keeps a document outline in every state. */}
              <h1 className="sr-only">Checkout status</h1>
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" aria-hidden="true" />
              <p className="text-foreground">Confirming your subscription...</p>
            </div>
          ) : subscribed ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg"
            >
              <Card className="bg-white dark:bg-card border-2 border-primary/50 shadow-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-primary" aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Your Quest Begins!</h1>
                    <p className="inline-flex items-center gap-2 text-primary font-medium">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      {isTrialing ? 'Your 7-day free trial is active' : 'Your subscription is active'}
                    </p>
                  </div>

                  <div className="bg-chart-3/10 border border-chart-3/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-foreground">
                      {planLabel} plan{amount ? `, $${amount}/${unit}` : ''}
                      {isTrialing && (
                        <>. Trial ends on <span className="font-semibold">{formattedTrialEnd}</span></>
                      )}
                    </p>
                    {isTrialing && (
                      <p className="text-xs text-foreground/80 mt-1">
                        First charge ${amount} on {shortChargeDate}. Cancel anytime.
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                        <span className={index === 0 ? 'font-semibold' : undefined}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`flex-1 ${focusRing}`}
                      onClick={() => navigate('/dashboard')}
                    >
                      Go to dashboard
                    </Button>
                    <Button
                      size="lg"
                      className={`flex-1 ${focusRing}`}
                      onClick={() => navigate('/accounts')}
                    >
                      <Building2 className="h-4 w-4 mr-2" aria-hidden="true" />
                      Link your bank
                    </Button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleManageSubscription}
                      disabled={isPortalLoading}
                      className={`inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 rounded-sm hover:text-primary/80 disabled:opacity-60 ${focusRing}`}
                    >
                      {isPortalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <CreditCard className="h-4 w-4" aria-hidden="true" />
                      )}
                      Manage subscription
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {trustBadges.map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2.5 rounded-full border border-border/30">
                    <badge.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h1 className="sr-only">Checkout status</h1>
              <p className="text-foreground mb-4">No active subscription found.</p>
              <Button className={focusRing} onClick={() => navigate('/pricing')}>
                View Pricing
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <LegalFooterNotice className="mt-0 border-t-0 pt-0" />
        </div>
      </footer>
    </div>
  );
};

export default CheckoutSuccess;
