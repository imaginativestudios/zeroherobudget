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
// HeroTipsFeed removed - consolidated into simpler dashboard
import { DebtItem } from '@/lib/debtCalculations';
import { calculateMoatHealth } from '@/lib/moatCalculations';
import { useHeroProfile } from '@/hooks/useHeroProfile';
import { useMoatStatus } from '@/hooks/useMoatStatus';
import { useDashboardState } from '@/hooks/useDashboardState';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { GettingStartedChecklist } from "@/components/dashboard/GettingStartedChecklist";
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
  const { isTrialing, trialEnd, interval } = useSubscriptionStatus();

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
  const greetingName = userProfile?.first_name || userProfile?.display_name || 'hero';

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
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Welcome + Consistency */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome, {greetingName}
            </h1>
            <p className="text-muted-foreground">
              Your financial journey continues. Stay focused on the path ahead.
            </p>
          </div>
          
          {/* Right: Next Target */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Next Target</p>
              <p className="text-lg font-semibold text-primary">
                {dashboardState.currentBoss 
                  ? `Pay off ${dashboardState.currentBoss.name}` 
                  : 'Build your emergency fund'}
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

      {/* Getting Started Checklist - Progressive onboarding */}
      <GettingStartedChecklist
        income={income || 0}
        expenses={expenses}
        debts={debts}
        transactions={transactions}
        moatCurrent={heroProfile.moat_current || 0}
      />

      {/* Unified Status Banner - Single priority slot */}
      <StatusBanner
        isTrialing={isTrialing}
        trialEnd={trialEnd}
        interval={interval}
        isRegrouping={isRegrouping}
        isVulnerable={isVulnerable}
        bannerDismissed={bannerDismissed}
      />

      {/* ========================================= */}
      {/* 3-ZONE LAYOUT: Defense + Offense         */}
      {/* ========================================= */}
      {(dashboardState.canShowMoatBuilder || dashboardState.canShowBoss) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "grid gap-6 items-stretch",
            dashboardState.canShowMoatBuilder && dashboardState.canShowBoss 
              ? "grid-cols-1 lg:grid-cols-2" 
              : "grid-cols-1"
          )}
        >
          {/* THE SANCTUARY (Defense) - Left Column */}
          {dashboardState.canShowMoatBuilder && (
            <div className="flex flex-col h-full">
              <MoatBuilder 
                variant="full" 
                showPrimaryQuestBadge={moatHealth.isPrimaryQuest} 
              />
            </div>
          )}

          {/* THE BOSS (Offense) - Right Column */}
          {dashboardState.canShowBoss && dashboardState.currentBoss && (
            <div className="flex flex-col">
              <BossCard
                debt={dashboardState.currentBoss}
                strategy={dashboardState.strategy}
                extraBudget={leftover}
                allDebts={debts}
              />
            </div>
          )}
        </motion.div>
      )}

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
      {dashboardState.canShowFinancialOverview && (
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
          <div 
            className={cn(
              "grid gap-6 items-stretch",
              dashboardState.visibleFinancialCardCount === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
              dashboardState.visibleFinancialCardCount === 3 && "grid-cols-1 sm:grid-cols-3",
              dashboardState.visibleFinancialCardCount === 2 && "grid-cols-1 sm:grid-cols-2",
              dashboardState.visibleFinancialCardCount === 1 && "grid-cols-1 max-w-md"
            )} 
            data-tour="financial-overview"
          >
          {isCriticalLoading ? (
            <>
              <FinancialCardSkeleton />
              <FinancialCardSkeleton />
              <FinancialCardSkeleton />
              <FinancialCardSkeleton />
            </>
          ) : (
            <>
              {dashboardState.canShowIncomeCard && (
                <FinancialCard
                  title="Monthly Income"
                  amount={income}
                  icon={DollarSign}
                  trend="up"
                  to="/reports/income"
                  previousAmount={insightData.previousIncome}
                  insight={insights.income}
                />
              )}
              {dashboardState.canShowExpenseCard && (
                <FinancialCard
                  title="Planned Expenses"
                  amount={totalExpenses}
                  icon={TrendingUp}
                  trend="neutral"
                  to="/reports/expenses"
                  previousAmount={insightData.previousExpenses}
                  insight={insights.expenses}
                />
              )}
              {dashboardState.canShowAvailableCard && (
                <FinancialCard
                  title="Available for Debt"
                  amount={leftover}
                  icon={Target}
                  trend="up"
                  to="/reports/available"
                  previousAmount={insightData.previousAvailableForDebt}
                  insight={insights.availableForDebt}
                />
              )}
              {dashboardState.canShowNetWorthCard && (
                <FinancialCard
                  title="Net Worth"
                  amount={netWorth}
                  icon={AlertTriangle}
                  trend={netWorth >= 0 ? "up" : "down"}
                  to="/reports/net-worth"
                  previousAmount={insightData.previousNetWorth}
                  insight={insights.netWorth}
                />
              )}
            </>
          )}
          </div>
        </motion.div>
      )}

      {/* Insights & Analytics Section - Tabbed Interface */}
      {(dashboardState.canShowAnalytics || dashboardState.canShowAchievements) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1"></div>
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
              Insights & Progress
            </h2>
            <div className="h-px bg-border flex-1"></div>
          </div>

          <Tabs defaultValue={dashboardState.canShowAnalytics ? "analytics" : "achievements"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="analytics" className="gap-2" disabled={!dashboardState.canShowAnalytics}>
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2" disabled={!dashboardState.canShowAchievements}>
                <Trophy className="h-4 w-4" />
                Victories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {isSecondaryLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                  <ChartCardSkeleton />
                  <ChartCardSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 items-stretch">
                  {/* Financial Stamina Wheel */}
                  {dashboardState.canShowStaminaWheel && (
                    <Card className="overflow-hidden h-full shadow-royal hover-lift">
                      <CardHeader className="p-6">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Heart className="h-5 w-5 text-success" aria-hidden="true" />
                          Financial Stamina
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 flex flex-col items-center">
                        <StaminaWheel
                          incomeTotal={surplusPower.totalIncome}
                          fixedExpenses={surplusPower.survivalExpenses}
                          debtPayments={surplusPower.debtMinimums}
                          currentSpend={currentMonthSpend}
                          size={320}
                        />
                        <div className="mt-4 w-full">
                          <ChartInsight 
                            insight={surplusPower.heroMessage} 
                            type={surplusPower.isPositive ? "success" : "warning"} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Spending by Category Chart */}
                  {dashboardState.canShowSpendingChart && (
                    <Card className="overflow-hidden h-full shadow-royal hover-lift">
                      <CardHeader className="p-6">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                          Spending by Category
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        {hasAnyTransactions ? (
                          <>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
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
                            {spendingInsight && (
                              <div className="mt-4">
                                <ChartInsight insight={spendingInsight} type="info" />
                              </div>
                            )}
                          </>
                        ) : (
                          <EmptyChartNotice />
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Debt Payoff Projection - Full Width */}
                  {dashboardState.canShowDebtProjection && (
                    <Card className={cn(
                      "overflow-hidden h-full shadow-royal hover-lift",
                      dashboardState.canShowStaminaWheel && dashboardState.canShowSpendingChart && "xl:col-span-2"
                    )}>
                      <CardHeader className="p-6">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-primary" />
                          Debt Payoff Projection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        {schedule.timeline.length > 0 ? (
                          <>
                            <CustomLineLegend items={[{ label: "Total Balance", color: "hsl(var(--primary))" }]} />
                            <div className="h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={schedule.timeline} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
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
                                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2 }}
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
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="shadow-royal hover-lift">
                <CardHeader className="p-6">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Your Progress Milestones
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {unlockedCount} / {totalCount} Unlocked
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {achievements.map(achievement => (
                        <AchievementCard key={achievement.id} achievement={achievement} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Start tracking debts to unlock achievements!
                    </p>
                  )}
                  <div className="mt-6">
                    <Link to="/achievements">
                      <Button variant="outline" className="w-full rounded-xl">
                        <Trophy className="h-4 w-4 mr-2" />
                        View All Achievements
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

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
