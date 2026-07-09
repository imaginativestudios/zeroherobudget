import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Ticket, Users, Shield, ArrowRight } from 'lucide-react';

const tools = [
  {
    to: '/admin/waitlist',
    title: 'Waitlist',
    description: 'Review signups, growth stats, and export the list.',
    icon: Users,
  },
  {
    to: '/admin/beta-codes',
    title: 'Beta Invite Codes',
    description: 'Generate, share, and deactivate beta access codes.',
    icon: Ticket,
  },
];

const AdminHub = () => {
  const { isAdmin, loading, signOut, user } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login', { replace: true });
  }, [isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Admin tools</h2>
          <p className="text-muted-foreground mt-1">
            Choose where to go.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.to} to={tool.to} className="group">
                <Card className="h-full bg-white dark:bg-card transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminHub;
