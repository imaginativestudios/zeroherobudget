/**
 * Dynamic Dashboard with Progressive Disclosure
 * 
 * Uses useDashboardState hook for conditional rendering based on user data milestones.
 * Layout: 3-zone system with Moat (Defense), Boss (Offense), and Intel Feed.
 */

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Target, AlertTriangle, BarChart3, TrendingDown, CreditCard, Trophy, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { FinancialCard } from "@/components/FinancialCard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FinancialCardSkeleton } from "@/components/FinancialCardSkeleton";
import { ChartCardSkeleton } from "@/components/ChartCardSkeleton";
import { ChartInsight } from "@/components/ChartInsight";
import { OptimizeStrategyDialog } from "@/components/OptimizeStrategyDialog";
import { EmptyChartNotice } from "@/components/EmptyChartNotice";
import { AchievementCard } from "@/components/AchievementCard";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { DashboardEmptyState } from "@/components/DashboardEmptyState";
import { MoatBuilder } from "@/components/defense/MoatBuilder";
import { RegroupingBanner } from "@/components/defense/RegroupingBanner";
import { DebtVictoryModal } from "@/components/behavioral/DebtVictoryModal";
import { HeroTipsFeed } from "@/components/behavioral/HeroTipsFeed";
import { DebtItem } from '@/lib/debtCalculations';
import { calculateMoatHealth } from '@/lib/moatCalculations';
import { useHeroProfile } from '@/hooks/useHeroProfile';
import { useMoatStatus } from '@/hooks/useMoatStatus';
import { useDashboardState } from '@/hooks/useDashboardState';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIncome, useStrategy, useExpenses, useAssets } from "@/hooks/useLocalSettings";
import { useLocalDebts } from "@/hooks/useLocalDebts";
import { useLocalSubscriptions } from "@/hooks/useLocalSubscriptions";
import { useLocalTransactions } from "@/hooks/useLocalTransactions";
import { useProfile } from "@/hooks/useProfile";
import { useAchievements } from "@/hooks/useAchievements";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { formatCurrency } from "@/lib/constants";
import { generateFinancialInsights, getPreviousMonthData, type InsightData } from "@/lib/insights";
import { simulatePayoff } from "@/lib/debtCalculations";
import { showWelcomeToast, hasWelcomeBeenShown, markWelcomeAsShown } from "@/lib/welcomeToast";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { CustomPieLegend, CustomLineLegend } from "@/components/charts/CustomChartLegend";
import { CHART_COLORS, STANDARD_TOOLTIP_STYLE, currencyFormatter } from "@/lib/chartConfig";

// New dashboard components
import { InitializeMissionCard } from "@/components/dashboard/InitializeMissionCard";
import { BossCard } from "@/components/dashboard/BossCard";
import { IntelFeed } from "@/components/dashboard/IntelFeed";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { StaminaWheel } from "@/components/Sanctuary/StaminaWheel";
import { TrialCountdownBanner } from "@/components/dashboard/TrialCountdownBanner";
import { useBehavioralEngine } from "@/hooks/useBehavioralEngine";
import { format } from "date-fns";
import { getSurvivalCategories } from "@/lib/behavioralEngine";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [income] = useIncome();
  const [expenses, , isLoadingExpenses] = useExpenses();
  
  // Use the new dashboard state hook for progressive disclosure
  const dashboardState = useDashboardState();
  
  // Critical data loads first
  const { debts, isLoading: isLoadingDebts } = useLocalDebts('critical');
  const { getTotalMonthlySpend, isLoading: isLoadingSubscriptions } = useLocalSubscriptions('critical');
  
  const [strategy, setStrategy] = useStrategy();
  const [assets] = useAssets();
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [victoryDebtName, setVictoryDebtName] = useState('');
  const previousPaidOffRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  // Secondary data (transactions for charts) loads after
  const { transactions, isLoading: isLoadingTransactions } = useLocalTransactions('secondary');
  const { profile: userProfile } = useProfile();
  
  // Hero Profile for moat calculations
  const { profile: heroProfile } = useHeroProfile();
  
  // Moat status for regrouping detection
  const { isRegrouping, isVulnerable, bannerDismissed } = useMoatStatus();

  // Subscription status for trial countdown
  const { isTrialing, trialEnd, tierEmoji, tierName } = useSubscriptionStatus();

  // Behavioral Engine for Stamina Wheel
  const { surplusPower } = useBehavioralEngine();

  // Calculate current month's discretionary spending for Stamina Wheel
  const currentMonthSpend = useMemo(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const survivalCategories = getSurvivalCategories();
    
    return transactions
      .filter(t => 
        t.date.startsWith(currentMonth) && 
        t.flow === 'out' && 
        !survivalCategories.includes(t.category)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Critical data loading state (for main cards)
  const isCriticalLoading = isLoadingExpenses || isLoadingDebts || isLoadingSubscriptions;
  
  // Secondary data loading state (for charts)
  const isSecondaryLoading = isLoadingTransactions;
  
  // Calculate Moat health for Primary Quest logic
  const moatHealth = useMemo(() => 
    calculateMoatHealth(heroProfile.moat_current, heroProfile.moat_target),
    [heroProfile.moat_current, heroProfile.moat_target]
  );
  
  // Determine if dashboard should show regrouping theme
  const showRegroupingTheme = isRegrouping || isVulnerable;

  const hasAnyTransactions = useMemo(() => transactions.length > 0, [transactions]);

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, expense) => sum + (expense.planned || 0), 0), [expenses]
  );
  
  const leftover = useMemo(() => 
    Math.max(0, (income || 0) - totalExpenses), [income, totalExpenses]
  );
  
  const schedule = useMemo(() => 
    simulatePayoff(debts.map(d => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      min: d.minimum_payment,
      apr: d.interest_rate,
      type: d.type as 'card' | 'loan'
    })), leftover, strategy as "Snowball" | "Avalanche"), [debts, leftover, strategy]
  );

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const netWorth = totalAssets - totalDebt;
  const monthlySubscriptionSpend = getTotalMonthlySpend();

  // Prepare debt items for Freedom Timeline Widget
  const debtItems: DebtItem[] = useMemo(() => 
    debts.map(d => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      min: d.minimum_payment,
      apr: d.interest_rate,
      type: d.type as 'card' | 'loan'
    })), [debts]
  );

  // Calculate achievement stats
  const debtsPaidOff = useMemo(() => 
    debts.filter(d => d.balance === 0).length, [debts]
  );
  
  const { achievements, unlockedCount, totalCount } = useAchievements({
    totalDebt,
    debtsPaidOff,
    totalDebts: debts.length,
  });

  // Get greeting name
  const greetingName = userProfile?.first_name || userProfile?.display_name || 'there';

  // Auth for welcome toast
  const { user } = useAuth();
  const welcomeToastShownRef = useRef(false);

  // Debt Victory Observer - detect newly paid off debts
  useEffect(() => {
    const currentPaidOff = new Set(debts.filter(d => d.balance === 0).map(d => d.id));
    const newlyVanquished = [...currentPaidOff].find(id => !previousPaidOffRef.current.has(id));
    
    if (newlyVanquished && previousPaidOffRef.current.size > 0) {
      const debtName = debts.find(d => d.id === newlyVanquished)?.name || 'Debt';
      setVictoryDebtName(debtName);
      setVictoryModalOpen(true);
    }
    
    previousPaidOffRef.current = currentPaidOff;
  }, [debts]);

  // Welcome Toast for First-Time Users
  useEffect(() => {
    // Only show for authenticated users who haven't seen the welcome toast yet
    if (!user || welcomeToastShownRef.current || isCriticalLoading) return;
    
    // Check if this is a first-time user (no debts and no transactions)
    const isFirstTimeUser = debts.length === 0 && transactions.length === 0;
    
    if (isFirstTimeUser && !hasWelcomeBeenShown(user.id)) {
      // Small delay to let the page settle
      const timer = setTimeout(() => {
        const userName = user.user_metadata?.first_name || null;
        showWelcomeToast(userName, () => navigate('/debts'));
        markWelcomeAsShown(user.id);
        welcomeToastShownRef.current = true;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, debts.length, transactions.length, isCriticalLoading, navigate]);

  // Check if user is new (no meaningful data)
  const isNewUser = useMemo(() => {
    const hasNoIncome = !income || income === 0;
    const hasNoExpenses = totalExpenses === 0;
    const hasNoDebts = debts.length === 0;
    const hasNoTransactions = transactions.length === 0;
    
    return hasNoIncome && hasNoExpenses && hasNoDebts && hasNoTransactions;
  }, [income, totalExpenses, debts.length, transactions.length]);

  // Prepare spending by category data with insights
  const spendingByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const category = expense.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Find largest expense category for insights
  const largestExpenseCategory = useMemo(() => {
    if (spendingByCategory.length === 0) return undefined;
    
    const largest = spendingByCategory.reduce((max, category) => 
      category.value > max.value ? category : max
    );
    
    const percentage = totalExpenses > 0 ? (largest.value / totalExpenses) * 100 : 0;
    return { name: largest.name, amount: largest.value, percentage };
  }, [spendingByCategory, totalExpenses]);

  // Generate insights
  const insightData: InsightData = {
    income,
    expenses: totalExpenses,
    netWorth,
    subscriptions: monthlySubscriptionSpend,
    availableForDebt: leftover,
    totalDebt,
    totalTransactions: transactions.length,
    largestExpenseCategory,
    ...getPreviousMonthData({ income, expenses: totalExpenses, netWorth, subscriptions: monthlySubscriptionSpend, availableForDebt: leftover })
  };

  const insights = generateFinancialInsights(insightData);

  // Chart insights
  const spendingInsight = useMemo(() => {
    if (largestExpenseCategory && largestExpenseCategory.percentage > 50) {
      return `${largestExpenseCategory.name} represents over half of your spending. Consider if this allocation aligns with your priorities.`;
    }
    if (spendingByCategory.length > 8) {
      return "You have many spending categories. Consider consolidating to better track your major expenses.";
    }
    if (spendingByCategory.length === 0) {
      return "Start by adding expense categories to better understand your spending patterns.";
    }
    return "Your spending appears well-distributed across categories.";
  }, [largestExpenseCategory, spendingByCategory]);

  const debtInsight = useMemo(() => {
    if (debts.length === 0) return "Great job staying debt-free! Keep building your wealth.";
    if (leftover === 0) return "Find ways to increase available funds for faster debt payoff.";
    
    const highInterestDebt = debts.find(d => d.interest_rate > 20);
    if (highInterestDebt) {
      return `Focus on paying off ${highInterestDebt.name} first due to its high ${highInterestDebt.interest_rate}% interest rate.`;
    }
    
    return "You're making good progress on your debt payoff journey!";
  }, [debts, leftover]);

  // Prepare legend data for pie chart
  const pieLegendData = useMemo(() => 
    spendingByCategory.map((cat, index) => ({
      name: cat.name,
      value: cat.value,
      percentage: totalExpenses > 0 ? `${((cat.value / totalExpenses) * 100).toFixed(1)}%` : '0%',
      color: CHART_COLORS[index % CHART_COLORS.length]
    })), [spendingByCategory, totalExpenses]
  );

  // Show empty state for new users
  if (!isCriticalLoading && !isSecondaryLoading && isNewUser) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <DashboardEmptyState greetingName={greetingName} />
      </div>
    );
  }

  // Show Initialize Mission if user has completed onboarding but has no debts
  if (!dashboardState.isLoading && dashboardState.shouldShowInitializeMission) {
    return <InitializeMissionCard />;
  }

  return (
    <div className={cn("space-y-8 lg:space-y-10", showRegroupingTheme && "regrouping-theme")}>
      {/* ========================================= */}
      {/* HERO WELCOME SECTION - Command Center    */}
      {/* ========================================= */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 sm:p-8 rounded-2xl bg-card border shadow-royal"
        data-tour="welcome-area"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Welcome + Consistency */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome, traveler
            </h1>
            <p className="text-muted-foreground">
              Your quest continues. Stay focused on the path ahead.
            </p>
          </div>
          
          {/* Right: Next Objective */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Next Objective</p>
              <p className="text-lg font-semibold text-primary">
                {dashboardState.currentBoss 
                  ? `Clear the Shadow on ${dashboardState.currentBoss.name}` 
                  : 'Build your Sanctuary'}
              </p>
            </div>
            <HouseholdViewToggle />
            <Button 
              variant="default" 
              size="lg" 
              className="min-w-[140px] font-semibold rounded-xl"
              asChild
            >
              <Link to="/reports">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="text-sm sm:text-base">View Reports</span>
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Unified Status Banner - Single priority slot */}
      <StatusBanner
        isTrialing={isTrialing}
        trialEnd={trialEnd}
        tierEmoji={tierEmoji}
        tierName={tierName}
        isRegrouping={isRegrouping}
        isVulnerable={isVulnerable}
        bannerDismissed={bannerDismissed}
      />

      {/* Hero Tips Feed (Behavioral) */}
      <HeroTipsFeed />

      {/* ========================================= */}
      {/* 3-ZONE LAYOUT: Defense + Offense         */}
      {/* ========================================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {/* THE SANCTUARY (Defense) - Left Column */}
        <div className="lg:col-span-1 space-y-4">
          {moatHealth.isPrimaryQuest && (
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-warning/10 text-warning text-sm font-semibold rounded-full flex items-center gap-2">
                🌟 CURRENT QUEST
              </span>
            </div>
          )}
          <MoatBuilder 
            variant="full" 
            showPrimaryQuestBadge={moatHealth.isPrimaryQuest} 
          />
        </div>

        {/* THE BOSS (Offense) - Right Column */}
        <div className="lg:col-span-2">
          {dashboardState.currentBoss ? (
            <BossCard
              debt={dashboardState.currentBoss}
              strategy={dashboardState.strategy}
              extraBudget={leftover}
              allDebts={debts}
            />
          ) : (
            <Card variant="glass" className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <Target className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">All Debts Vanquished!</h3>
                <p className="text-muted-foreground">
                  Congratulations! You have no active debts. Focus on building your Moat.
                </p>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/debts">View Battle History</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </motion.div>

      {/* ========================================= */}
      {/* INTEL FEED - Progressive Behavioral Cards */}
      {/* ========================================= */}
      <IntelFeed
        canShowConsistencyXP={dashboardState.canShowConsistencyXP}
        canShowShadowBudget={dashboardState.canShowShadowBudget}
        canShowFreedom={dashboardState.canShowBoss}
        debts={debtItems}
        extraBudget={leftover}
        strategy={dashboardState.strategy}
      />

      {/* Debt Victory Modal */}
      <DebtVictoryModal
        open={victoryModalOpen}
        onOpenChange={setVictoryModalOpen}
        debtName={victoryDebtName}
        nextDebt={debts.filter(d => d.balance > 0)[0] ? { name: debts.filter(d => d.balance > 0)[0].name, balance: debts.filter(d => d.balance > 0)[0].balance } : null}
        onViewBattlePlan={() => { setVictoryModalOpen(false); navigate('/debts'); }}
      />

      {/* Financial Overview Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-px bg-border flex-1"></div>
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Financial Overview</h2>
          <div className="h-px bg-border flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch" data-tour="financial-overview">
        {isCriticalLoading ? (
          <>
            <FinancialCardSkeleton />
            <FinancialCardSkeleton />
            <FinancialCardSkeleton />
            <FinancialCardSkeleton />
            <FinancialCardSkeleton />
          </>
        ) : (
          <>
            <FinancialCard
              title="Monthly Income"
              amount={income}
              icon={DollarSign}
              trend="up"
              to="/reports/income"
              previousAmount={insightData.previousIncome}
              insight={insights.income}
            />
            <FinancialCard
              title="Planned Expenses"
              amount={totalExpenses}
              icon={TrendingUp}
              trend="neutral"
              to="/reports/expenses"
              previousAmount={insightData.previousExpenses}
              insight={insights.expenses}
            />
            <FinancialCard
              title="Subscriptions"
              amount={monthlySubscriptionSpend}
              icon={CreditCard}
              trend="neutral"
              to="/subscriptions"
              previousAmount={insightData.previousSubscriptions}
              insight={insights.subscriptions}
            />
            <FinancialCard
              title="Available for Debt"
              amount={leftover}
              icon={Target}
              trend="up"
              to="/reports/available"
              previousAmount={insightData.previousAvailableForDebt}
              insight={insights.availableForDebt}
            />
            <FinancialCard
              title="Net Worth"
              amount={netWorth}
              icon={AlertTriangle}
              trend={netWorth >= 0 ? "up" : "down"}
              to="/reports/net-worth"
              previousAmount={insightData.previousNetWorth}
              insight={insights.netWorth}
            />
          </>
        )}
        </div>
      </motion.div>

      {/* Analytics Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className={`h-px bg-border flex-1 transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse opacity-70' : ''}`}></div>
          <h2 className={`text-sm font-semibold text-muted-foreground tracking-wide uppercase transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse' : ''}`}>
            Analytics {isSecondaryLoading && <span className="text-xs ml-2 opacity-70">Loading...</span>}
          </h2>
          <div className={`h-px bg-border flex-1 transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse opacity-70' : ''}`}></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {isSecondaryLoading ? (
          <>
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </>
        ) : (
          <>
        {/* Financial Stamina Wheel - HERO ELEMENT */}
        <Card className="overflow-hidden h-full animate-fade-in shadow-royal hover-lift">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-3">
              <Heart className="h-6 w-6 text-success" aria-hidden="true" />
              Financial Stamina
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0 flex flex-col items-center">
            <div>
              <StaminaWheel
                incomeTotal={surplusPower.totalIncome}
                fixedExpenses={surplusPower.survivalExpenses}
                debtPayments={surplusPower.debtMinimums}
                currentSpend={currentMonthSpend}
                size={360}
              />
            </div>
            <div className="mt-6 w-full">
              <ChartInsight 
                insight={surplusPower.heroMessage} 
                type={surplusPower.isPositive ? "success" : "warning"} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Spending by Category Chart */}
        <Card className="overflow-hidden h-full animate-fade-in shadow-royal hover-lift">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" aria-hidden="true" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0">
            {hasAnyTransactions ? (
              <>
                <div className="h-[350px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="pieGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
                        </linearGradient>
                        <linearGradient id="pieGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--accent))" />
                          <stop offset="100%" stopColor="hsl(var(--accent) / 0.8)" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={spendingByCategory}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="75%"
                        innerRadius="30%"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                        label={false}
                      >
                        {spendingByCategory.map((_, index) => (
                          <Cell 
                            key={index} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            className="drop-shadow-sm hover:brightness-110 transition-all duration-300"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={currencyFormatter}
                        contentStyle={STANDARD_TOOLTIP_STYLE}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <CustomPieLegend data={pieLegendData} />
              </>
            ) : (
              <EmptyChartNotice />
            )}
            
            {hasAnyTransactions && spendingInsight && (
              <div className="mt-4">
                <ChartInsight insight={spendingInsight} type="info" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debt Payoff Projection */}
        <Card className="overflow-hidden h-full animate-fade-in shadow-royal hover-lift">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-3">
              <TrendingDown className="h-6 w-6 text-primary" />
              Debt Payoff Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0">
            {hasAnyTransactions && schedule.timeline.length > 0 ? (
              <>
                <CustomLineLegend items={[{ label: "Total Balance", color: "hsl(var(--primary))" }]} />
                <div className="h-[350px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={schedule.timeline} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))" 
                        strokeOpacity={0.5}
                      />
                      <XAxis 
                        dataKey="label" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip 
                        formatter={currencyFormatter}
                        contentStyle={STANDARD_TOOLTIP_STYLE}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalBalance" 
                        name="Total Balance" 
                        strokeWidth={3} 
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        stroke="hsl(var(--primary))"
                        
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <ChartInsight insight={debtInsight} type="info" />
                </div>
              </>
            ) : (
              <EmptyChartNotice />
            )}
          </CardContent>
        </Card>
          </>
        )}
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className={`h-px bg-border flex-1 transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse opacity-70' : ''}`}></div>
          <h2 className={`text-sm font-semibold text-muted-foreground tracking-wide uppercase transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse' : ''}`}>
            Victories & Achievements
          </h2>
          <div className={`h-px bg-border flex-1 transition-all duration-300 ${isSecondaryLoading ? 'animate-pulse opacity-70' : ''}`}></div>
        </div>
        
        <Card className="animate-fade-in shadow-royal hover-lift">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              Your Progress Milestones
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {unlockedCount} / {totalCount} Unlocked
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0">
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {achievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Start tracking debts to unlock achievements!
              </p>
            )}
            <div className="mt-8">
              <Link to="/achievements">
                <Button variant="outline" className="w-full rounded-xl">
                  <Trophy className="h-4 w-4 mr-2" />
                  View All Achievements
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Debt Progress Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-px bg-border flex-1"></div>
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Debt Progress</h2>
          <div className="h-px bg-border flex-1"></div>
        </div>
        <Card className="shadow-royal hover-lift">
        <CardHeader className="p-6 sm:p-8">
          <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            Upcoming Payoffs ({strategy} Strategy)
          </CardTitle>
        </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0">
          {schedule.perDebt && schedule.perDebt.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {schedule.perDebt
                .filter(debt => debt.months !== null)
                .slice(0, 6)
                .map(debt => {
                  const progressPercentage = debt.orig 
                    ? ((debt.orig - debt.balance) / debt.orig) * 100 
                    : 0;
                  
                    return (
                    <div key={debt.id} className="border rounded-xl p-6 space-y-4 bg-muted/30 hover-lift">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground">{debt.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {debt.type === 'card' ? 'Credit Card' : 'Loan'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{debt.payoffLabel}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Remaining: {formatCurrency(debt.balance)} • 
                        Interest: {formatCurrency(debt.totalInterest)}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Add debts to see projected payoff dates.
            </p>
          )}
          
          {leftover > 0 && (
            <div className="mt-8 p-6 bg-muted/50 rounded-xl border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-100">Extra Payment Strategy</h4>
                  <p className="text-sm text-slate-400">
                    Applying {formatCurrency(leftover)} extra monthly using {strategy} method
                  </p>
                </div>
                <Button 
                  variant="default" 
                  className="w-full sm:w-auto rounded-xl"
                  onClick={() => setOptimizeDialogOpen(true)}
                >
                  Optimize Strategy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      <OptimizeStrategyDialog
        open={optimizeDialogOpen}
        onOpenChange={setOptimizeDialogOpen}
        debts={debts.map(d => ({
          id: d.id,
          name: d.name,
          balance: d.balance,
          min: d.minimum_payment,
          apr: d.interest_rate,
          type: d.type as 'card' | 'loan'
        }))}
        currentLeftover={leftover}
        currentStrategy={strategy}
        onStrategyUpdate={(newStrategy, extraPayment) => {
          setStrategy(newStrategy);
        }}
      />
    </div>
  );
};
