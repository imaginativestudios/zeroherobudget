import { Rocket, Home, DollarSign, Target, TrendingDown, Receipt, CreditCard, Users, Menu, X, LogOut, Trophy, Compass, Lightbulb, Building2 } from "lucide-react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DemoDataButton } from "./DemoDataButton";
import { Logo } from "./Logo";
import { OnboardingTour } from "./OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

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
  { name: "Bank Connections", href: "/bank-connections", icon: Building2 },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Financial Tips", href: "/learn", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: TrendingDown },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { signOut, user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resetTour } = useOnboardingTour();

  // Removed auth-gating for prototype mode

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-royal shadow-royal border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Zero Hero home">
            <Logo className="h-6 sm:h-7 w-auto" />
            <span className="sr-only">Zero Hero</span>
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
        <nav className="bg-gradient-royal shadow-royal border-r border-sidebar-border h-full" role="navigation" aria-label="Primary navigation">
          <div className="p-4 lg:p-6">
            {/* Desktop Header */}
            <Link to="/dashboard" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity" aria-label="Zero Hero home">
              <Logo className="h-8 w-auto" />
              <span className="sr-only">Zero Hero</span>
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
                  <DemoDataButton />
                  <Button
                    onClick={resetTour}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Compass className="h-4 w-4" />
                    Take a Tour
                  </Button>
                </div>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
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
      <OnboardingTour />
    </div>
  );
};
