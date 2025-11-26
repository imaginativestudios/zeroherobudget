import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { setupDemoData, isDemoDataSetup } from '@/lib/demoData';

export function DemoDataInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && !isDemoDataSetup(user.id)) {
      setupDemoData(user.id);
    }
  }, [user]);

  return null;
}
