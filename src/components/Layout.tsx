import { Crown, Home, DollarSign, Target, TrendingDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        <div className="w-64 fixed h-full">
          <nav className="bg-gradient-royal shadow-royal border-r border-sidebar-border h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <Crown className="h-8 w-8 text-accent" />
                <h1 className="text-xl font-bold text-sidebar-foreground">
                  Budget & Debt
                </h1>
              </div>
              
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-royal",
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
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};