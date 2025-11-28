import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { Logo } from '@/components/Logo';
import { ArrowRight, Shield, TrendingDown, Users, Target, BarChart3, CreditCard, PiggyBank, Trophy } from 'lucide-react';
import dashboardScreenshot from '@/assets/dashboard-screenshot.png';
export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };
  const features = [{
    icon: TrendingDown,
    title: 'Smart Debt Strategy',
    description: 'Choose between Snowball and Avalanche methods to eliminate debt faster with data-driven insights.'
  }, {
    icon: Target,
    title: 'Budget Mastery',
    description: 'Track every dollar with intelligent categorization and visual progress tracking across 10 household categories.'
  }, {
    icon: CreditCard,
    title: 'Subscription Control',
    description: 'Automatically detect and manage recurring subscriptions to cut unnecessary spending.'
  }, {
    icon: Users,
    title: 'Household Collaboration',
    description: 'Manage finances together with role-based access and shared household budgets.'
  }, {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Beautiful charts and reports that make understanding your financial health effortless.'
  }, {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Bank-level security with encrypted data storage and complete privacy protection.'
  }];
  return <>
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
          <div className="mb-8 flex justify-center">
            <Logo className="h-24 md:h-32 lg:h-40 w-auto" />
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Debt Into Victory
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
            Take control of your finances with intelligent budgeting, powerful debt payoff strategies, and real-time household collaboration.
          </p>
          
          {/* CTA Buttons - Grouped by Proximity */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="gold" className="text-base sm:text-lg px-8 h-12 text-primary-dark" onClick={() => openAuth('signup')}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base sm:text-lg px-8 h-12 border-2 border-white text-primary-dark hover:bg-white/20 hover:border-white hover:text-white" onClick={() => openAuth('login')}>
              Sign In
            </Button>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span>Proven Debt Strategies</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Add family members for free </span>
            </div>
          </div>
        </div>
      </section>

        {/* Features Section */}
        <section className="py-24 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Everything You Need to Win
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to simplify your financial journey and accelerate your path to freedom.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => <div key={idx} className="bg-card border border-border rounded-lg p-8 hover:shadow-royal transition-all duration-300 hover:scale-105">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>)}
            </div>
          </div>
        </section>

        {/* App Showcase Section */}
        <section className="py-24 bg-gradient-subtle">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Everything You Need to Conquer Debt
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A complete financial command center designed to help you track, manage, and eliminate debt.
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              {/* Screenshot */}
              <div className="order-2 lg:order-1">
                <img 
                  src={dashboardScreenshot} 
                  alt="Zero Hero Dashboard Interface" 
                  className="rounded-2xl shadow-elegant border border-border"
                />
              </div>

              {/* Feature Bullets */}
              <div className="order-1 lg:order-2 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Real-Time Financial Overview</h3>
                    <p className="text-muted-foreground">Track income, expenses, net worth, and available funds for debt payments at a glance.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Smart Budget Management</h3>
                    <p className="text-muted-foreground">Organize expenses by category, compare planned vs. actual spending, and stay on track with visual insights.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Debt Payoff Strategies</h3>
                    <p className="text-muted-foreground">Choose between snowball and avalanche methods, visualize your progress, and celebrate milestones.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Subscription Tracking</h3>
                    <p className="text-muted-foreground">Monitor recurring payments, identify opportunities to save, and take control of monthly subscriptions.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Achievement Milestones</h3>
                    <p className="text-muted-foreground">Unlock achievements as you pay off debts and hit financial goals—celebrate every victory along the way.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Household Collaboration</h3>
                    <p className="text-muted-foreground">Invite family members to collaborate on budgets and financial goals—manage finances together.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Join thousands who've transformed their financial lives. Start your journey to debt freedom today.
            </p>
            
            <Button size="lg" variant="gold" onClick={() => openAuth('signup')} className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>

            <p className="mt-8 text-sm opacity-75">
              No credit card required • Free forever • Cancel anytime
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
                <button className="hover:text-foreground transition-colors">Privacy</button>
                <button className="hover:text-foreground transition-colors">Terms</button>
                <button className="hover:text-foreground transition-colors">Support</button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultMode={authMode} />
    </>;
}