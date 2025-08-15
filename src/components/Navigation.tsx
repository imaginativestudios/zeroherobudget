import { Crown, Home, DollarSign, Target, TrendingDown, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Debt Snowball", href: "/debt-snowball", icon: Target },
  { name: "Expenses", href: "/expenses", icon: TrendingDown },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-gradient-royal shadow-royal border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-8 w-8 text-accent" />
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Monarch Budget
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
  );
};