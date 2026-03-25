import { useState, useMemo } from "react";
import { Calendar, Plus, Download, Upload, Search, Trash2, Edit, DollarSign, Shield, ClipboardPaste } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CategorySuggestion } from "@/components/transactions/CategorySuggestion";
import { ShadowImpactCard } from "@/components/behavioral/ShadowImpactCard";
import { ConnectorReviewModal } from "@/components/import/ConnectorReviewModal";
import { useLocalTransactions } from "@/hooks/useLocalTransactions";
import { useLocalAccounts } from "@/hooks/useLocalAccounts";
import { useLocalDebts } from "@/hooks/useLocalDebts";
import { useExpenses } from "@/hooks/useLocalSettings"; // kept for CSV import mapping
import { useTransactionCategorization } from "@/hooks/useTransactionCategorization";
import { DEFAULT_EXPENSES, formatCurrency } from "@/lib/constants";
import { getCurrentMonth, formatMonthDisplay, formatDate, formatDisplayDate } from "@/lib/dateUtils";
import { Transaction } from "@/types/transactions";
import { toCsv, downloadCsv, parseCsv, validateCsvFile, mapTransactionCsv } from "@/lib/csvUtils";
import { importFromClipboard, ImportResult, ProcessedTransaction } from "@/lib/connectorImportHandler";
import { SwipeablePageWrapper } from '@/components/SwipeablePageWrapper';

export const Transactions = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
const [expenses] = useExpenses();
  const {
    recordCategorization
  } = useTransactionCategorization();
  const {
    accounts,
    getActiveAccounts
  } = useLocalAccounts();
  const activeAccounts = getActiveAccounts();
  const { debts, updateDebt } = useLocalDebts();
  const {
    transactions: rawTransactions,
    addTransaction: addRawTransaction,
    addTransactionsBulk: addRawTransactionsBulk,
    updateTransaction: updateRawTransaction,
    removeTransaction,
    getTransactionsByMonth: getRawTransactionsByMonth,
    getTotalActualSpending: getRawTotalActualSpending
  } = useLocalTransactions();

  // Map Supabase transactions to expected format
  const transactions = rawTransactions.map(t => ({
    id: t.id,
    date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category,
    accountId: t.account_id,
    flow: t.flow,
    expenseId: t.expense_id,
    debtId: t.debt_id,
    notes: t.notes
  }));

  // Wrapper functions to handle field mapping
  const addTransaction = (transaction: any) => {
    return addRawTransaction({
      ...transaction,
      account_id: transaction.accountId,
      expense_id: transaction.expenseId,
      debt_id: transaction.debtId
    });
  };
  const addTransactionsBulk = (transactions: any[]) => {
    const mappedTransactions = transactions.map(t => ({
      ...t,
      account_id: t.accountId,
      expense_id: t.expenseId,
      debt_id: t.debtId
    }));
    return addRawTransactionsBulk(mappedTransactions);
  };
  const updateTransaction = (id: string, updates: any) => {
    const mappedUpdates = {
      ...updates,
      account_id: updates.accountId,
      expense_id: updates.expenseId,
      debt_id: updates.debtId
    };
    return updateRawTransaction(id, mappedUpdates);
  };
  const getTransactionsByMonth = (month: string, accountId?: string) => {
    // Convert "all" to undefined so the filter shows all accounts
    const filterAccountId = accountId === 'all' ? undefined : accountId;
    return getRawTransactionsByMonth(month, filterAccountId).map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      accountId: t.account_id,
      flow: t.flow,
      expenseId: t.expense_id,
      debtId: t.debt_id,
      notes: t.notes
    }));
  };
  const getTotalActualSpending = (month: string) => {
    return getRawTotalActualSpending(month);
  };
  const { enabledCategories, groups } = useCategories();

  // Group enabled categories by their group for the dropdown
  const groupedCategories = useMemo(() => {
    return groups
      .filter(g => !g.isIncome)
      .map(group => ({
        ...group,
        categories: enabledCategories.filter(c => c.groupId === group.id),
      }))
      .filter(g => g.categories.length > 0);
  }, [groups, enabledCategories]);

  const incomeCategories = useMemo(() => {
    return enabledCategories.filter(c => {
      const group = groups.find(g => g.id === c.groupId);
      return group?.isIncome;
    });
  }, [enabledCategories, groups]);

  const [newTransaction, setNewTransaction] = useState({
    date: formatDate(new Date()),
    description: "",
    amount: 0,
    category: "",
    accountId: activeAccounts[0]?.id || 'default-checking',
    flow: 'out' as 'in' | 'out',
    debtId: "",
    notes: ""
  });
  
  // Connector import state
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [connectorImportData, setConnectorImportData] = useState<ImportResult>({
    newTransactions: [],
    duplicates: [],
    errors: [],
  });
  
  const monthTransactions = getTransactionsByMonth(selectedMonth, selectedAccount);
  const filteredTransactions = monthTransactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalSpending = selectedAccount === 'all' ? getTotalActualSpending(selectedMonth) : monthTransactions.filter(t => t.flow === 'out').reduce((sum, t) => sum + t.amount, 0);
  
  // Connector import handlers
  const handlePasteFromConnector = async () => {
    const result = await importFromClipboard();
    
    if (result.errors.length > 0) {
      toast.error(result.errors[0]);
      return;
    }
    
    if (result.newTransactions.length === 0) {
      toast.error("No transactions found in clipboard");
      return;
    }
    
    setConnectorImportData(result);
    setShowConnectorModal(true);
  };
  
  const handleConfirmConnectorImport = (selected: ProcessedTransaction[]) => {
    // For debt payments, try to match to existing debts
    const transactionsToAdd = selected.map(t => {
      let debtId: string | undefined;
      
      // If this is a debt payment, try to find a matching debt
      if (t.category === 'Debt Payments' && t.description) {
        const matchedDebt = debts.find(d => 
          t.description.toLowerCase().includes(d.name.toLowerCase())
        );
        if (matchedDebt) {
          debtId = matchedDebt.id;
          // Update the debt balance
          updateDebt(matchedDebt.id, {
            balance: Math.max(0, matchedDebt.balance - t.amount)
          });
        }
      }
      
      return {
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category,
        accountId: activeAccounts[0]?.id || 'default-checking',
        flow: t.flow,
        expenseId: undefined,
        debtId,
        notes: `Imported from Connector: ${t.rawText.slice(0, 100)}`,
      };
    });
    
    addTransactionsBulk(transactionsToAdd);
    
    // Switch to the most recent transaction month
    if (transactionsToAdd.length > 0) {
      const dates = transactionsToAdd.map(t => t.date).sort();
      const mostRecentMonth = dates[dates.length - 1].slice(0, 7);
      setSelectedMonth(mostRecentMonth);
    }
    
    toast.success(`Successfully imported ${selected.length} transactions`);
  };
  const handleAddTransaction = () => {
    if (!newTransaction.description || newTransaction.amount <= 0) return;
    addTransaction({
      ...newTransaction,
      debtId: newTransaction.debtId || undefined
    });

    // If this is a debt payment with a linked debt, update the debt balance
    if (newTransaction.category === 'Debt Payments' && newTransaction.debtId) {
      const debt = debts.find(d => d.id === newTransaction.debtId);
      if (debt) {
        updateDebt(newTransaction.debtId, {
          balance: Math.max(0, debt.balance - newTransaction.amount)
        });
        toast.success(`${debt.name} balance updated to ${formatCurrency(Math.max(0, debt.balance - newTransaction.amount))}`);
      }
    }

    // Record manual categorization for learning
    recordCategorization(newTransaction.description, null,
    // No AI suggestion for manual entry
    newTransaction.category, newTransaction.amount);
    setNewTransaction({
      date: formatDate(new Date()),
      description: "",
      amount: 0,
      category: "",
      accountId: activeAccounts[0]?.id || 'default-checking',
      flow: 'out' as 'in' | 'out',
      debtId: "",
      notes: ""
    });
    setShowAddDialog(false);
  };
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      accountId: transaction.accountId,
      flow: transaction.flow,
      debtId: transaction.debtId || "",
      notes: transaction.notes || ""
    });
  };
  const handleUpdateTransaction = () => {
    if (!editingTransaction || !newTransaction.description || newTransaction.amount <= 0) return;
    
    const oldDebtId = editingTransaction.debtId;
    const newDebtId = newTransaction.debtId || undefined;
    const amountChanged = editingTransaction.amount !== newTransaction.amount;
    const debtChanged = oldDebtId !== newDebtId;

    // Handle debt balance adjustments when editing
    if (newTransaction.category === 'Debt Payments') {
      // If debt changed or amount changed, we need to adjust balances
      if (oldDebtId && (debtChanged || amountChanged)) {
        // Restore old debt balance
        const oldDebt = debts.find(d => d.id === oldDebtId);
        if (oldDebt) {
          updateDebt(oldDebtId, {
            balance: oldDebt.balance + editingTransaction.amount
          });
        }
      }
      
      if (newDebtId && (debtChanged || amountChanged)) {
        // Apply new payment to new/same debt
        const newDebt = debts.find(d => d.id === newDebtId);
        if (newDebt) {
          const adjustedBalance = debtChanged 
            ? newDebt.balance 
            : newDebt.balance + editingTransaction.amount; // If same debt, we restored it above
          updateDebt(newDebtId, {
            balance: Math.max(0, adjustedBalance - newTransaction.amount)
          });
          toast.success(`${newDebt.name} balance updated!`);
        }
      }
    }

    updateTransaction(editingTransaction.id, {
      ...newTransaction,
      debtId: newDebtId
    });

    // Record categorization update for learning (only if category changed)
    if (editingTransaction.category !== newTransaction.category) {
      recordCategorization(newTransaction.description, null,
      // No AI suggestion for manual edit
      newTransaction.category, newTransaction.amount);
    }
    setEditingTransaction(null);
    setNewTransaction({
      date: formatDate(new Date()),
      description: "",
      amount: 0,
      category: "",
      accountId: activeAccounts[0]?.id || 'default-checking',
      flow: 'out' as 'in' | 'out',
      debtId: "",
      notes: ""
    });
  };
  const exportTransactions = () => {
    const rows = [["date", "description", "amount", "category", "account", "flow", "expenseId", "notes"], ...monthTransactions.map(t => [t.date, t.description, t.amount.toString(), t.category, accounts.find(a => a.id === t.accountId)?.name || t.accountId, t.flow, t.expenseId || "", t.notes || ""])];
    const filename = selectedAccount === 'all' ? `transactions-${selectedMonth}.csv` : `transactions-${selectedMonth}-${accounts.find(a => a.id === selectedAccount)?.name || selectedAccount}.csv`;
    downloadCsv(filename, toCsv(rows));
  };
  const importTransactions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateCsvFile(file);
    if (!validation.isValid) {
      toast.error(`Import failed: ${validation.error}`);
      event.target.value = "";
      return;
    }
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) {
        toast.error("CSV file is empty");
        event.target.value = "";
        return;
      }
      const parsedTransactions = mapTransactionCsv(rows, accounts.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type as 'checking' | 'savings' | 'credit' | 'cash' | 'investment',
        balance: a.balance,
        isActive: a.is_active
      })), expenses);
      if (parsedTransactions.length === 0) {
        toast.error("No valid transactions found in CSV");
        event.target.value = "";
        return;
      }

      // Use bulk import to avoid state update issues
      addTransactionsBulk(parsedTransactions.map(transaction => ({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        accountId: transaction.accountId,
        flow: transaction.flow,
        expenseId: transaction.expenseId,
        notes: transaction.notes || ""
      })));

      // Find the most recent transaction month and switch to it
      const dates = parsedTransactions.map(t => t.date).sort();
      const mostRecentMonth = dates[dates.length - 1].slice(0, 7);
      setSelectedMonth(mostRecentMonth);
      toast.success(`Successfully imported ${parsedTransactions.length} transactions`);
    } catch (error) {
      toast.error("Failed to import file. Please check the format and try again.");
      console.error("Import error:", error);
    }
    event.target.value = "";
  };
  return <SwipeablePageWrapper rightRoute="/debts">
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handlePasteFromConnector} className="border-primary/30 hover:bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="hidden sm:inline ml-2">Paste from Connector</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import transactions from Zero Hero Connector</p>
              </TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" onClick={exportTransactions} aria-label="Export transactions to CSV">
              <Download className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline ml-2">Export</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('import-transactions')?.click()} aria-label="Import transactions from CSV">
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline ml-2">Import</span>
            </Button>
            <input id="import-transactions" type="file" accept=".csv" className="hidden" onChange={importTransactions} />
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="royal">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add Transaction</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-2">
                  <DialogTitle>Log Transaction</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transaction-date">Date</Label>
                      <Input id="transaction-date" type="date" value={newTransaction.date} onChange={e => setNewTransaction({
                      ...newTransaction,
                      date: e.target.value
                    })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transaction-amount">Amount</Label>
                      <CurrencyInput id="transaction-amount" prefix="$" step={0.01} value={newTransaction.amount || ''} onChange={e => setNewTransaction({
                      ...newTransaction,
                      amount: parseFloat(e.target.value) || 0
                    })} placeholder="0.00" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transaction-description">Description</Label>
                    <Input id="transaction-description" value={newTransaction.description} onChange={e => setNewTransaction({
                    ...newTransaction,
                    description: e.target.value
                  })} placeholder="Transaction description" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transaction-account">Account</Label>
                      <Select value={newTransaction.accountId} onValueChange={value => setNewTransaction({
                      ...newTransaction,
                      accountId: value
                    })}>
                        <SelectTrigger id="transaction-account">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeAccounts.map(account => <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transaction-type">Type</Label>
                      <Select value={newTransaction.flow} onValueChange={(value: 'in' | 'out') => setNewTransaction({
                      ...newTransaction,
                      flow: value
                    })}>
                        <SelectTrigger id="transaction-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="out">💸 Expense</SelectItem>
                          <SelectItem value="in">💰 Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transaction-category">Category</Label>
                    <Select value={newTransaction.category} onValueChange={value => setNewTransaction({
                      ...newTransaction,
                      category: value
                    })}>
                      <SelectTrigger id="transaction-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {newTransaction.flow === 'in' ? (
                          incomeCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))
                        ) : (
                          groupedCategories.map(group => (
                            <div key={group.id}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {group.name}
                              </div>
                              {group.categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                              ))}
                            </div>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Debt Selector - only show when category is Debt Payments */}
                  {newTransaction.category === 'Debt Payments' && debts.length > 0 && (
                    <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                      <Label htmlFor="transaction-debt">Which Debt?</Label>
                      <Select 
                        value={newTransaction.debtId} 
                        onValueChange={value => setNewTransaction({
                          ...newTransaction,
                          debtId: value === "none" ? "" : value
                        })}
                      >
                        <SelectTrigger id="transaction-debt">
                          <SelectValue placeholder="Select debt to update balance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Don't update a debt balance</SelectItem>
                          {debts.filter(d => d.balance > 0).map(debt => (
                            <SelectItem key={debt.id} value={debt.id}>
                              {debt.name} - {formatCurrency(debt.balance)} balance
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Selecting a debt will automatically reduce its balance by this amount.
                      </p>
                    </div>
                  )}
                  
                  {/* AI Category Suggestion */}
                  <CategorySuggestion description={newTransaction.description} amount={newTransaction.amount} currentCategory={newTransaction.category} onSuggestionAccepted={category => setNewTransaction({
                  ...newTransaction,
                  category
                })} />
                  
                  {/* Shadow Impact Card for discretionary expenses */}
                  <ShadowImpactCard 
                    amount={newTransaction.amount} 
                    category={newTransaction.category} 
                    flow={newTransaction.flow}
                    description={newTransaction.description}
                    onSkipAndPayDebt={() => setShowAddDialog(false)}
                    onBuyAnyway={() => {}}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="transaction-notes">Notes (Optional)</Label>
                    <Textarea id="transaction-notes" value={newTransaction.notes} onChange={e => setNewTransaction({
                    ...newTransaction,
                    notes: e.target.value
                  })} placeholder="Additional notes" />
                  </div>
                  
                  <Button onClick={handleAddTransaction} className="w-full">
                    Add Transaction
                  </Button>
                </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-primary-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({
              length: 12
            }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthStr = formatDate(date).slice(0, 7);
              return <SelectItem key={monthStr} value={monthStr}>
                    {formatMonthDisplay(monthStr)}
                  </SelectItem>;
            })}
            </SelectContent>
          </Select>
          
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {activeAccounts.map(account => <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 p-3 rounded-lg border flex-1 min-w-[200px] bg-primary-foreground">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-background border-0 focus-visible:ring-0" />
        </div>
      </div>

      {/* Summary */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="text-xl">
            {formatMonthDisplay(selectedMonth)} Summary
            {selectedAccount !== 'all' && ` - ${accounts.find(a => a.id === selectedAccount)?.name}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <span className="text-muted-foreground font-medium">Total Spent</span>
            <span className="text-2xl font-bold text-destructive">
              {formatCurrency(totalSpending)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              No transactions found for this month.
            </div> : <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Description</th>
                    <th className="text-left p-3 font-semibold">Amount</th>
                    <th className="text-left p-3 font-semibold hidden sm:table-cell">Account</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{formatDisplayDate(transaction.date)}</td>
                      <td className="p-3 break-anywhere max-w-[200px]">{transaction.description}</td>
                      <td className="p-3 font-medium">
                        <span className={transaction.flow === 'in' ? 'text-success' : 'text-destructive'}>
                          {transaction.flow === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-3 hidden sm:table-cell">{accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown'}</td>
                      <td className="p-3 break-anywhere">{transaction.category}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Dialog open={editingTransaction?.id === transaction.id} onOpenChange={open => {
                      if (!open) {
                        setEditingTransaction(null);
                        setNewTransaction({
                          date: formatDate(new Date()),
                          description: "",
                          amount: 0,
                          category: "",
                          accountId: activeAccounts[0]?.id || 'default-checking',
                          flow: 'out' as 'in' | 'out',
                          debtId: "",
                          notes: ""
                        });
                      }
                    }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(transaction)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Transaction</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={newTransaction.date} onChange={e => setNewTransaction({
                                ...newTransaction,
                                date: e.target.value
                              })} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input type="number" step="0.01" value={newTransaction.amount} onChange={e => setNewTransaction({
                                ...newTransaction,
                                amount: parseFloat(e.target.value) || 0
                              })} />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Input value={newTransaction.description} onChange={e => setNewTransaction({
                              ...newTransaction,
                              description: e.target.value
                            })} placeholder="Transaction description" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Account</Label>
                                    <Select value={newTransaction.accountId} onValueChange={value => setNewTransaction({
                                ...newTransaction,
                                accountId: value
                              })}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {activeAccounts.map(account => <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                          </SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={newTransaction.flow} onValueChange={(value: 'in' | 'out') => setNewTransaction({
                                ...newTransaction,
                                flow: value
                              })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="out">Expense (Money Out)</SelectItem>
                                        <SelectItem value="in">Income (Money In)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Category</Label>
                                  <Select value={newTransaction.category} onValueChange={value => setNewTransaction({
                                    ...newTransaction,
                                    category: value
                                  })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {newTransaction.flow === 'in' ? (
                                        incomeCategories.map(cat => (
                                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                        ))
                                      ) : (
                                        groupedCategories.map(group => (
                                          <div key={group.id}>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                              {group.name}
                                            </div>
                                            {group.categories.map(cat => (
                                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                          </div>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* AI Category Suggestion */}
                                <CategorySuggestion description={newTransaction.description} amount={newTransaction.amount} currentCategory={newTransaction.category} onSuggestionAccepted={category => setNewTransaction({
                            ...newTransaction,
                            category
                          })} />
                                
                                {/* Shadow Impact Card for discretionary expenses */}
                                <ShadowImpactCard 
                                  amount={newTransaction.amount} 
                                  category={newTransaction.category} 
                                  flow={newTransaction.flow}
                                  description={newTransaction.description}
                                  onSkipAndPayDebt={() => setEditingTransaction(null)}
                                  onBuyAnyway={() => {}}
                                />
                                
                                <div className="space-y-2">
                                  <Label>Notes (Optional)</Label>
                                  <Textarea value={newTransaction.notes} onChange={e => setNewTransaction({
                              ...newTransaction,
                              notes: e.target.value
                            })} placeholder="Additional notes" />
                                </div>
                                
                                <Button onClick={handleUpdateTransaction} className="w-full">
                                  Update Transaction
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="ghost" size="sm" onClick={() => removeTransaction(transaction.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
        </CardContent>
      </Card>
      
      {/* Connector Review Modal */}
      <ConnectorReviewModal
        open={showConnectorModal}
        onOpenChange={setShowConnectorModal}
        importData={connectorImportData}
        existingTransactions={transactions}
        onConfirmImport={handleConfirmConnectorImport}
      />
    </div>
  </SwipeablePageWrapper>;
};