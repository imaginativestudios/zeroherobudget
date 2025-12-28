import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { OnboardingTourProvider } from "@/contexts/OnboardingTourContext";
import { BudgetTourProvider } from "@/contexts/BudgetTourContext";
import { Dashboard } from "@/pages/Dashboard";
import { Budget } from "@/pages/Budget";
import { DebtSnowball } from "@/pages/DebtSnowball";
import { Transactions } from "@/pages/Transactions";
import { Reports } from "@/pages/Reports";
import { Achievements } from "@/pages/Achievements";
import FinancialTips from "@/pages/FinancialTips";
import DataManagement from "@/pages/DataManagement";
import { IncomeReport } from "@/pages/reports/IncomeReport";
import { AvailableForDebtReport } from "@/pages/reports/AvailableForDebtReport";
import { NetWorthReport } from "@/pages/reports/NetWorthReport";
import ComingSoon from "./pages/ComingSoon";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminWaitlist from "./pages/AdminWaitlist";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpSupport from "./pages/HelpSupport";
import DataPrivacyFAQ from "./pages/DataPrivacyFAQ";
import IconStyleGuide from "./pages/IconStyleGuide";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OnboardingTourProvider>
        <BudgetTourProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/data-privacy" element={<DataPrivacyFAQ />} />
          <Route path="/style-guide/icons" element={<IconStyleGuide />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/waitlist" element={<AdminWaitlist />} />
          
          {/* Protected routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
        </BudgetTourProvider>
      </OnboardingTourProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
