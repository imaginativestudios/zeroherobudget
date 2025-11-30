import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { useBankConnections } from '@/hooks/useBankConnections';
import confetti from 'canvas-confetti';

interface MockPlaidLinkModalProps {
  open: boolean;
  onClose: () => void;
}

const MOCK_BANKS = [
  { name: 'Chase', logo: '🏦', color: '#117ACA' },
  { name: 'Bank of America', logo: '🏛️', color: '#E31837' },
  { name: 'Wells Fargo', logo: '🏢', color: '#D71E28' },
  { name: 'Citibank', logo: '🏦', color: '#056DAE' },
  { name: 'Capital One', logo: '💳', color: '#004879' },
  { name: 'US Bank', logo: '🏦', color: '#0E4595' },
];

type Step = 'select_bank' | 'credentials' | 'select_accounts' | 'success';

export const MockPlaidLinkModal = ({ open, onClose }: MockPlaidLinkModalProps) => {
  const [step, setStep] = useState<Step>('select_bank');
  const [selectedBank, setSelectedBank] = useState<typeof MOCK_BANKS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['checking', 'savings']);
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectInstitution } = useBankConnections();

  const handleBankSelect = (bank: typeof MOCK_BANKS[0]) => {
    setSelectedBank(bank);
    setStep('credentials');
  };

  const handleCredentialsSubmit = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setStep('select_accounts');
    }, 1500);
  };

  const handleAccountToggle = (accountType: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountType)
        ? prev.filter(a => a !== accountType)
        : [...prev, accountType]
    );
  };

  const handleConnect = () => {
    if (!selectedBank) return;

    const accounts = selectedAccounts.map(type => ({
      name: `${selectedBank.name} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type === 'credit' ? 'credit_card' : type,
      balance: Math.random() * 10000 + 1000,
      isActive: true,
      mask: Math.floor(1000 + Math.random() * 9000).toString(),
      officialName: `${selectedBank.name} ${type.charAt(0).toUpperCase() + type.slice(1)} Account`,
      subtype: type,
    }));

    connectInstitution(selectedBank.name, selectedBank.logo, selectedBank.color, accounts);
    setStep('success');
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleClose = () => {
    setStep('select_bank');
    setSelectedBank(null);
    setSearchQuery('');
    setSelectedAccounts(['checking', 'savings']);
    onClose();
  };

  const filteredBanks = MOCK_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            {step === 'select_bank' && 'Select Your Bank'}
            {step === 'credentials' && `Connect to ${selectedBank?.name}`}
            {step === 'select_accounts' && 'Select Accounts'}
            {step === 'success' && 'Successfully Connected!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select_bank' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for your bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => handleBankSelect(bank)}
                  className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-accent transition-all"
                >
                  <span className="text-4xl">{bank.logo}</span>
                  <span className="text-sm font-medium text-center">{bank.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'credentials' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is a mock interface. In production, you'll enter your real credentials securely through Plaid.
            </p>
            <div className="space-y-3">
              <Input placeholder="Username" disabled />
              <Input type="password" placeholder="Password" disabled />
            </div>
            <Button 
              onClick={handleCredentialsSubmit} 
              className="w-full" 
              variant="royal"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        )}

        {step === 'select_accounts' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which accounts you'd like to connect
            </p>
            <div className="space-y-3">
              {['checking', 'savings', 'credit'].map((type) => (
                <div key={type} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id={type}
                    checked={selectedAccounts.includes(type)}
                    onCheckedChange={() => handleAccountToggle(type)}
                  />
                  <label
                    htmlFor={type}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} Account
                    <span className="block text-xs text-muted-foreground">
                      ****{Math.floor(1000 + Math.random() * 9000)}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleConnect} 
              className="w-full" 
              variant="royal"
              disabled={selectedAccounts.length === 0}
            >
              Connect {selectedAccounts.length} Account{selectedAccounts.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-scale-in" />
            <div>
              <h3 className="text-lg font-semibold">Connection Successful!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your {selectedBank?.name} accounts have been connected and will sync automatically.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full" variant="royal">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
