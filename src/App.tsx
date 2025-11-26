
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DemoDataInitializer } from "@/components/DemoDataInitializer";
import { Dashboard } from "@/pages/Dashboard";
import { Budget } from "@/pages/Budget";
import { DebtSnowball } from "@/pages/DebtSnowball";
import { Transactions } from "@/pages/Transactions";
import { Subscriptions } from "@/pages/Subscriptions";
import { Reports } from "@/pages/Reports";
import { Household } from "@/pages/Household";
import { AcceptInvite } from "@/pages/AcceptInvite";
import { IncomeReport } from "@/pages/reports/IncomeReport";
import { AvailableForDebtReport } from "@/pages/reports/AvailableForDebtReport";
import { NetWorthReport } from "@/pages/reports/NetWorthReport";
import { SubscriptionsReport } from "@/pages/reports/SubscriptionsReport";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoDataInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          
          {/* Protected routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/household" element={<Household />} />
                <Route path="/budgets" element={<Budget />} />
                <Route path="/debts" element={<DebtSnowball />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
