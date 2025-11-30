import { Button } from '@/components/ui/button';
import { Building2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PlaidLinkButtonProps {
  onSuccess: () => void;
  variant?: 'default' | 'royal' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  children?: React.ReactNode;
}

export const PlaidLinkButton = ({ 
  onSuccess, 
  variant = 'royal',
  size = 'default',
  children 
}: PlaidLinkButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Simulate API call to create link token
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 500);
  };

  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Building2 className="h-4 w-4" />
      )}
      {children || 'Connect Bank Account'}
    </Button>
  );
};
