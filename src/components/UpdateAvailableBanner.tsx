import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

export function UpdateAvailableBanner() {
  const { needRefresh, updateServiceWorker, dismissUpdate } = useServiceWorkerUpdate();

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-[51] p-4 bg-gradient-to-r from-primary to-primary-dark shadow-lg border-t border-white/10 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">New version available</p>
            <p className="text-xs text-white/80 truncate">Refresh to get the latest features</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={updateServiceWorker}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
          >
            Refresh Now
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={dismissUpdate}
            className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
