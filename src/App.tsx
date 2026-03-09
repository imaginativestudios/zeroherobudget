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
import ComingSoon from "./pages/ComingSoon";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminWaitlist from "./pages/AdminWaitlist";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Legal from "./pages/Legal";
import HelpSupport from "./pages/HelpSupport";
import DataPrivacyFAQ from "./pages/DataPrivacyFAQ";
import IconStyleGuide from "./pages/IconStyleGuide";
import ColorPaletteGuide from "./pages/ColorPaletteGuide";
import Pricing from "./pages/Pricing";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import { Household } from "./pages/Household";
import { AcceptInvite } from "./pages/AcceptInvite";
import { Subscriptions } from "./pages/Subscriptions";
import { Accounts } from "./pages/Accounts";
import { SubscriptionsReport } from "./pages/reports/SubscriptionsReport";
import Install from "./pages/Install";
import InstallPromptBanner from "./components/InstallPromptBanner";
import { OfflineBanner } from "./components/OfflineBanner";
import { UpdateAvailableBanner } from "./components/UpdateAvailableBanner";
 Journey from "./pages/Journey";
import SiteMap from "./pages/SiteMap";
import Wealth from "./pages/Wealth";

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
          <Route path="/" element={<ComingSoon />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/data-privacy" element={<DataPrivacyFAQ />} />
          <Route path="/style-guide/icons" element={<IconStyleGuide />} />
          <Route path="/style-guide/colors" element={<ColorPaletteGuide />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          <Route path="/install" element={<Install />} />
          <Route path="/sitemap" element={<SiteMap />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/waitlist" element={<AdminWaitlist />} />
          
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
                <Route path="/settings/connector" element={<Connecto element={<ReleaseKit />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
          </Routes>
            <OfflineBanner />
            <UpdateAvailableBanner />
            <InstallPromptBanner />
            <ChatbotWidget />
            </BehavioralTriggerProvider>
          </BrowserRouter>
          </HouseholdViewProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
