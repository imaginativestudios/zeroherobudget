import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { ArrowRight, Shield, TrendingDown, Users, Target, BarChart3, CreditCard } from 'lucide-react';

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const features = [
    {
      icon: TrendingDown,
      title: 'Smart Debt Strategy',
      description: 'Choose between Snowball and Avalanche methods to eliminate debt faster with data-driven insights.',
    },
    {
      icon: Target,
      title: 'Budget Mastery',
      description: 'Track every dollar with intelligent categorization and visual progress tracking across 10 household categories.',
    },
    {
      icon: CreditCard,
      title: 'Subscription Control',
      description: 'Automatically detect and manage recurring subscriptions to cut unnecessary spending.',
    },
    {
      icon: Users,
      title: 'Household Collaboration',
      description: 'Manage finances together with role-based access and shared household budgets.',
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'Beautiful charts and reports that make understanding your financial health effortless.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level security with encrypted data storage and complete privacy protection.',
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            {/* Placeholder for video - can be replaced with actual video URL */}
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
              <div className="text-6xl opacity-20">💰</div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient-royal">
              Transform Debt Into Victory
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-foreground/80 max-w-3xl mx-auto">
              Take control of your financial future with intelligent budgeting, strategic debt payoff plans, and powerful household collaboration tools.
            </p>
            <p className="text-lg md:text-xl mb-12 text-muted-foreground max-w-2xl mx-auto">
              Join thousands crushing their debt and building wealth with data-driven strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="royal"
                onClick={() => openAuth('signup')}
                className="text-lg px-8 py-6"
              >
                Start Your Journey Free
                <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => openAuth('login')}
                className="text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                <span>Proven Strategies</span>
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
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="bg-card border border-border rounded-lg p-8 hover:shadow-royal transition-all duration-300 hover:scale-105"
                >
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo/Video Section */}
        <section className="py-24 bg-gradient-subtle">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                See It In Action
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Watch how easy it is to track budgets, manage debt, and achieve your financial goals.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-elegant border border-border bg-card">
                {/* Placeholder for demo video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="text-center">
                    <BarChart3 className="w-24 h-24 text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground text-lg">Demo video placeholder</p>
                    <p className="text-sm text-muted-foreground mt-2">Add your video URL to showcase the app</p>
                  </div>
                </div>
                {/* To add actual video, replace above with:
                <iframe 
                  src="YOUR_VIDEO_URL" 
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                */}
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
            
            <Button 
              size="lg" 
              variant="gold"
              onClick={() => openAuth('signup')}
              className="text-lg px-8 py-6"
            >
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
                © 2024 Monarch Budget. Transform debt into victory.
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

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultMode={authMode}
      />
    </>
  );
}
