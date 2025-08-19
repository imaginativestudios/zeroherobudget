import { useState } from "react";
import { Calendar, Plus, Download, Upload, Search, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
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
  const [expenses] = useLocalStorage("bdt_expenses", DEFAULT_EXPENSES);
  
  const { accounts, getActiveAccounts } = useAccounts();
  const activeAccounts = getActiveAccounts();
  
  const {
    transactions,
    addTransaction,
    addTransactionsBulk,
    updateTransaction,
    removeTransaction,
    getTransactionsByMonth,
    getTotalActualSpending
  } = useTransactions();

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
  const filteredTransactions = monthTransactions.filter(t =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpending = getTotalActualSpending(selectedMonth, selectedAccount);

  const handleAddTransaction = () => {
    if (!newTransaction.description || newTransaction.amount <= 0) return;
    
    addTransaction({
      ...newTransaction,
      expenseId: newTransaction.expenseId || undefined
    });
    
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
    const rows = [
      ["date", "description", "amount", "category", "account", "flow", "expenseId", "notes"],
      ...monthTransactions.map(t => [
        t.date,
        t.description,
        t.amount.toString(),
        t.category,
        accounts.find(a => a.id === t.accountId)?.name || t.accountId,
        t.flow,
        t.expenseId || "",
        t.notes || ""
      ])
    ];
    const filename = selectedAccount === 'all' 
      ? `transactions-${selectedMonth}.csv`
      : `transactions-${selectedMonth}-${accounts.find(a => a.id === selectedAccount)?.name || selectedAccount}.csv`;
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
      
      const parsedTransactions = mapTransactionCsv(rows, accounts, expenses);
      
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

  return (
    <div className="space-y-8">
      <div className="pt-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Actual Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-transactions')?.click()}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <input
            id="import-transactions"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={importTransactions}
          />
        </div>
      </div>

      {/* Controls */}
      <Card className="shadow-royal">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label>Month:</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const monthStr = formatDate(date).slice(0, 7);
                      return (
                        <SelectItem key={monthStr} value={monthStr}>
                          {formatMonthDisplay(monthStr)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label>Account:</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {activeAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="royal">
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      placeholder="Transaction description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account</Label>
                      <Select value={newTransaction.accountId} onValueChange={(value) => setNewTransaction({...newTransaction, accountId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeAccounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newTransaction.flow} onValueChange={(value: 'in' | 'out') => setNewTransaction({...newTransaction, flow: value})}>
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
                      <Input
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                        placeholder="Category"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Budget Line (Optional)</Label>
                      <Select value={newTransaction.expenseId} onValueChange={(value) => setNewTransaction({...newTransaction, expenseId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget line" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {expenses.map(expense => (
                            <SelectItem key={expense.id} value={expense.id}>
                              {expense.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                      placeholder="Additional notes"
                    />
                  </div>
                  
                  <Button onClick={handleAddTransaction} className="w-full">
                    Add Transaction
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {formatMonthDisplay(selectedMonth)} Summary
            {selectedAccount !== 'all' && ` - ${accounts.find(a => a.id === selectedAccount)?.name}`}
            <span className="text-lg font-bold text-destructive">
              Total Spent: {formatCurrency(totalSpending)}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-royal">
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found for this month.
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{formatDisplayDate(transaction.date)}</td>
                      <td className="p-3">{transaction.description}</td>
                      <td className="p-3 font-medium">
                        <span className={transaction.flow === 'in' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.flow === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-3">{accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown'}</td>
                      <td className="p-3">{transaction.category}</td>
                      <td className="p-3">
                        {transaction.expenseId 
                          ? expenses.find(e => e.id === transaction.expenseId)?.name || "Unknown"
                          : "-"
                        }
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Dialog open={editingTransaction?.id === transaction.id} onOpenChange={(open) => {
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                              >
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
                                    <Input
                                      type="date"
                                      value={newTransaction.date}
                                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={newTransaction.amount}
                                      onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Input
                                    value={newTransaction.description}
                                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                                    placeholder="Transaction description"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Account</Label>
                                    <Select value={newTransaction.accountId} onValueChange={(value) => setNewTransaction({...newTransaction, accountId: value})}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {activeAccounts.map(account => (
                                          <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={newTransaction.flow} onValueChange={(value: 'in' | 'out') => setNewTransaction({...newTransaction, flow: value})}>
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
                                    <Input
                                      value={newTransaction.category}
                                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                                      placeholder="Category"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Budget Line (Optional)</Label>
                                    <Select value={newTransaction.expenseId} onValueChange={(value) => setNewTransaction({...newTransaction, expenseId: value})}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select budget line" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {expenses.map(expense => (
                                          <SelectItem key={expense.id} value={expense.id}>
                                            {expense.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Notes (Optional)</Label>
                                  <Textarea
                                    value={newTransaction.notes}
                                    onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                                    placeholder="Additional notes"
                                  />
                                </div>
                                
                                <Button onClick={handleUpdateTransaction} className="w-full">
                                  Update Transaction
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTransaction(transaction.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};