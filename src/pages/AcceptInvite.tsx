
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMockHouseholds as useHouseholds } from '@/hooks/useMockHouseholds';
import { useAuth } from '@/hooks/useAuth';

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const { acceptInvitation } = useHouseholds();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    if (authLoading) return;

    if (!user) {
      // User needs to sign in first
      setStatus('error');
      setMessage('Please sign in to accept this invitation');
      return;
    }

    // Auto-accept the invitation when the component loads
    handleAcceptInvitation();
  }, [token, user, authLoading]);

  const handleAcceptInvitation = async () => {
    if (!token) return;

    setIsAccepting(true);
    const result = await acceptInvitation(token);
    
    if (result.error) {
      setStatus('error');
      setMessage(result.error as string);
    } else {
      setStatus('success');
      setMessage('Successfully joined the household!');
    }
    setIsAccepting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Users className="h-5 w-5" />
            Household Invitation
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your invitation...'}
            {status === 'success' && 'Welcome to the household!'}
            {status === 'error' && 'Invitation could not be processed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
          
          {status === 'success' && (
            <div className="space-y-2">
              <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                <CheckCircle className="h-3 w-3" />
                Invitation Accepted
              </Badge>
              <Button asChild className="w-full">
                <a href="/household">
                  Go to Household
                </a>
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <a href="/household">
                  Go to Household Page
                </a>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <a href="/auth">
                  Sign In
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
