import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/types/transactions';

interface AccountSelectorProps {
  label: string;
  accounts: Account[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

export function AccountSelector({ label, accounts, selectedId, onSelect }: AccountSelectorProps) {
  if (accounts.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground shrink-0">{label}:</label>
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="h-8 text-xs w-auto min-w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {accounts.map(a => (
            <SelectItem key={a.id} value={a.id} className="text-xs">
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
