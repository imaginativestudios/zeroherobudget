import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { HeroTip } from '@/components/onboarding/HeroTip';
import { MoatSelector } from '@/components/onboarding/MoatSelector';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { Clock, Swords, Castle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

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
    completeOnboarding,
    isCompleting,
  } = useOnboardingState();

  // Local form state for step 2
  const [debtName, setDebtName] = useState('');
  const [debtBalance, setDebtBalance] = useState('');
  const [debtApr, setDebtApr] = useState('');
  const [debtMinPayment, setDebtMinPayment] = useState('');

  // Local form state for step 1
  const [hourlyWageInput, setHourlyWageInput] = useState('');

  const StepIcon = stepIcons[currentStep];

  const handleStep1Continue = () => {
    const wage = parseFloat(hourlyWageInput);
    if (!isNaN(wage) && wage > 0) {
      setHourlyWage(wage);
    }
    nextStep();
  };

  const handleStep2Continue = () => {
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
    nextStep();
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <Link to="/">
          <Logo className="h-8 sm:h-10" variant="dark" />
        </Link>
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg"
            >
              {/* Step Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <StepIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
              </div>

              {/* Step Title & Question */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {stepTitles[currentStep]}
                </h1>
                <p className="text-muted-foreground">
                  {stepQuestions[currentStep]}
                </p>
              </div>

              {/* Step Content */}
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
                        onChange={(e) => setDebtBalance(e.target.value)}
                        className="pl-8"
                        min="0"
                        step="0.01"
                      />
                    </div>
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
                          onChange={(e) => setDebtApr(e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
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

              {/* Navigation Buttons */}
              <div className="mt-8 space-y-3">
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
                      onClick={skipStep}
                      className="w-full text-muted-foreground"
                    >
                      Skip for now
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="w-full h-12"
                    size="lg"
                    variant="gold"
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your character...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}

                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="w-full"
                    disabled={isCompleting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
            </motion.div>
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
