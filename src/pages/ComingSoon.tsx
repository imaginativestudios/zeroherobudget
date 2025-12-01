import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Gradient Background */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-primary via-primary-light to-primary-dark">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo className="h-24 md:h-32 lg:h-40" />
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20">
            <span className="text-sm font-semibold text-primary-foreground">Coming Soon</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Transform Debt Into Victory
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-xl mx-auto">
              We're building something amazing to help you achieve financial freedom. Get notified when we launch.
            </p>
          </div>

          {/* Email Signup Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-background/95 backdrop-blur-sm border-background/20 text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="h-12 bg-accent hover:bg-accent-dark text-accent-foreground font-semibold shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Subscribing..." : "Notify Me"}
                </Button>
              </div>
              <p className="text-xs text-primary-foreground/70">
                We'll never share your email. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-6 rounded-lg bg-background/10 backdrop-blur-sm border border-background/20">
              <div className="flex items-center justify-center gap-3 text-primary-foreground">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20">
                  <Check className="h-6 w-6 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">You're on the list!</p>
                  <p className="text-sm text-primary-foreground/80">We'll be in touch soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Features Teaser */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-4 rounded-lg bg-background/5 backdrop-blur-sm border border-background/10">
              <h3 className="font-semibold text-primary-foreground mb-2">Smart Debt Strategies</h3>
              <p className="text-sm text-primary-foreground/80">Snowball & Avalanche methods</p>
            </div>
            <div className="p-4 rounded-lg bg-background/5 backdrop-blur-sm border border-background/10">
              <h3 className="font-semibold text-primary-foreground mb-2">Budget Tracking</h3>
              <p className="text-sm text-primary-foreground/80">Visualize your spending</p>
            </div>
            <div className="p-4 rounded-lg bg-background/5 backdrop-blur-sm border border-background/10">
              <h3 className="font-semibold text-primary-foreground mb-2">Progress Insights</h3>
              <p className="text-sm text-primary-foreground/80">Track your financial journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Zero Hero. From balances due to a more balanced you.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
