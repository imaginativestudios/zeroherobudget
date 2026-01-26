import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const { isOffline } = useOnlineStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>You're offline · Changes saved locally</span>
      </div>
    </div>
  );
}
