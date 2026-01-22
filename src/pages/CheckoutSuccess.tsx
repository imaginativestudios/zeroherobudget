import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, Sparkles, CreditCard, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';

const features = [
  'Full access to all features',
  'Unlimited budget tracking',
  'Debt payoff strategies',
  'Financial insights & reports',
  'Achievement system',
  'Household sharing',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary-foreground/90 relative overflow-hidden">
      {/* Decorative blur elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-chart-3/20 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
            aria-label="Go to home page"
          >
            <Logo className="h-10" variant="light" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
              <p className="text-white/80">Confirming your subscription...</p>
            </div>
          ) : subscribed ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg"
            >
              {/* Celebration Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Trophy className="w-12 h-12 text-amber-400" aria-hidden="true" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-8 h-8 text-amber-400" aria-hidden="true" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  Your Quest Begins!
                </h1>
                <p className="text-xl text-white/80">
                  Welcome to Zero Hero, brave adventurer.
                  {isTrialing && ' Your 7-day trial has been activated.'}
                </p>
              </motion.div>

              {/* Tier Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mb-6"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2">
                  <span className="text-2xl">🏰</span>
                  <span className="text-lg font-medium text-white">{interval === 'annual' ? 'Annual' : 'Monthly'} Plan</span>
                  {amount && <span className="text-white/60">• ${amount}/{interval === 'annual' ? 'yr' : 'mo'}</span>}
                </div>
              </motion.div>

              {/* Features Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 text-white"
                        >
                          <CheckCircle2 className="h-5 w-5 text-chart-3 shrink-0" aria-hidden="true" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Trial Info */}
                    {isTrialing && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center mb-6">
                        <p className="text-sm text-white/90">
                          Trial ends <span className="font-semibold text-amber-400">{formattedTrialEnd}</span>
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                          First charge: ${amount}/mo • Cancel anytime
                        </p>
                      </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        size="lg"
                        variant="secondary"
                        className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold"
                        onClick={() => navigate('/dashboard')}
                      >
                        Enter the Fortress
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 border-white/30 text-white hover:bg-white/10"
                        onClick={handleManageSubscription}
                        disabled={isPortalLoading}
                      >
                        {isPortalLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Manage Subscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            /* No subscription - redirect to pricing */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-white/80 mb-4">No active subscription found.</p>
              <Button 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate('/pricing')}
              >
                View Pricing
              </Button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-6">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Zero Hero. From balances due to a more balanced you.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
