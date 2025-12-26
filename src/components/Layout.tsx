import { Rocket, Home, DollarSign, Target, TrendingDown, Receipt, CreditCard, Users, Menu, X, LogOut, Trophy, Compass, Lightbulb, Keyboard, Database, Shield } from "lucide-react";
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "./Logo";
import { OnboardingTour } from "./OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKeyboardShortcuts, ShortcutConfig } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { toast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Household", href: "/household", icon: Users },
  { name: "Budgets", href: "/budgets", icon: DollarSign },
  { name: "Debts", href: "/debts", icon: Target },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Data Management", href: "/data", icon: Database },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Financial Tips", href: "/learn", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: TrendingDown },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const { resetTour } = useOnboardingTour();

  // Removed auth-gating for prototype mode

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Define keyboard shortcuts with config for the help dialog
  const shortcutConfigs: ShortcutConfig[] = useMemo(() => [
    { key: "1", ctrl: true, description: "Go to Dashboard", category: "Navigation" },
    { key: "2", ctrl: true, description: "Go to Household", category: "Navigation" },
    { key: "3", ctrl: true, description: "Go to Budgets", category: "Navigation" },
    { key: "4", ctrl: true, description: "Go to Debts", category: "Navigation" },
    { key: "5", ctrl: true, description: "Go to Transactions", category: "Navigation" },
    { key: "6", ctrl: true, description: "Go to Subscriptions", category: "Navigation" },
    { key: "7", ctrl: true, description: "Go to Achievements", category: "Navigation" },
    { key: "8", ctrl: true, description: "Go to Financial Tips", category: "Navigation" },
    { key: "9", ctrl: true, description: "Go to Reports", category: "Navigation" },
    { key: "/", ctrl: true, description: "Show keyboard shortcuts", category: "Help" },
  ], []);

  // Define keyboard shortcuts with actions
  const shortcuts = useMemo(() => [
    {
      ...shortcutConfigs[0],
      action: () => {
        navigate("/dashboard");
        toast({ title: "Navigated to Dashboard" });
      },
    },
    {
      ...shortcutConfigs[1],
      action: () => {
        navigate("/household");
        toast({ title: "Navigated to Household" });
      },
    },
    {
      ...shortcutConfigs[2],
      action: () => {
        navigate("/budgets");
        toast({ title: "Navigated to Budgets" });
      },
    },
    {
      ...shortcutConfigs[3],
      action: () => {
        navigate("/debts");
        toast({ title: "Navigated to Debts" });
      },
    },
    {
      ...shortcutConfigs[4],
      action: () => {
        navigate("/transactions");
        toast({ title: "Navigated to Transactions" });
      },
    },
    {
      ...shortcutConfigs[5],
      action: () => {
        navigate("/subscriptions");
        toast({ title: "Navigated to Subscriptions" });
      },
    },
    {
      ...shortcutConfigs[6],
      action: () => {
        navigate("/achievements");
        toast({ title: "Navigated to Achievements" });
      },
    },
    {
      ...shortcutConfigs[7],
      action: () => {
        navigate("/learn");
        toast({ title: "Navigated to Financial Tips" });
      },
    },
    {
      ...shortcutConfigs[8],
      action: () => {
        navigate("/reports");
        toast({ title: "Navigated to Reports" });
      },
    },
    {
      ...shortcutConfigs[9],
      action: () => setShowShortcutsDialog(true),
    },
  ], [navigate, shortcutConfigs]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-semibold focus:shadow-royal focus:ring-2 focus:ring-ring-accent focus:ring-offset-2 focus:ring-offset-background focus:outline-none transition-all"
      >
        Skip to main content
      </a>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-royal shadow-royal border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Zero Hero home">
            <Logo className="h-6 sm:h-7 w-auto" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="text-sidebar-foreground hover:bg-sidebar-accent/50"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            data-tour="mobile-menu-button"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </Button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50" 
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed h-full z-50 transform transition-transform duration-300 ease-in-out",
          "w-64 lg:w-64",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        id="mobile-navigation"
        aria-label="Main navigation"
        data-tour="nav-sidebar"
      >
        <nav className="bg-gradient-royal shadow-royal border-r border-sidebar-border h-full flex flex-col" role="navigation" aria-label="Primary navigation">
          <ScrollArea className="flex-1">
            <div className="p-4 lg:p-6">
              {/* Desktop Header */}
              <Link to="/dashboard" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity" aria-label="Zero Hero home">
                <Logo className="h-8 w-auto" />
              </Link>
              
              {/* Mobile padding for header */}
              <div className="lg:hidden mb-4 mt-16" />
              
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  // Map href to data-tour attribute for navigation items
                  const tourId = item.href === '/budgets' ? 'nav-budgets'
                    : item.href === '/debts' ? 'nav-debts'
                    : item.href === '/transactions' ? 'nav-transactions'
                    : item.href === '/subscriptions' ? 'nav-subscriptions'
                    : item.href === '/achievements' ? 'nav-achievements'
                    : item.href === '/reports' ? 'nav-reports'
                    : undefined;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-royal text-sm lg:text-base min-w-0",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elegant"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                        aria-current={isActive ? "page" : undefined}
                        data-tour={tourId}
                      >
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                        <span className="font-medium truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* User section at bottom */}
              {user && (
                <div className="mt-8 pt-4 border-t border-sidebar-border space-y-3">
                  <div className="text-xs text-sidebar-foreground/70 mb-2 px-3">
                    Signed in as {user.email}
                  </div>
                  <div className="px-3 space-y-2">
                    <Button
                      onClick={resetTour}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Compass className="h-4 w-4" aria-hidden="true" />
                      Take a Tour
                    </Button>
                    <Button
                      onClick={() => setShowShortcutsDialog(true)}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Keyboard className="h-4 w-4" aria-hidden="true" />
                      Shortcuts
                    </Button>
                    <Link
                      to="/data-privacy"
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-md transition-colors"
                    >
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      Your Privacy
                    </Link>
                  </div>
                  <Button
                    onClick={signOut}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                  >
                    <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </nav>
      </div>

      {/* Main Content */}
      <main 
        id="main-content"
        className={cn(
          "transition-all duration-300 ease-in-out",
          "safe-header-pt", // ensures content is below fixed header on mobile/tablet
          "lg:ml-64", // Desktop left margin for sidebar
          "p-2 sm:p-4 lg:p-8"
        )}
        role="main"
      >
        {children}
      </main>
      
      {/* Onboarding Tour */}
      <OnboardingTour 
        setMobileMenuOpen={setIsMobileMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={setShowShortcutsDialog}
        shortcuts={shortcutConfigs}
      />
    </div>
  );
};
