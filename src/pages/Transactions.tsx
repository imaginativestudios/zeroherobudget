import { useState } from "react";
import { Calendar, Plus, Download, Upload, Search, Trash2, Edit, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategorySuggestion } from "@/components/transactions/CategorySuggestion";
import { ShadowImpactCard } from "@/components/behavioral/ShadowImpactCard";
import { useLocalTransactions } from "@/hooks/useLocalTransactions";
import { useLocalAccounts } from "@/hooks/useLocalAccounts";
import { useExpenses } from "@/hooks/useLocalSettings";
import { useTransactionCategorization } from "@/hooks/useTransactionCategorization";
import { DEFAULT_EXPENSES, formatCurrency } from "@/lib/constants";
import { getCurrentMonth, formatMonthDisplay, formatDate, formatDisplayDate } from "@/lib/dateUtils";
import { Transaction } from "@/types/transactions";
import { toCsv, downloadCsv, parseCsv, validateCsvFile, mapTransactionCsv } from "@/lib/csvUtils";
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
    notes: t.notes
  }));

  // Wrapper functions to handle field mapping
  const addTransaction = (transaction: any) => {
    return addRawTransaction({
      ...transaction,
      account_id: transaction.accountId,
      expense_id: transaction.expenseId
    });
  };
  const addTransactionsBulk = (transactions: any[]) => {
    const mappedTransactions = transactions.map(t => ({
      ...t,
      account_id: t.accountId,
      expense_id: t.expenseId
    }));
    return addRawTransactionsBulk(mappedTransactions);
  };
  const updateTransaction = (id: string, updates: any) => {
    const mappedUpdates = {
      ...updates,
      account_id: updates.accountId,
      expense_id: updates.expenseId
    };
    return updateRawTransaction(id, mappedUpdates);
  };
  const getTransactionsByMonth = (month: string, accountId?: string) => {
    return getRawTransactionsByMonth(month, accountId).map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      accountId: t.account_id,
      flow: t.flow,
      expenseId: t.expense_id,
      notes: t.notes
    }));
  };
  const getTotalActualSpending = (month: string) => {
    return getRawTotalActualSpending(month);
  };
  const [newTransaction, setNewTransaction] = useState({
    date: formatDate(new Date()),
    description: "",
    amount: 0,
    category: "",
    accountId: activeAccounts[0]?.id || 'default-checking',
    flow: 'out' as 'in' | 'out',
    expenseId: "",
    notes: ""
  });
  const monthTransactions = getTransactionsByMonth(selectedMonth, selectedAccount);
  const filteredTransactions = monthTransactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalSpending = selectedAccount === 'all' ? getTotalActualSpending(selectedMonth) : monthTransactions.filter(t => t.flow === 'out').reduce((sum, t) => sum + t.amount, 0);
  const handleAddTransaction = () => {
    if (!newTransaction.description || newTransaction.amount <= 0) return;
    addTransaction({
      ...newTransaction,
      expenseId: newTransaction.expenseId || undefined
    });

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
      expenseId: "",
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
      expenseId: transaction.expenseId || "",
      notes: transaction.notes || ""
    });
  };
  const handleUpdateTransaction = () => {
    if (!editingTransaction || !newTransaction.description || newTransaction.amount <= 0) return;
    updateTransaction(editingTransaction.id, {
      ...newTransaction,
      expenseId: newTransaction.expenseId || undefined
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
      expenseId: "",
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
  return <div className="space-y-8">
      <div className="pt-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">Actual Transactions</h1>
          
          <div className="flex flex-wrap items-center gap-2">
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
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
                      <Input id="transaction-amount" type="number" step="0.01" value={newTransaction.amount} onChange={e => setNewTransaction({
                      ...newTransaction,
                      amount: parseFloat(e.target.value) || 0
                    })} />
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
                          <SelectItem value="out">Expense (Money Out)</SelectItem>
                          <SelectItem value="in">Income (Money In)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transaction-category">Category</Label>
                      <Input id="transaction-category" value={newTransaction.category} onChange={e => setNewTransaction({
                      ...newTransaction,
                      category: e.target.value
                    })} placeholder="Category" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transaction-budget-line">Budget Line (Optional)</Label>
                      <Select value={newTransaction.expenseId} onValueChange={value => setNewTransaction({
                      ...newTransaction,
                      expenseId: value === "none" ? undefined : value
                    })}>
                        <SelectTrigger id="transaction-budget-line">
                          <SelectValue placeholder="Select budget line" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {expenses.map(expense => <SelectItem key={expense.id} value={expense.id}>
                              {expense.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Description</th>
                    <th className="text-left p-3 font-semibold">Amount</th>
                    <th className="text-left p-3 font-semibold">Account</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-left p-3 font-semibold">Budget Line</th>
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{formatDisplayDate(transaction.date)}</td>
                      <td className="p-3 break-anywhere">{transaction.description}</td>
                      <td className="p-3 font-medium">
                        <span className={transaction.flow === 'in' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.flow === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-3">{accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown'}</td>
                      <td className="p-3 break-anywhere">{transaction.category}</td>
                      <td className="p-3">
                        {transaction.expenseId ? expenses.find(e => e.id === transaction.expenseId)?.name || "Unknown" : "-"}
                      </td>
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
                          expenseId: "",
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
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input value={newTransaction.category} onChange={e => setNewTransaction({
                                ...newTransaction,
                                category: e.target.value
                              })} placeholder="Category" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Budget Line (Optional)</Label>
                                    <Select value={newTransaction.expenseId} onValueChange={value => setNewTransaction({
                                ...newTransaction,
                                expenseId: value === "none" ? undefined : value
                              })}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select budget line" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {expenses.map(expense => <SelectItem key={expense.id} value={expense.id}>
                                            {expense.name}
                                          </SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </div>
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
    </div>;
};