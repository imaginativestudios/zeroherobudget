import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Castle, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { AuthModal } from '@/components/AuthModal';
import { toast } from 'sonner';
import { STRIPE_PRICES, type PricingInterval } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PricingStepProps {
  onStartTrial: () => void;
  onSkipTrial: () => void;
}

const features = [
  'Unlimited budget tracking',
  'AI-powered insights',
  'Debt snowball calculator',
  'Emergency fund builder',
  'All future features included',
];

export function PricingStep({ onStartTrial, onSkipTrial }: PricingStepProps) {
  const [selectedInterval, setSelectedInterval] = useState<PricingInterval>('annual');
  const [processing, setProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingCheckoutRef = useRef(false);
  
  const { user } = useAuth();
  const { createCheckout, subscribed, isTrialing, loading: statusLoading, interval: currentInterval } = useSubscriptionStatus();
  
  const hasActiveSubscription = subscribed || isTrialing;
  const selectedPrice = STRIPE_PRICES[selectedInterval];

  // When user logs in after opening auth modal, trigger checkout
  useEffect(() => {
    if (user && pendingCheckoutRef.current) {
      pendingCheckoutRef.current = false;
      handleCheckout();
    }
  }, [user]);

  const handleCheckout = async () => {
    if (!user) return;
    
    setProcessing(true);
    try {
      const checkoutUrl = await createCheckout(selectedInterval);
      
      // Save that we're in checkout flow
      localStorage.setItem('bdt_checkout_in_progress', 'true');
      
      window.open(checkoutUrl, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      toast.error(message);
      setProcessing(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user) {
      pendingCheckoutRef.current = true;
      setShowAuthModal(true);
      return;
    }

    await handleCheckout();
  };

  // Show active subscription status instead of pricing
  if (hasActiveSubscription && !statusLoading) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          {/* Success Icon */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
          </motion.div>

          {/* Status Message */}
          <motion.div 
            className="text-center mb-6"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              {isTrialing ? 'Your Trial is Active!' : 'You\'re Subscribed!'}
            </h1>
            <p className="text-muted-foreground">
              {isTrialing 
                ? 'You already have an active trial. Continue your quest!'
                : 'Your fortress is fully operational.'}
            </p>
          </motion.div>

          {/* Current Plan Badge */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <span className="text-4xl">🏰</span>
            <p className="text-lg font-bold text-primary mt-2">
              {currentInterval === 'annual' ? 'Annual' : 'Monthly'} Plan
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Button
              onClick={onStartTrial}
              className="w-full h-12"
              size="lg"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg"
      >
        {/* Icon */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Castle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div 
          className="text-center mb-6"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Initialize Your Fortress
          </h1>
          <p className="text-muted-foreground">
            Choose your plan to unlock the full experience
          </p>
        </motion.div>

        {/* Pricing Content */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Interval Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-muted p-1 rounded-lg">
              <button
                onClick={() => setSelectedInterval('monthly')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
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
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all relative",
                  selectedInterval === 'annual'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-chart-3 text-chart-3-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  -$10
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className={cn(
                "cursor-pointer transition-all border-2",
                selectedInterval === 'monthly' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-border/80"
              )}
              onClick={() => setSelectedInterval('monthly')}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">${STRIPE_PRICES.monthly.amount}</div>
                <div className="text-xs text-muted-foreground">/month</div>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all border-2 relative",
                selectedInterval === 'annual' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-border/80"
              )}
              onClick={() => setSelectedInterval('annual')}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">${STRIPE_PRICES.annual.amount}</div>
                <div className="text-xs text-muted-foreground">/year</div>
                <div className="text-xs text-chart-3 font-medium mt-1">${STRIPE_PRICES.annual.monthlyEquivalent}/mo</div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Trial Info */}
          <div className="text-center text-sm text-muted-foreground bg-accent/10 rounded-lg p-3">
            <span className="text-accent font-medium">✨ Try free for 7 days</span>
            <span className="block mt-1">
              then ${selectedPrice.amount}/{selectedInterval === 'annual' ? 'year' : 'month'} · Cancel anytime
            </span>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-3"
        >
          <Button
            onClick={handleStartTrial}
            disabled={processing || statusLoading}
            className="w-full h-12"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                Start 7-Day Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={onSkipTrial}
            className="w-full text-muted-foreground"
            disabled={processing}
          >
            Skip — Explore Demo Mode
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            No hidden fees · Cancel anytime · Your data stays private
          </p>
        </motion.div>
      </motion.div>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}
