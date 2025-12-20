
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DemoDataInitializer } from "@/components/DemoDataInitializer";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { OnboardingTourProvider } from "@/contexts/OnboardingTourContext";
import { Dashboard } from "@/pages/Dashboard";
import { Budget } from "@/pages/Budget";
import { DebtSnowball } from "@/pages/DebtSnowball";
import { Transactions } from "@/pages/Transactions";
import { Subscriptions } from "@/pages/Subscriptions";
import { Reports } from "@/pages/Reports";
import { Household } from "@/pages/Household";
import { Achievements } from "@/pages/Achievements";
import { AcceptInvite } from "@/pages/AcceptInvite";
import FinancialTips from "@/pages/FinancialTips";
import DataManagement from "@/pages/DataManagement";
import { IncomeReport } from "@/pages/reports/IncomeReport";
import { AvailableForDebtReport } from "@/pages/reports/AvailableForDebtReport";
import { NetWorthReport } from "@/pages/reports/NetWorthReport";
import { SubscriptionsReport } from "@/pages/reports/SubscriptionsReport";
import ComingSoon from "./pages/ComingSoon";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminWaitlist from "./pages/AdminWaitlist";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpSupport from "./pages/HelpSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OnboardingTourProvider>
        <DemoDataInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<ComingSoon />} />
          <Route path="/demo" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/waitlist" element={<AdminWaitlist />} />
          
          {/* Protected routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/household" element={<Household />} />
                <Route path="/budgets" element={<Budget />} />
                <Route path="/debts" element={<DebtSnowball />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/learn" element={<FinancialTips />} />
                <Route path="/data" element={<DataManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/income" element={<IncomeReport />} />
                <Route path="/reports/expenses" element={<Reports />} />
                <Route path="/reports/available" element={<AvailableForDebtReport />} />
                <Route path="/reports/net-worth" element={<NetWorthReport />} />
                <Route path="/reports/subscriptions" element={<SubscriptionsReport />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <ChatbotWidget />
      </BrowserRouter>
      </OnboardingTourProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
