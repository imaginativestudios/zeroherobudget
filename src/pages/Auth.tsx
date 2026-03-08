import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';

const Auth = () => {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If already authenticated, redirect to intended destination or dashboard
  useEffect(() => {
    if (user) {
      const returnTo = searchParams.get('returnTo') || '/dashboard';
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, searchParams]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthModal open={open} onOpenChange={handleOpenChange} defaultMode="login" />
    </div>
  );
};

export default Auth;
