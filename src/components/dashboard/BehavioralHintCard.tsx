/**
 * Behavioral Hint Card
 * 
 * Displays AI-driven financial guidance based on user's current state.
 * Shows prioritized hints with actions and dismissibility.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, X, ChevronDown, ChevronUp, AlertTriangle, Sparkles, TrendingUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  generateBehavioralHints, 
  getTopHints, 
  type BehavioralHint,
  type HintGeneratorData 
} from '@/lib/behavioralHints';

interface BehavioralHintCardProps {
  data: HintGeneratorData;
  animationDelay?: number;
}

// Icon mapping for hint types
const HINT_ICONS = {
  opportunity: TrendingUp,
  warning: AlertTriangle,
  celebration: Sparkles,
  tip: Info,
} as const;

// Color mapping for hint types
const HINT_STYLES = {
  opportunity: 'border-primary/30 bg-primary/5',
  warning: 'border-warning/30 bg-warning/5',
  celebration: 'border-success/30 bg-success/5',
  tip: 'border-muted-foreground/30 bg-muted/30',
} as const;

const HINT_ICON_COLORS = {
  opportunity: 'text-primary',
  warning: 'text-warning',
  celebration: 'text-success',
  tip: 'text-muted-foreground',
} as const;

export function BehavioralHintCard({
  data,
  animationDelay = 0,
}: BehavioralHintCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  // Generate hints and filter dismissed ones
  const allHints = useMemo(() => generateBehavioralHints(data), [data]);
  const visibleHints = useMemo(() => 
    getTopHints(allHints.filter(h => !dismissedHints.has(h.id)), 2),
    [allHints, dismissedHints]
  );

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set([...prev, hintId]));
  };

  // Don't render if no hints
  if (visibleHints.length === 0) {
    return null;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: animationDelay, duration: 0.4 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="shadow-royal bg-white dark:bg-card">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-2">
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full text-left group">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Financial Insights
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">
                    {visibleHints.length} insight{visibleHints.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 transition-transform group-hover:text-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:text-foreground" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="pt-2 space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleHints.map((hint, index) => (
                  <HintItem 
                    key={hint.id} 
                    hint={hint} 
                    onDismiss={() => dismissHint(hint.id)}
                    index={index}
                  />
                ))}
              </AnimatePresence>

              {allHints.length > 2 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  {allHints.length - visibleHints.length} more insights available
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}

interface HintItemProps {
  hint: BehavioralHint;
  onDismiss: () => void;
  index: number;
}

function HintItem({ hint, onDismiss, index }: HintItemProps) {
  const Icon = HINT_ICONS[hint.type];
  const styleClass = HINT_STYLES[hint.type];
  const iconColorClass = HINT_ICON_COLORS[hint.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative p-3 rounded-lg border",
        styleClass
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
        aria-label="Dismiss hint"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>

      <div className="flex gap-3 pr-6">
        <div className={cn("mt-0.5", iconColorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">
            {hint.title}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hint.message}
          </p>
          {hint.action && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              asChild
            >
              <Link to={hint.action.route}>
                {hint.action.label}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
