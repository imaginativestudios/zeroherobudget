/**
 * Initialize Mission Card
 * 
 * Full-screen empty state shown when user has no debts.
 * Guides them to add their first debt or explore demo mode.
 */

import { motion } from 'framer-motion';
import { Zap, Plus, ArrowRight, Sparkles, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadDemoData } from '@/lib/demoDataLoader';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function InitializeMissionCard() {
  const navigate = useNavigate();

  const handleLoadDemoData = async () => {
    // Safety check: Ensure user is logged out before loading demo data
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      toast({
        title: "Already logged in",
        description: "You're viewing your own data. Log out to explore the demo.",
        variant: "destructive"
      });
      return;
    }
    
    const result = loadDemoData();
    if (result.loaded) {
      toast({
        title: "Demo Data Loaded! 🎉",
        description: result.summary,
      });
      // Refresh to show the new data
      window.location.reload();
    } else {
      toast({
        title: "Demo Not Available",
        description: result.summary,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Target className="w-10 h-10 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            Get Started
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            No debts tracked yet. Add your first debt to see your payoff strategy and unlock the full dashboard.
          </p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[200px] gap-2"
              onClick={() => navigate('/debts')}
            >
              <Plus className="h-5 w-5" />
              Add Your First Debt
            </Button>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/onboarding')}
            >
              <Target className="h-4 w-4" />
              Return to Onboarding
            </Button>
            
            <Button
              variant="ghost"
              className="gap-2"
              onClick={handleLoadDemoData}
            >
              <Sparkles className="h-4 w-4" />
              Explore Demo Data
            </Button>
          </div>

          {/* Quick Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Once you add debts, you'll unlock:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Current Target</p>
                  <p className="text-xs text-muted-foreground">Your focus debt to pay off</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-sm">Freedom Date</p>
                  <p className="text-xs text-muted-foreground">Your debt-free timeline</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm">Extra Payment</p>
                  <p className="text-xs text-muted-foreground">Accelerate your payoff</p>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
