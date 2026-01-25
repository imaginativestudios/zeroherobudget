import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, PiggyBank, CreditCard, Banknote, TrendingUp } from "lucide-react";
import { Account } from "@/hooks/useLocalAccounts";

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking", icon: Wallet },
  { value: "savings", label: "Savings", icon: PiggyBank },
  { value: "credit", label: "Credit Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "investment", label: "Investment", icon: TrendingUp },
] as const;

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  onSubmit: (data: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => void;
}

export function AccountForm({ open, onOpenChange, account, onSubmit }: AccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("checking");
  const [balance, setBalance] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setBalance(account.balance);
      setIsActive(account.is_active);
    } else {
      setName("");
      setType("checking");
      setBalance(0);
      setIsActive(true);
    }
  }, [account, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      type,
      balance,
      is_active: isActive,
    });
    
    onOpenChange(false);
  };

  const isEditing = !!account;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{isEditing ? "Edit Account" : "Add Account"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chase Checking, Visa Card"
                required
                className="min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-type">Account Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="account-type" className="min-h-[44px]">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((accountType) => (
                    <SelectItem key={accountType.value} value={accountType.value}>
                      <div className="flex items-center gap-2">
                        <accountType.icon className="h-4 w-4" />
                        <span>{accountType.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-balance">Current Balance</Label>
              <CurrencyInput
                id="account-balance"
                prefix="$"
                value={balance || ""}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step={0.01}
                className="min-h-[44px]"
              />
              {type === "credit" && (
                <p className="text-xs text-muted-foreground">
                  Enter negative balance for credit cards with outstanding debt
                </p>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="account-active" className="cursor-pointer">
                Active Account
              </Label>
              <Switch
                id="account-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-h-[44px] flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="min-h-[44px] flex-1">
                {isEditing ? "Save Changes" : "Add Account"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
