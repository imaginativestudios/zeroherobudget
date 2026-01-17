import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { Logo } from '@/components/Logo';
import { DeviceMockups } from '@/components/DeviceMockups';
import { ArrowRight, Shield, TrendingDown, Target, Heart, Zap, Sprout, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const navigate = useNavigate();

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const beginQuest = () => {
    navigate('/onboarding');
  };

  // The Three Oaths
  const oaths = [
    {
      icon: Heart,
      title: 'The Sanctuary',
      quote: '"Build a safe haven before the storm."',
      description: 'Your first quest: A $1,000 emergency fund. This Sanctuary protects 80% of travelers from falling back into shadow.',
    },
    {
      icon: Zap,
      title: 'The Freedom Engine',
      quote: '"Every dollar saved is an hour of life reclaimed."',
      description: 'We calculate the TRUE cost of purchases—in hours of work, not just dollars.',
    },
    {
      icon: Sprout,
      title: 'Growth Over Guilt',
      quote: '"There are no failures here—only lessons."',
      description: 'Off the path? That\'s just a \'Detour\' not a character flaw. Behind on goals? You\'re \'Finding the Way.\'',
    },
  ];

  // The Path - Wayfarer to Luminary
  const journeyLevels = [
    {
      level: 1,
      title: 'Wayfarer',
      quote: 'Every journey starts with a single step.',
      milestones: [
        'Complete onboarding',
        'Enter your first shadow',
        'Set your Sanctuary target',
      ],
    },
    {
      level: 2,
      title: 'Pathfinder',
      quote: 'Your Sanctuary is complete. You\'re ready for the road ahead.',
      milestones: [
        'Build $1,000 emergency fund',
        'Log 7 days of transactions',
        'Make your first extra payment',
      ],
    },
    {
      level: 3,
      title: 'Sage',
      quote: 'You\'ve cleared your first Shadow.',
      milestones: [
        'Pay off your first debt',
        'Maintain 30-day streak',
        'Achieve 75+ Consistency Score',
      ],
    },
    {
      level: 4,
      title: 'Luminary',
      quote: 'Debt-free. You ARE the Zero Hero.',
      milestones: [
        'All shadows cleared',
        '6-month emergency fund',
        'Financial freedom achieved',
      ],
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Solid Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary-dark">
            {/* Subtle decorative elements for visual depth */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Logo - Focal Point */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-6 md:mb-8 flex justify-center"
            >
              <Logo className="h-12 xs:h-16 sm:h-24 md:h-32 lg:h-40 w-auto max-w-[90vw]" />
            </motion.div>

            {/* Headline - THE MANIFESTO */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight"
            >
              From Balances Due to a More Balanced You
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto px-2"
            >
              Your debt doesn't define you. Your journey does.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-2"
            >
              <Button
                size="lg"
                variant="gold"
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 h-11 sm:h-12 text-primary-dark"
                onClick={beginQuest}
              >
                Begin Your Quest
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 h-11 sm:h-12 border-2 border-white text-primary-dark hover:bg-white/20 hover:border-white hover:text-white"
                onClick={() => openAuth('login')}
              >
                Sign In
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-white text-xs sm:text-sm"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span>Local-First Privacy</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span>Proven Debt Strategies</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span>Track Every Dollar</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Three Oaths Section */}
        <section className="py-16 sm:py-24 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                The Three Oaths
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Every Zero Hero pledges to honor these truths
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {oaths.map((oath, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="bg-card border border-border rounded-xl p-6 sm:p-8 hover:shadow-royal transition-all duration-300 hover:scale-[1.02]"
                >
                  <oath.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4" aria-hidden="true" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-card-foreground">
                    {oath.title}
                  </h3>
                  <p className="text-accent font-medium italic mb-4 text-sm sm:text-base">
                    {oath.quote}
                  </p>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {oath.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Path Section - Journey Map */}
        <section className="py-16 sm:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                The Path
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Your journey from zero to hero
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="max-w-3xl mx-auto relative">
              {/* Timeline Line */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 transform sm:-translate-x-1/2" />

              {journeyLevels.map((level, idx) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative flex items-start gap-4 sm:gap-8 mb-8 sm:mb-12 ${
                    idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-4 sm:left-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background transform -translate-x-1/2 flex items-center justify-center z-10">
                    <span className="text-primary-foreground font-bold text-xs">{level.level}</span>
                  </div>

                  {/* Content Card */}
                  <div
                    className={`ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] bg-card border border-border rounded-xl p-5 sm:p-6 ${
                      idx % 2 === 0 ? 'sm:mr-auto sm:text-right' : 'sm:ml-auto sm:text-left'
                    }`}
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-1">
                      Level {level.level}: {level.title}
                    </h3>
                    <p className="text-accent font-medium italic text-sm mb-3">
                      "{level.quote}"
                    </p>
                    <ul className={`space-y-1.5 text-sm text-muted-foreground ${
                      idx % 2 === 0 ? 'sm:text-right' : 'sm:text-left'
                    }`}>
                      {level.milestones.map((milestone, mIdx) => (
                        <li key={mIdx} className={`flex items-center gap-2 ${
                          idx % 2 === 0 ? 'sm:flex-row-reverse' : ''
                        }`}>
                          <ChevronRight className="h-3 w-3 text-primary flex-shrink-0" />
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section with Device Mockups */}
        <section className="py-16 sm:py-24 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                See It In Action
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Manage your finances from any device. Beautiful, intuitive, and designed for clarity.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <DeviceMockups />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
            >
              Ready to Begin Your Hero's Journey?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-12 text-white/90 max-w-2xl mx-auto px-2"
            >
              Join thousands who've transformed their relationship with money. Your quest to financial freedom starts today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                variant="gold"
                onClick={beginQuest}
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6"
              >
                Begin Your Quest
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </Button>
            </motion.div>

            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-white/90">
              Already a Hero?{' '}
              <button
                onClick={() => openAuth('login')}
                className="underline hover:text-white transition-colors font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-background border-t border-border">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                © 2026 Zero Hero. From balances due to a more balanced you.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultMode={authMode} />
    </>
  );
}
