import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { HouseholdViewProvider } from "@/contexts/HouseholdViewContext";
import { BehavioralTriggerProvider } from "@/contexts/BehavioralTriggerContext";
import { Dashboard } from "@/pages/Dashboard";
import { Budget } from "@/pages/Budget";
import { DebtSnowball } from "@/pages/DebtSnowball";
import { Transactions } from "@/pages/Transactions";
import { Reports } from "@/pages/Reports";
import { Achievements } from "@/pages/Achievements";
import FinancialTips from "@/pages/FinancialTips";
import DataManagement from "@/pages/DataManagement";
import AccountSettings from "@/pages/AccountSettings";
import { IncomeReport } from "@/pages/reports/IncomeReport";
import { AvailableForDebtReport } from "@/pages/reports/AvailableForDebtReport";
import { NetWorthReport } from "@/pages/reports/NetWorthReport";
import RootPage from "./pages/RootPage";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/internal/admin/AdminLogin";
import AdminWaitlist from "./pages/internal/admin/AdminWaitlist";
import AdminBetaCodes from "./pages/internal/admin/AdminBetaCodes";
import AdminHub from "./pages/internal/admin/AdminHub";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Legal from "./pages/Legal";
import HelpSupport from "./pages/HelpSupport";
import DataPrivacyFAQ from "./pages/DataPrivacyFAQ";
import IconStyleGuide from "./pages/internal/IconStyleGuide";
import ColorPaletteGuide from "./pages/internal/ColorPaletteGuide";
import ComingSoon from "./pages/internal/ComingSoon";
import Pricing from "./pages/Pricing";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import SubscriptionStatus from "./pages/SubscriptionStatus";
import { Household } from "./pages/Household";
import { AcceptInvite } from "./pages/AcceptInvite";
import { Subscriptions } from "./pages/Subscriptions";
import { Accounts } from "./pages/Accounts";
import { SubscriptionsReport } from "./pages/reports/SubscriptionsReport";
import Install from "./pages/Install";
import InstallPromptBanner from "./components/InstallPromptBanner";
import { OfflineBanner } from "./components/OfflineBanner";
import { UpdateAvailableBanner } from "./components/UpdateAvailableBanner";
import Journey from "./pages/Journey";
import SiteMap from "./pages/internal/SiteMap";
import Unavailable from "./pages/internal/Unavailable";
import Wealth from "./pages/Wealth";
import { BetaTesterBadge } from "./components/BetaTesterBadge";
import JoinBeta from "./pages/internal/JoinBeta";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
          <HouseholdViewProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <BehavioralTriggerProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RootPage />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/data-privacy" element={<DataPrivacyFAQ />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          <Route path="/install" element={<Install />} />

          {/* Internal / dev / pre-launch pages (not part of the normal user flow) */}
          <Route path="/internal/style-guide/icons" element={<IconStyleGuide />} />
          <Route path="/internal/style-guide/colors" element={<ColorPaletteGuide />} />
          <Route path="/internal/sitemap" element={<SiteMap />} />
          <Route path="/internal/unavailable" element={<Unavailable />} />
          <Route path="/internal/join-beta" element={<JoinBeta />} />
          <Route path="/internal/coming-soon" element={<ComingSoon />} />

          {/* Legacy redirects */}
          <Route path="/style-guide/icons" element={<Navigate to="/internal/style-guide/icons" replace />} />
          <Route path="/style-guide/colors" element={<Navigate to="/internal/style-guide/colors" replace />} />
          <Route path="/sitemap" element={<Navigate to="/internal/sitemap" replace />} />
          <Route path="/unavailable" element={<Navigate to="/internal/unavailable" replace />} />
          <Route path="/join" element={<Navigate to="/internal/join-beta" replace />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminHub />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/waitlist" element={<AdminWaitlist />} />
          <Route path="/admin/beta-codes" element={<AdminBetaCodes />} />
          
          {/* Protected routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/journey" element={<Journey />} />
                <Route path="/budgets" element={<Budget />} />
                <Route path="/debts" element={<DebtSnowball />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/learn" element={<FinancialTips />} />
                <Route path="/data" element={<DataManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/income" element={<IncomeReport />} />
                <Route path="/reports/expenses" element={<Reports />} />
                <Route path="/reports/available" element={<AvailableForDebtReport />} />
                <Route path="/reports/net-worth" element={<NetWorthReport />} />
                <Route path="/reports/subscriptions" element={<SubscriptionsReport />} />
                <Route path="/household" element={<Household />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/wealth" element={<Wealth />} />
                <Route path="/account" element={<AccountSettings />} />
                <Route path="/subscription" element={<SubscriptionStatus />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
          </Routes>
            <OfflineBanner />
            <UpdateAvailableBanner />
            <InstallPromptBanner />
            <BetaTesterBadge />
            <ChatbotWidget />
            </BehavioralTriggerProvider>
          </BrowserRouter>
          </HouseholdViewProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
