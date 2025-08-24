
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect to auth if not authenticated
  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default Index;
