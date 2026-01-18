import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { HeroTip } from '@/components/onboarding/HeroTip';
import { MoatSelector } from '@/components/onboarding/MoatSelector';
import { AhaMomentStep } from '@/components/onboarding/AhaMomentStep';
import { PricingStep } from '@/components/onboarding/PricingStep';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { Clock, Swords, Castle, ArrowRight, ArrowLeft, Loader2, Shield, AlertCircle } from 'lucide-react';
import { soundEffects, playAchievementUnlockSound } from '@/lib/soundEffects';
import { haptics } from '@/lib/haptics';
import confetti from 'canvas-confetti';

const stepIcons = {
  1: Clock,
  2: Swords,
  3: Castle,
};

const stepTitles = {
  1: 'Define Your Life Value',
  2: 'Name Your Primary Debt Boss',
  3: 'Set Your Moat Depth',
};

const stepQuestions = {
  1: 'What is one hour of your life worth?',
  2: 'Every Hero needs a villain to defeat.',
  3: 'How much protection do you want from life\'s surprises?',
};

// Premium slide-in animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const slideTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.3 },
  scale: { duration: 0.3 },
};

export default function Onboarding() {
  const {
    currentStep,
    data,
    setHourlyWage,
    setPrimaryDebt,
    setMoatTarget,
    nextStep,
    prevStep,
    skipStep,
    showAhaMoment,
    showPricing,
    showCeremony,
    skipTrial,
    enterDashboard,
    isCompleting,
  } = useOnboardingState();

  // Track slide direction for animations
  const [slideDirection, setSlideDirection] = useState(1);

  // Local form state for step 2
  const [debtName, setDebtName] = useState(data.primaryDebt?.name || '');
  const [debtBalance, setDebtBalance] = useState(data.primaryDebt?.balance?.toString() || '');
  const [debtApr, setDebtApr] = useState(data.primaryDebt?.apr?.toString() || '');
  const [debtMinPayment, setDebtMinPayment] = useState(data.primaryDebt?.minimumPayment?.toString() || '');

  // Validation errors for step 2
  const [errors, setErrors] = useState<{
    balance?: string;
    apr?: string;
  }>({});

  // Local form state for step 1
  const [hourlyWageInput, setHourlyWageInput] = useState(data.hourlyWage?.toString() || '');

  const StepIcon = currentStep <= 3 ? stepIcons[currentStep as 1 | 2 | 3] : Shield;

  // Trigger ceremony effects when step 6 is reached
  useEffect(() => {
    if (currentStep === 6) {
      // Epic confetti burst
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#F5A623', '#0D7377', '#FFD700'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#F5A623', '#0D7377', '#FFD700'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Sound and haptics
      playAchievementUnlockSound('epic');
      haptics.success();
    }
  }, [currentStep]);

  const validateDebtForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (debtBalance) {
      const balanceValue = parseFloat(debtBalance);
      if (isNaN(balanceValue) || balanceValue <= 0) {
        newErrors.balance = 'Balance must be a positive amount';
      }
    }

    if (debtApr) {
      const aprValue = parseFloat(debtApr);
      if (isNaN(aprValue) || aprValue < 0 || aprValue > 100) {
        newErrors.apr = 'APR must be between 0% and 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Continue = () => {
    const wage = parseFloat(hourlyWageInput);
    if (!isNaN(wage) && wage > 0) {
      setHourlyWage(wage);
    }
    setSlideDirection(1);
    nextStep();
  };

  const handleStep2Continue = () => {
    if (!validateDebtForm()) {
      return;
    }

    const balance = parseFloat(debtBalance);
    const apr = parseFloat(debtApr);
    const minPayment = parseFloat(debtMinPayment);

    if (debtName && balance > 0) {
      setPrimaryDebt({
        name: debtName,
        balance,
        apr: isNaN(apr) ? 0 : apr,
        minimumPayment: isNaN(minPayment) ? 25 : minPayment,
      });
    }
    setSlideDirection(1);
    nextStep();
  };

  const handleStep3Complete = () => {
    setSlideDirection(1);
    showAhaMoment();
  };

  const handleAhaMomentContinue = () => {
    setSlideDirection(1);
    showPricing();
  };

  const handlePricingStartTrial = () => {
    // This is called after successful checkout redirect
    // The useOnboardingState hook handles the redirect
    showCeremony();
  };

  const handlePricingSkip = () => {
    setSlideDirection(1);
    skipTrial();
  };

  const handlePrevStep = () => {
    setSlideDirection(-1);
    prevStep();
  };

  const handleSkip = () => {
    setSlideDirection(1);
    skipStep();
  };

  const handleEnterFortress = () => {
    soundEffects.heroChoice();
    haptics.medium();
    enterDashboard();
  };

  // Calculate total steps shown in indicator (show 5 for steps 1-5, hide for ceremony)
  const getTotalSteps = () => {
    if (currentStep === 6) return 0; // Don't show indicator on ceremony
    return 5;
  };

  const getDisplayStep = () => {
    if (currentStep === 6) return 0;
    return currentStep;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <Link to="/">
          <Logo className="h-8 sm:h-10" variant="dark" />
        </Link>
        {currentStep <= 5 && (
          <StepIndicator currentStep={getDisplayStep()} totalSteps={getTotalSteps()} />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={slideDirection}>
            {/* Steps 1-3: Data Collection */}
            {currentStep <= 3 && (
              <motion.div
                key={currentStep}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg"
              >
                {/* Step Icon */}
                <motion.div 
                  className="flex justify-center mb-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <StepIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                </motion.div>

                {/* Step Title & Question */}
                <motion.div 
                  className="text-center mb-6 sm:mb-8"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {stepTitles[currentStep as 1 | 2 | 3]}
                  </h1>
                  <p className="text-muted-foreground">
                    {stepQuestions[currentStep as 1 | 2 | 3]}
                  </p>
                </motion.div>

                {/* Step Content */}
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Label htmlFor="hourly-wage" className="sr-only">
                          Hourly Wage
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            $
                          </span>
                          <Input
                            id="hourly-wage"
                            type="number"
                            placeholder="30.00"
                            value={hourlyWageInput}
                            onChange={(e) => setHourlyWageInput(e.target.value)}
                            className="pl-8 text-center text-lg h-14"
                            min="1"
                            step="0.01"
                          />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-2">
                          per hour
                        </p>
                      </div>

                      <HeroTip>
                        Don't worry, this stays on your device. We use this to calculate how many hours of work you're 'buying back' from the banks.
                      </HeroTip>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="debt-name">Debt Name</Label>
                        <Input
                          id="debt-name"
                          placeholder="Chase Sapphire"
                          value={debtName}
                          onChange={(e) => setDebtName(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="debt-balance">Balance</Label>
                        <div className="relative mt-1.5">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="debt-balance"
                            type="number"
                            placeholder="5,200"
                            value={debtBalance}
                            onChange={(e) => {
                              setDebtBalance(e.target.value);
                              if (errors.balance) setErrors((prev) => ({ ...prev, balance: undefined }));
                            }}
                            className={`pl-8 ${errors.balance ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {errors.balance && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.balance}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="debt-apr">APR (%)</Label>
                          <div className="relative mt-1.5">
                            <Input
                              id="debt-apr"
                              type="number"
                              placeholder="22.99"
                              value={debtApr}
                              onChange={(e) => {
                                setDebtApr(e.target.value);
                                if (errors.apr) setErrors((prev) => ({ ...prev, apr: undefined }));
                              }}
                              className={errors.apr ? 'border-destructive focus-visible:ring-destructive' : ''}
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              %
                            </span>
                          </div>
                          {errors.apr && (
                            <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.apr}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="debt-min-payment">Min Payment</Label>
                          <div className="relative mt-1.5">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id="debt-min-payment"
                              type="number"
                              placeholder="105"
                              value={debtMinPayment}
                              onChange={(e) => setDebtMinPayment(e.target.value)}
                              className="pl-8"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>

                      <HeroTip>
                        Naming your debt makes it an enemy you can defeat. Most Heroes start with their highest-interest credit card.
                      </HeroTip>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <MoatSelector value={data.moatTarget} onChange={setMoatTarget} />

                      <HeroTip>
                        A $1,000 Moat protects 80% of Heroes from 'relapsing' into debt when life happens.
                      </HeroTip>
                    </div>
                  )}
                </motion.div>

                {/* Navigation Buttons */}
                <motion.div 
                  className="mt-8 space-y-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  {currentStep < 3 ? (
                    <>
                      <Button
                        onClick={currentStep === 1 ? handleStep1Continue : handleStep2Continue}
                        className="w-full h-12"
                        size="lg"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        className="w-full text-muted-foreground"
                      >
                        Skip for now
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleStep3Complete}
                      disabled={isCompleting}
                      className="w-full h-12"
                      size="lg"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calculating your path...
                        </>
                      ) : (
                        <>
                          See My Freedom Path
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}

                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-full"
                      disabled={isCompleting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: Aha Moment */}
            {currentStep === 4 && (
              <motion.div
                key="aha-moment"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
              >
                <AhaMomentStep
                  hourlyWage={data.hourlyWage}
                  debt={data.primaryDebt}
                  onContinue={handleAhaMomentContinue}
                />
              </motion.div>
            )}

            {/* Step 5: Pricing */}
            {currentStep === 5 && (
              <motion.div
                key="pricing"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
              >
                <PricingStep
                  onStartTrial={handlePricingStartTrial}
                  onSkipTrial={handlePricingSkip}
                />
              </motion.div>
            )}

            {/* Step 6: Ceremony Screen */}
            {currentStep === 6 && (
              <motion.div
                key="ceremony"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg text-center"
              >
                {/* Shield Icon with Glow */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-accent to-amber-500 rounded-full flex items-center justify-center shadow-lg mb-6"
                >
                  <Shield className="w-12 h-12 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
                >
                  Character Created
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg sm:text-xl text-accent font-medium mb-6"
                >
                  Welcome to the Fortress, Hero.
                </motion.p>

                {/* Quest Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-muted/50 rounded-xl p-4 text-left space-y-2 mb-8"
                >
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Your Quest Awaits
                  </h3>
                  {data.moatTarget && (
                    <p className="text-foreground">
                      Moat Target: <span className="font-bold text-primary">${data.moatTarget.toLocaleString()}</span>
                    </p>
                  )}
                  {data.primaryDebt?.name && (
                    <p className="text-foreground">
                      First Boss: <span className="font-bold text-destructive">{data.primaryDebt.name}</span>{' '}
                      <span className="text-muted-foreground">(${data.primaryDebt.balance.toLocaleString()})</span>
                    </p>
                  )}
                  {data.hourlyWage && (
                    <p className="text-foreground">
                      Your Time Value: <span className="font-bold text-accent">${data.hourlyWage}/hour</span>
                    </p>
                  )}
                  {!data.primaryDebt?.name && !data.hourlyWage && (
                    <p className="text-muted-foreground italic">
                      You can add these details later from your dashboard.
                    </p>
                  )}
                </motion.div>

                {/* Enter Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={handleEnterFortress}
                    size="lg"
                    className="w-full h-14 text-lg"
                  >
                    Enter the Fortress
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  {/* Skip to Demo Link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="text-center"
                  >
                    <Link
                      to="/dashboard"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                    >
                      Skip to Demo Mode
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Your data stays on your device.{' '}
          <Link to="/privacy" className="underline hover:text-foreground">
            Learn more
          </Link>
        </p>
      </footer>
    </div>
  );
}
