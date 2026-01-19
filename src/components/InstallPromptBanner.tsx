import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";
import { Link } from "react-router-dom";

const InstallPromptBanner = () => {
  const { isInstallable, isInstalled, promptInstall, showIOSInstructions } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner after a short delay if installable or iOS
    const timer = setTimeout(() => {
      if ((isInstallable || showIOSInstructions) && !isInstalled) {
        setShowBanner(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, showIOSInstructions]);

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setShowBanner(false);
    }
  };

  if (!showBanner || isDismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-primary to-primary-dark shadow-lg border-t border-white/10 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">Install Zero Hero</p>
            <p className="text-xs text-white/80 truncate">Get the full app experience</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {isInstallable ? (
            <Button 
              size="sm" 
              onClick={handleInstall}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              Install
            </Button>
          ) : showIOSInstructions ? (
            <Link to="/install">
              <Button 
                size="sm" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                How to Install
              </Button>
            </Link>
          ) : null}
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleDismiss}
            className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
