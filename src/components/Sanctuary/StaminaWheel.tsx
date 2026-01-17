import { motion, useReducedMotion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StaminaWheelProps {
  incomeTotal: number;
  fixedExpenses: number;
  debtPayments: number;
  currentSpend: number;
  size?: number;
  className?: string;
}

const STAMINA_COLORS = {
  shadow: 'hsl(280 30% 35%)',
  provisions: 'hsl(220 40% 55%)',
  vitality: 'hsl(160 60% 40%)',
  vitalityLow: 'hsl(38 92% 50%)',
  background: 'hsl(var(--muted))',
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function StaminaWheel({
  incomeTotal,
  fixedExpenses,
  debtPayments,
  currentSpend,
  size = 280,
  className,
}: StaminaWheelProps) {
  const shouldReduceMotion = useReducedMotion();
  
  // Calculate percentages
  const shadowPercent = incomeTotal > 0 ? (debtPayments / incomeTotal) * 100 : 0;
  const provisionsPercent = incomeTotal > 0 ? (fixedExpenses / incomeTotal) * 100 : 0;
  const spentPercent = incomeTotal > 0 ? (currentSpend / incomeTotal) * 100 : 0;
  const vitalityPercent = Math.max(0, 100 - shadowPercent - provisionsPercent - spentPercent);
  
  // Calculate vitality amount
  const vitality = Math.max(0, incomeTotal - fixedExpenses - debtPayments - currentSpend);
  const isLowVitality = vitalityPercent < 10 && vitalityPercent > 0;
  const isDepleted = vitalityPercent <= 0;
  
  // SVG calculations
  const strokeWidth = 28;
  const radius = (size / 2) - strokeWidth - 8;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Calculate stroke dash arrays for each segment
  const shadowDash = (shadowPercent / 100) * circumference;
  const provisionsDash = (provisionsPercent / 100) * circumference;
  const spentDash = (spentPercent / 100) * circumference;
  const vitalityDash = (vitalityPercent / 100) * circumference;
  
  // Calculate offsets (segments start where previous ends)
  const shadowOffset = 0;
  const provisionsOffset = -shadowDash;
  const spentOffset = -(shadowDash + provisionsDash);
  const vitalityOffset = -(shadowDash + provisionsDash + spentDash);
  
  const vitalityColor = isDepleted 
    ? STAMINA_COLORS.background 
    : isLowVitality 
      ? STAMINA_COLORS.vitalityLow 
      : STAMINA_COLORS.vitality;

  const pulseAnimation = shouldReduceMotion 
    ? {} 
    : {
        opacity: isLowVitality ? [0.5, 1, 0.5] : [0.85, 1, 0.85],
      };

  const segmentTransition = {
    type: "spring" as const,
    stiffness: 50,
    damping: 15,
  };

  return (
    <div 
      className={cn("relative", className)} 
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Budget stamina wheel showing ${formatCurrency(vitality)} safe to spend out of ${formatCurrency(incomeTotal)} total income`}
    >
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <defs>
          {/* Outer glow filter for Vitality */}
          <filter id="vitalityGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Gradient for vitality segment */}
          <linearGradient id="vitalityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(160 60% 35%)" />
            <stop offset="100%" stopColor="hsl(160 70% 45%)" />
          </linearGradient>
        </defs>
        
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={STAMINA_COLORS.background}
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        
        {/* Shadow segment (Debt Payments) */}
        {shadowPercent > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={STAMINA_COLORS.shadow}
                strokeWidth={strokeWidth}
                strokeDasharray={`${shadowDash} ${circumference}`}
                strokeDashoffset={shadowOffset}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${shadowDash} ${circumference}` }}
                transition={segmentTransition}
                className="cursor-pointer"
                aria-label={`Shadow burden: ${formatCurrency(debtPayments)} per month`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-card border shadow-lg">
              <p className="font-medium">Shadow Burden</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(debtPayments)}/mo required
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Provisions segment (Fixed Expenses) */}
        {provisionsPercent > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={STAMINA_COLORS.provisions}
                strokeWidth={strokeWidth}
                strokeDasharray={`${provisionsDash} ${circumference}`}
                strokeDashoffset={provisionsOffset}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${provisionsDash} ${circumference}` }}
                transition={{ ...segmentTransition, delay: 0.1 }}
                className="cursor-pointer"
                aria-label={`Essential provisions: ${formatCurrency(fixedExpenses)} per month`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-card border shadow-lg">
              <p className="font-medium">Essential Provisions</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(fixedExpenses)}/mo committed
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Spent segment (Current discretionary spending) */}
        {spentPercent > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={strokeWidth}
                strokeDasharray={`${spentDash} ${circumference}`}
                strokeDashoffset={spentOffset}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${spentDash} ${circumference}` }}
                transition={{ ...segmentTransition, delay: 0.15 }}
                className="cursor-pointer opacity-60"
                aria-label={`Already spent: ${formatCurrency(currentSpend)} this month`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-card border shadow-lg">
              <p className="font-medium">Already Spent</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(currentSpend)} this month
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Vitality segment (Free Cash) with pulse and glow */}
        {vitalityPercent > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={vitalityColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${vitalityDash} ${circumference}`}
                strokeDashoffset={vitalityOffset}
                strokeLinecap="round"
                filter={!isLowVitality ? "url(#vitalityGlow)" : undefined}
                initial={{ strokeDasharray: `0 ${circumference}`, opacity: 0 }}
                animate={{ 
                  strokeDasharray: `${vitalityDash} ${circumference}`,
                  ...pulseAnimation,
                }}
                transition={{
                  strokeDasharray: { ...segmentTransition, delay: 0.2 },
                  opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                }}
                className="cursor-pointer"
                aria-label={`Vitality remaining: ${formatCurrency(vitality)} available`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-card border shadow-lg">
              <p className="font-medium text-success">Vitality Remaining</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(vitality)} available
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <motion.span 
          className={cn(
            "text-3xl font-bold tracking-tight",
            isDepleted && "text-destructive",
            isLowVitality && "text-warning",
            !isDepleted && !isLowVitality && "text-success"
          )}
          key={vitality}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {formatCurrency(vitality)}
        </motion.span>
        <span className="text-sm text-muted-foreground font-medium">
          {isDepleted ? "Depleted" : isLowVitality ? "Low Stamina" : "Safe to Spend"}
        </span>
        
        {/* Percentage indicator */}
        <span className="text-xs text-muted-foreground mt-1">
          {vitalityPercent.toFixed(0)}% remaining
        </span>
      </div>
      
      {/* Outer decorative ring */}
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius + strokeWidth / 2 + 4}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          className="opacity-50"
        />
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2 - 4}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          className="opacity-30"
        />
      </svg>
    </div>
  );
}
