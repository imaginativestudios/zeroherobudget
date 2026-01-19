import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  Mail, 
  Check, 
  ArrowRight, 
  Shield, 
  TrendingDown, 
  Target, 
  Heart, 
  Zap, 
  Sprout,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { loadDemoData } from "@/lib/demoDataLoader";

const ComingSoon = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // The Three Oaths - matching Landing page
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
    { level: 1, title: 'Wayfarer', quote: 'Every journey starts with a single step.' },
    { level: 2, title: 'Pathfinder', quote: 'Your Sanctuary is complete. You\'re ready for the road ahead.' },
    { level: 3, title: 'Sage', quote: 'You\'ve cleared your first Shadow.' },
    { level: 4, title: 'Luminary', quote: 'Debt-free. You ARE the Zero Hero.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-waitlist', {
        body: { email }
      });

      if (error) throw error;

      console.log("Subscription successful:", data);

      setSubmitted(true);
      toast({
        title: "You're on the list! 🎉",
        description: "Check your email for a confirmation message.",
      });
    } catch (error: any) {
      console.error("Error subscribing to waitlist:", error);
      
      // Fallback to localStorage if edge function fails
      const existingEmails = JSON.parse(localStorage.getItem("coming_soon_emails") || "[]");
      if (!existingEmails.includes(email)) {
        existingEmails.push(email);
        localStorage.setItem("coming_soon_emails", JSON.stringify(existingEmails));
      }

      setSubmitted(true);
      toast({
        title: "Thanks for your interest!",
        description: "We'll notify you when Zero Hero launches.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          {/* Logo - Focal Point */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-6 md:mb-8 flex justify-center"
          >
            <Logo className="h-12 xs:h-16 sm:h-24 md:h-32 lg:h-40 w-auto max-w-[90vw]" />
          </motion.div>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm font-semibold text-white">Coming Soon</span>
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
            Your debt doesn't define you. Your journey does. We're building something amazing to help you achieve financial freedom.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 px-2"
          >
            <Button
              size="lg"
              variant="inverse"
              className="text-sm sm:text-base md:text-lg px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto"
              onClick={async () => {
                // Safety check: Ensure user is logged out before entering demo mode
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  toast({
                    title: "Already logged in",
                    description: "You're viewing your own data. Log out to explore the demo.",
                    variant: "destructive"
                  });
                  navigate('/dashboard');
                  return;
                }
                
                const result = loadDemoData();
                if (result.loaded) {
                  toast({
                    title: "Demo Loaded! 🎉",
                    description: "Explore a fully-populated financial dashboard",
                  });
                  navigate('/dashboard');
                } else {
                  toast({
                    title: "Demo Not Available",
                    description: result.summary,
                    variant: "destructive"
                  });
                }
              }}
            >
              Explore Demo
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
          </motion.div>

          {/* Email Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-md mx-auto mb-8"
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-sm text-white/80 mb-3">Get notified when we launch:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-white/95 backdrop-blur-sm border-white/20 text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    variant="inverse"
                    disabled={isLoading}
                    className="h-12 font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? "Subscribing..." : "Notify Me"}
                  </Button>
                </div>
                <p className="text-xs text-white/70">
                  We'll never share your email. Unsubscribe anytime.
                </p>
              </form>
            ) : (
              <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-center gap-3 text-white">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20">
                    <Check className="h-6 w-6 text-accent" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">You're on the list!</p>
                    <p className="text-sm text-white/80">We'll be in touch soon.</p>
                  </div>
                </div>
              </div>
            )}
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

      {/* The Path Section - Simplified Journey Map */}
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

          {/* Horizontal Journey Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {journeyLevels.map((level, idx) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-foreground font-bold text-sm sm:text-base">{level.level}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-card-foreground mb-2">
                    {level.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    "{level.quote}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-16 sm:py-24 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              What's Coming
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for your financial freedom
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: 'Smart Debt Strategies',
                description: 'Snowball & Avalanche methods to crush debt faster',
                icon: TrendingDown,
              },
              {
                title: 'War Map Budget',
                description: 'Visualize your spending with tactical precision',
                icon: Target,
              },
              {
                title: 'Freedom Timeline',
                description: 'See your debt-free date and track progress',
                icon: Zap,
              },
              {
                title: 'Local-First Privacy',
                description: 'Your data stays on your device, always',
                icon: Shield,
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-8 h-8 text-primary mx-auto mb-4" aria-hidden="true" />
                <h3 className="font-bold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
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
            Explore the demo and see how Zero Hero can transform your relationship with money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              variant="inverse"
              className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6"
              onClick={async () => {
                // Safety check: Ensure user is logged out before entering demo mode
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  toast({
                    title: "Already logged in",
                    description: "You're viewing your own data. Log out to explore the demo.",
                    variant: "destructive"
                  });
                  navigate('/dashboard');
                  return;
                }
                
                const result = loadDemoData();
                if (result.loaded) {
                  toast({
                    title: "Demo Loaded! 🎉",
                    description: "Explore a fully-populated financial dashboard",
                  });
                  navigate('/dashboard');
                } else {
                  toast({
                    title: "Demo Not Available",
                    description: result.summary,
                    variant: "destructive"
                  });
                }
              }}
            >
              Explore Demo
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
          </motion.div>
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
              <Link to="/legal" className="hover:text-foreground transition-colors">
                Legal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
