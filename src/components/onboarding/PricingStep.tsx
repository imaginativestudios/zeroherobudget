import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Castle, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { AuthModal } from '@/components/AuthModal';
import { toast } from 'sonner';

interface PricingStepProps {
  onStartTrial: () => void;
  onSkipTrial: () => void;
}

const getTierInfo = (amount: number) => {
  if (amount <= 3) return { name: 'Starter', emoji: '🌱', color: 'text-emerald-500' };
  if (amount <= 7) return { name: 'Supporter', emoji: '⚔️', color: 'text-blue-500' };
  if (amount <= 11) return { name: 'Champion', emoji: '🛡️', color: 'text-purple-500' };
  return { name: 'Hero', emoji: '👑', color: 'text-accent' };
};

const features = [
  'Unlimited budget tracking',
  'AI-powered insights',
  'Debt snowball calculator',
  'Emergency fund builder',
  'All future features included',
];

export function PricingStep({ onStartTrial, onSkipTrial }: PricingStepProps) {
  const [amount, setAmount] = useState(5);
  const [processing, setProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingCheckoutRef = useRef(false);
  
  const { user } = useAuth();
  const { createCheckout, subscribed, isTrialing, loading: statusLoading, tierName, tierEmoji } = useSubscriptionStatus();
  
  const tierInfo = getTierInfo(amount);
  const hasActiveSubscription = subscribed || isTrialing;

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
      const checkoutUrl = await createCheckout(amount);
      
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

          {/* Current Tier Badge */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <span className="text-4xl">{tierEmoji || '⚔️'}</span>
            <p className="text-lg font-bold text-primary mt-2">
              {tierName || 'Hero'}
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
            Choose your support level to unlock the full experience
          </p>
        </motion.div>

        {/* Pricing Content */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Tier Badge */}
          <div className="text-center">
            <span className={`text-4xl`}>{tierInfo.emoji}</span>
            <p className={`text-lg font-bold ${tierInfo.color} mt-2`}>
              {tierInfo.name}
            </p>
          </div>

          {/* Amount Display */}
          <div className="text-center">
            <span className="text-4xl font-bold text-foreground">${amount}</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[amount]}
              onValueChange={(values) => setAmount(values[0])}
              min={3}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>$3</span>
              <span>$15</span>
            </div>
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
            <span className="block mt-1">then ${amount}/month · Cancel anytime</span>
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
