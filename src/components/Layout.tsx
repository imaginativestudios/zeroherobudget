import { Crown, Home, DollarSign, Target, TrendingDown, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Budgets", href: "/budgets", icon: DollarSign },
  { name: "Debts", href: "/debts", icon: Target },
  { name: "Reports", href: "/reports", icon: TrendingDown },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-royal shadow-royal border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
            <h1 className="text-lg sm:text-xl font-bold text-sidebar-foreground">
              Budget & Debt
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
      <div className={cn(
        "fixed h-full z-50 transform transition-transform duration-300 ease-in-out",
        "w-64 lg:w-64",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <nav className="bg-gradient-royal shadow-royal border-r border-sidebar-border h-full">
          <div className="p-4 lg:p-6">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <Crown className="h-8 w-8 text-accent" />
              <h1 className="text-xl font-bold text-sidebar-foreground">
                Budget & Debt
              </h1>
            </div>
            
            {/* Mobile padding for header */}
            <div className="lg:hidden mb-4 mt-16" />
            
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-royal text-sm lg:text-base",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elegant"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        "pt-16 lg:pt-0", // Mobile top padding for header
        "lg:ml-64", // Desktop left margin for sidebar
        "p-4 sm:p-6 lg:p-8"
      )}>
        {children}
      </main>
    </div>
  );
};