import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Crown, LogOut, DollarSign, TrendingUp, Shield } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();

  // Redirect to auth if not authenticated
  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-royal rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-royal">Zero Hero</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8 shadow-royal">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Your Financial Command Center</CardTitle>
            <CardDescription className="text-lg">
              Take control of your finances and build wealth with confidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Track Spending</h3>
                <p className="text-sm text-muted-foreground">Monitor your expenses and stay within budget</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Build Wealth</h3>
                <p className="text-sm text-muted-foreground">Grow your investments and net worth over time</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Stay Secure</h3>
                <p className="text-sm text-muted-foreground">Your financial data is protected and encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Ready to start your financial journey? Explore the features in the sidebar.
          </p>
          <p className="text-sm text-muted-foreground">
            Soon you'll be able to connect your bank accounts for real-time financial tracking!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
