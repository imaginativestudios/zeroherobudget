import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Building2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ConsentScreen } from '@/components/linked-accounts/ConsentScreen';
import { LinkedAccountsList } from '@/components/linked-accounts/LinkedAccountsList';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import {
  searchInstitutions,
  exchangeToken,
  type MockInstitution,
  type LinkedAccountMeta,
} from '@/lib/mockBankProvider';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Step = 'list' | 'consent' | 'search' | 'connecting' | 'success' | 'error';

const STEPS: { key: Step; label: string }[] = [
  { key: 'consent', label: 'Privacy' },
  { key: 'search', label: 'Select Bank' },
  { key: 'connecting', label: 'Connecting' },
  { key: 'success', label: 'Done' },
];

const CONNECTION_TIMEOUT_MS = 15_000;

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const activeIndex = STEPS.findIndex((s) => s.key === currentStep);
  if (activeIndex === -1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mb-2" role="navigation" aria-label="Linking progress">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              i < activeIndex && 'bg-primary/15 text-primary',
              i === activeIndex && 'bg-primary text-primary-foreground',
              i > activeIndex && 'bg-muted text-muted-foreground'
            )}
          >
            <span className="tabular-nums">{i + 1}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('w-4 h-px', i < activeIndex ? 'bg-primary/40' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function LinkBank() {
  const navigate = useNavigate();
  const { addAccounts } = useLinkedAccounts();
  const [step, setStep] = useState<Step>('list');
  const [query, setQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<MockInstitution | null>(null);
  const [newlyLinked, setNewlyLinked] = useState<LinkedAccountMeta[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredInstitutions = searchInstitutions(query);

  const clearConnectionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSelectInstitution = async (institution: MockInstitution) => {
    setSelectedInstitution(institution);
    setStep('connecting');

    // Start a 15s timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject(new Error('CONNECTION_TIMEOUT'));
      }, CONNECTION_TIMEOUT_MS);
    });

    try {
      const accounts = await Promise.race([exchangeToken(institution.id), timeoutPromise]);
      clearConnectionTimeout();
      const result = await addAccounts(accounts);
      setNewlyLinked(accounts);
      setStep('success');

      if (result.skipped > 0) {
        toast({
          title: 'Some accounts already linked',
          description: `${result.skipped} account${result.skipped > 1 ? 's were' : ' was'} already connected and skipped.`,
        });
      }
    } catch (err) {
      clearConnectionTimeout();
      const isTimeout = err instanceof Error && err.message === 'CONNECTION_TIMEOUT';
      setErrorMessage(
        isTimeout
          ? `The connection to ${institution.name} is taking too long. Please check your internet connection and try again.`
          : `We couldn't connect to ${institution.name}. This can happen if the bank's systems are temporarily unavailable. Please try again.`
      );
      setStep('error');
    }
  };

  const handleStartLinking = () => setStep('consent');

  const reset = () => {
    clearConnectionTimeout();
    setStep('list');
    setQuery('');
    setSelectedInstitution(null);
    setNewlyLinked([]);
    setErrorMessage('');
  };

  const showStepIndicator = step !== 'list' && step !== 'error';

  return (
    <div className="pt-8 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => step === 'list' ? navigate(-1) : reset()} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Link Bank Account</h1>
          <p className="text-sm text-muted-foreground">Securely connect your checking or savings account</p>
        </div>
      </div>

      {/* Step Indicator */}
      {showStepIndicator && <StepIndicator currentStep={step} />}

      {/* Step: List existing linked accounts */}
      {step === 'list' && (
        <LinkedAccountsList onLinkNew={handleStartLinking} />
      )}

      {/* Step: Consent */}
      {step === 'consent' && (
        <ConsentScreen
          onConsent={() => setStep('search')}
          onCancel={reset}
        />
      )}

      {/* Step: Institution search */}
      {step === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for your bank…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 min-h-[44px]"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            {filteredInstitutions.map((inst) => (
              <button
                key={inst.id}
                onClick={() => handleSelectInstitution(inst)}
                aria-label={`Link ${inst.name} bank account`}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border border-border/50',
                  'hover:bg-accent/50 transition-colors text-left cursor-pointer'
                )}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{inst.name}</span>
              </button>
            ))}
            {filteredInstitutions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No institutions found for "{query}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step: Connecting */}
      {step === 'connecting' && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium text-foreground">
              Connecting to {selectedInstitution?.name}…
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Securely authenticating with your bank. This may take a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-950/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Account Linked!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {newlyLinked.length} account{newlyLinked.length > 1 ? 's' : ''} from {selectedInstitution?.name} connected.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-2">
              {newlyLinked.map((acc) => (
                <div key={acc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                  <Building2 className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{acc.maskedAccountName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{acc.accountType}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={reset} className="min-h-[44px]">
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Connection Failed</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">{errorMessage}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={() => selectedInstitution && handleSelectInstitution(selectedInstitution)} className="min-h-[44px]">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
