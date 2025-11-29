import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, FileText } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary-dark">
        {/* Decorative blur elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo className="h-20 md:h-28 w-auto" />
        </div>

        {/* 404 Title */}
        <h1 className="text-8xl md:text-9xl font-bold text-white/20 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track to financial freedom!
        </p>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            size="lg" 
            variant="gold" 
            asChild 
            className="text-primary-dark"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            asChild
            className="border-2 border-white text-white hover:bg-white/20"
          >
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Additional helpful links */}
        <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
          <Link to="/budget" className="hover:text-white transition-colors flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Budget
          </Link>
          <Link to="/transactions" className="hover:text-white transition-colors flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Transactions
          </Link>
          <Link to="/reports" className="hover:text-white transition-colors flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Reports
          </Link>
          <Link to="/debt-snowball" className="hover:text-white transition-colors flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Debt Payoff
          </Link>
        </div>

        {/* Footer message */}
        <p className="mt-12 text-sm text-white/60">
          © 2026 Zero Hero. From balances due to a more balanced you.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
