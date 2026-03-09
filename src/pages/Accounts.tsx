import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Wallet, PiggyBank, CreditCard, Banknote, TrendingUp, Pencil, Trash2, Power, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalAccounts, Account } from "@/hooks/useLocalAccounts";
import { useLinkedAccounts } from "@/hooks/useLinkedAccounts";
import { AccountForm } from "@/components/accounts/AccountForm";
import { LinkedAccountsList } from "@/components/linked-accounts/LinkedAccountsList";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPE_CONFIG = {
  checking: { label: "Checking", icon: Wallet, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  savings: { label: "Savings", icon: PiggyBank, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  credit: { label: "Credit Card", icon: CreditCard, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  cash: { label: "Cash", icon: Banknote, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  investment: { label: "Investment", icon: TrendingUp, color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300" },
} as const;

export function Accounts() {
  const navigate = useNavigate();
  const { accounts, addAccount, updateAccount, removeAccount } = useLocalAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeCount = accounts.filter((acc) => acc.is_active).length;
  const typeBreakdown = accounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAddAccount = (data: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => {
    addAccount(data);
    toast({ title: "Account added", description: `${data.name} has been created.` });
  };

  const handleEditAccount = (data: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!editingAccount) return;
    updateAccount(editingAccount.id, data);
    toast({ title: "Account updated", description: `${data.name} has been updated.` });
    setEditingAccount(null);
  };

  const handleDeleteAccount = () => {
    if (!deleteConfirm) return;
    
    const activeAccounts = accounts.filter((acc) => acc.is_active);
    if (activeAccounts.length === 1 && deleteConfirm.is_active) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one active account.",
        variant: "destructive",
      });
      setDeleteConfirm(null);
      return;
    }
    
    removeAccount(deleteConfirm.id);
    toast({ title: "Account deleted", description: `${deleteConfirm.name} has been removed.` });
    setDeleteConfirm(null);
  };

  const handleToggleActive = (account: Account) => {
    const newActiveState = !account.is_active;
    
    if (!newActiveState) {
      const activeAccounts = accounts.filter((acc) => acc.is_active);
      if (activeAccounts.length === 1) {
        toast({
          title: "Cannot deactivate",
          description: "You must have at least one active account.",
          variant: "destructive",
        });
        return;
      }
    }
    
    updateAccount(account.id, { is_active: newActiveState });
    toast({
      title: newActiveState ? "Account activated" : "Account deactivated",
      description: `${account.name} is now ${newActiveState ? "active" : "inactive"}.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTypeConfig = (type: string) => {
    return ACCOUNT_TYPE_CONFIG[type as keyof typeof ACCOUNT_TYPE_CONFIG] || ACCOUNT_TYPE_CONFIG.checking;
  };

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your bank accounts, credit cards, and cash accounts
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-2xl font-bold",
              totalBalance < 0 ? "text-destructive" : "text-foreground"
            )}>
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">of {accounts.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.entries(typeBreakdown).map(([type, count]) => {
                const config = getTypeConfig(type);
                return (
                  <Badge key={type} variant="secondary" className={cn("text-xs", config.color)}>
                    {count} {config.label}
                  </Badge>
                );
              })}
              {Object.keys(typeBreakdown).length === 0 && (
                <span className="text-sm text-muted-foreground">No accounts</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      {accounts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => {
                    const config = getTypeConfig(account.type);
                    const IconComponent = config.icon;

                    return (
                      <TableRow key={account.id} className={cn(!account.is_active && "opacity-60")}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", config.color)}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">{config.label}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className={config.color}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-medium",
                            account.balance < 0 ? "text-destructive" : "text-foreground"
                          )}>
                            {formatCurrency(account.balance)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={account.is_active ? "default" : "secondary"}>
                            {account.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingAccount(account);
                                    setShowForm(true);
                                  }}
                                  className="h-9 w-9"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleActive(account)}
                                  className="h-9 w-9"
                                >
                                  <Power className={cn("h-4 w-4", account.is_active ? "text-green-600" : "text-muted-foreground")} />
                                  <span className="sr-only">{account.is_active ? "Deactivate" : "Activate"}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{account.is_active ? "Deactivate" : "Activate"}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteConfirm(account)}
                                  className="h-9 w-9 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Add your first account to start tracking your finances across different banks and cards.
            </p>
            <Button onClick={() => setShowForm(true)} className="min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Linked Bank Accounts Section */}
      <Separator />
      <LinkedAccountsList />

      {/* Add/Edit Form Dialog */}
      <AccountForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingAccount(null);
        }}
        account={editingAccount}
        onSubmit={editingAccount ? handleEditAccount : handleAddAccount}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirm?.name}". Transactions linked to this account will lose their account reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
