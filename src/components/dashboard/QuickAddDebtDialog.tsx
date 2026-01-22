import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { SaveButton } from '@/components/ui/save-button';
import { CreditCard, Landmark, ArrowRight } from 'lucide-react';
import { useLocalDebts } from '@/hooks/useLocalDebts';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAddDebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDebtAdded?: () => void;
}

type DebtType = 'card' | 'loan';

export function QuickAddDebtDialog({ open, onOpenChange, onDebtAdded }: QuickAddDebtDialogProps) {
  const { addDebt } = useLocalDebts('critical');
  
  const [name, setName] = useState('');
  const [type, setType] = useState<DebtType>('card');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setType('card');
    setBalance('');
    setInterestRate('');
    setMinimumPayment('');
    setErrors({});
    setSaveState('idle');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Debt name is required';
    }
    
    const balanceNum = parseFloat(balance);
    if (!balance || isNaN(balanceNum) || balanceNum <= 0) {
      newErrors.balance = 'Enter a valid balance greater than $0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSaveState('saving');
    
    try {
      addDebt({
        name: name.trim(),
        type,
        balance: parseFloat(balance) || 0,
        interest_rate: parseFloat(interestRate) || 0,
        minimum_payment: parseFloat(minimumPayment) || 0,
      });
      
      setSaveState('saved');
      toast.success(`${name} added to your debts`);
      
      setTimeout(() => {
        onDebtAdded?.();
        onOpenChange(false);
        resetForm();
      }, 500);
    } catch (error) {
      setSaveState('idle');
      toast.error('Failed to add debt');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Debt</DialogTitle>
          <DialogDescription>
            Quickly add a debt to track. You can edit details later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Debt Name */}
          <div className="space-y-2">
            <Label htmlFor="debt-name">Debt Name</Label>
            <Input
              id="debt-name"
              placeholder="Credit Card, Car Loan, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          {/* Debt Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'card' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 gap-2",
                  type === 'card' && "bg-primary"
                )}
                onClick={() => setType('card')}
              >
                <CreditCard className="h-4 w-4" />
                Credit Card
              </Button>
              <Button
                type="button"
                variant={type === 'loan' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 gap-2",
                  type === 'loan' && "bg-primary"
                )}
                onClick={() => setType('loan')}
              >
                <Landmark className="h-4 w-4" />
                Loan
              </Button>
            </div>
          </div>
          
          {/* Current Balance */}
          <div className="space-y-2">
            <Label htmlFor="debt-balance">Current Balance</Label>
            <CurrencyInput
              id="debt-balance"
              prefix="$"
              placeholder="5000"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              variant="debt"
              aria-describedby={errors.balance ? 'balance-error' : undefined}
            />
            {errors.balance && (
              <p id="balance-error" className="text-sm text-destructive">{errors.balance}</p>
            )}
          </div>
          
          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="debt-apr">Interest Rate (APR)</Label>
            <CurrencyInput
              id="debt-apr"
              suffix="%"
              placeholder="22.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              variant="debt"
            />
          </div>
          
          {/* Minimum Payment */}
          <div className="space-y-2">
            <Label htmlFor="debt-min-payment">Minimum Payment</Label>
            <CurrencyInput
              id="debt-min-payment"
              prefix="$"
              placeholder="150"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(e.target.value)}
              variant="debt"
            />
          </div>
          
          {/* Submit Button */}
          <SaveButton
            type="submit"
            state={saveState}
            className="w-full"
            defaultText="Add Debt"
            savingText="Adding..."
            savedText="Debt Added!"
          />
          
          {/* Link to full page */}
          <p className="text-center text-sm text-muted-foreground">
            Need more options?{' '}
            <Link 
              to="/debts" 
              className="text-primary hover:underline inline-flex items-center gap-1"
              onClick={() => onOpenChange(false)}
            >
              Go to Debt Strategy <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
