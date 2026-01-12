import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, AlertTriangle, Loader2, Trash2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ProcessedTransaction, ImportResult, findDuplicates } from '@/lib/connectorImportHandler';
import { formatCurrency } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { soundEffects } from '@/lib/soundEffects';
import { batchCategorizeTransactions, BatchCategorizationProgress } from '@/lib/batchCategorization';
import { CategoryBadgeSelect } from './CategoryBadgeSelect';
import { useTransactionCategorization } from '@/hooks/useTransactionCategorization';

interface ConnectorReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importData: ImportResult;
  existingTransactions: Array<{ date: string; amount: number; description: string }>;
  onConfirmImport: (transactions: ProcessedTransaction[]) => void;
}

export function ConnectorReviewModal({
  open,
  onOpenChange,
  importData,
  existingTransactions,
  onConfirmImport,
}: ConnectorReviewModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [processedResult, setProcessedResult] = useState<ImportResult | null>(null);
  
  // AI Categorization state
  const [isCategorizingAll, setIsCategorizingAll] = useState(false);
  const [categorizationProgress, setCategorizationProgress] = useState<BatchCategorizationProgress | null>(null);
  const [categorySuggestions, setCategorySuggestions] = useState<Map<string, string>>(new Map());
  const [userCategories, setUserCategories] = useState<Map<string, string>>(new Map());
  
  const { recordCategorization } = useTransactionCategorization();

  // Process duplicates when modal opens
  useEffect(() => {
    if (open && importData.newTransactions.length > 0) {
      const result = findDuplicates(importData.newTransactions, existingTransactions);
      setProcessedResult(result);
      
      // Select all new (non-duplicate) transactions by default
      const newIds = new Set(result.newTransactions.map(t => t.duplicateKey));
      setSelectedIds(newIds);
      
      // Reset categorization state
      setCategorySuggestions(new Map());
      setUserCategories(new Map());
      setCategorizationProgress(null);
    }
  }, [open, importData, existingTransactions]);

  const toggleTransaction = (key: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (processedResult) {
      setSelectedIds(new Set(processedResult.newTransactions.map(t => t.duplicateKey)));
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };
  
  // Handle AI categorization for all transactions
  const handleCategorizeAll = async () => {
    if (!processedResult || processedResult.newTransactions.length === 0) return;
    
    setIsCategorizingAll(true);
    
    const transactionsToCategorize = processedResult.newTransactions.map(t => ({
      duplicateKey: t.duplicateKey,
      description: t.description,
      rawText: t.rawText,
      amount: t.amount,
      flow: t.flow,
    }));
    
    try {
      const results = await batchCategorizeTransactions(
        transactionsToCategorize,
        (progress) => setCategorizationProgress(progress)
      );
      
      setCategorySuggestions(results);
      soundEffects.success();
    } catch (error) {
      console.error('Error during batch categorization:', error);
    } finally {
      setIsCategorizingAll(false);
      setCategorizationProgress(null);
    }
  };
  
  // Handle individual category change
  const handleCategoryChange = (duplicateKey: string, category: string) => {
    setUserCategories(prev => {
      const next = new Map(prev);
      next.set(duplicateKey, category);
      return next;
    });
  };
  
  // Get the effective category for a transaction
  const getEffectiveCategory = (transaction: ProcessedTransaction): string => {
    return userCategories.get(transaction.duplicateKey) 
      || categorySuggestions.get(transaction.duplicateKey) 
      || transaction.category;
  };
  
  // Check if category is from AI
  const isAiCategory = (duplicateKey: string): boolean => {
    return !userCategories.has(duplicateKey) && categorySuggestions.has(duplicateKey);
  };

  const handleConfirmImport = async () => {
    if (!processedResult) return;
    
    setIsImporting(true);
    soundEffects.success();
    
    // Animate progress
    const selected = processedResult.newTransactions
      .filter(t => selectedIds.has(t.duplicateKey))
      .map(t => ({
        ...t,
        category: getEffectiveCategory(t),
        aiSuggestedCategory: categorySuggestions.get(t.duplicateKey),
      }));
    
    // Record categorization history for learning
    selected.forEach(t => {
      if (categorySuggestions.has(t.duplicateKey)) {
        const aiSuggested = categorySuggestions.get(t.duplicateKey);
        const userSelected = userCategories.get(t.duplicateKey) || aiSuggested;
        if (aiSuggested && userSelected) {
          recordCategorization(t.rawText, aiSuggested, userSelected, t.amount);
        }
      }
    });
    
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setImportProgress(i);
    }
    
    onConfirmImport(selected);
    
    setIsImporting(false);
    setImportProgress(0);
    onOpenChange(false);
  };

  if (!processedResult) return null;

  const { newTransactions, duplicates } = processedResult;
  const selectedCount = selectedIds.size;
  const totalNew = newTransactions.length;
  const totalDuplicates = duplicates.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Scout Report Received
          </DialogTitle>
          <DialogDescription className="sr-only">
            Review and confirm imported transactions from the Zero Hero Connector
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="flex flex-wrap gap-3 py-3 border-b">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {totalNew} New
          </Badge>
          {totalDuplicates > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {totalDuplicates} Duplicates (skipped)
            </Badge>
          )}
          {categorySuggestions.size > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              {categorySuggestions.size} Categorized
            </Badge>
          )}
          <div className="ml-auto text-sm text-muted-foreground">
            {selectedCount} of {totalNew} selected
          </div>
        </div>

        {/* AI Categorization Progress */}
        <AnimatePresence>
          {isCategorizingAll && categorizationProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">
                  Analyzing {categorizationProgress.current} of {categorizationProgress.total}...
                </span>
              </div>
              <Progress 
                value={(categorizationProgress.current / categorizationProgress.total) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1 truncate">
                "{categorizationProgress.currentDescription}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Importing Progress */}
        <AnimatePresence>
          {isImporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Uploading Intel...</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction List */}
        {!isImporting && !isCategorizingAll && (
          <>
            <div className="flex items-center justify-between py-2 gap-2 flex-wrap">
              <span className="text-sm font-medium">Incoming Transactions</span>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCategorizeAll}
                  disabled={isCategorizingAll || newTransactions.length === 0}
                  className="gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  AI Categorize
                </Button>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-[300px] max-h-[400px] border rounded-lg">
              <div className="p-2 space-y-1">
                {newTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>All transactions appear to be duplicates.</p>
                  </div>
                ) : (
                  newTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.duplicateKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        selectedIds.has(transaction.duplicateKey)
                          ? "bg-primary/5 border-primary/30"
                          : "bg-muted/30 border-transparent"
                      )}
                    >
                      <Checkbox
                        id={`tx-${transaction.duplicateKey}`}
                        checked={selectedIds.has(transaction.duplicateKey)}
                        onCheckedChange={() => toggleTransaction(transaction.duplicateKey)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {transaction.date}
                          </span>
                          <CategoryBadgeSelect
                            value={getEffectiveCategory(transaction)}
                            onChange={(cat) => handleCategoryChange(transaction.duplicateKey, cat)}
                            aiSuggested={categorySuggestions.get(transaction.duplicateKey)}
                            isAiCategory={isAiCategory(transaction.duplicateKey)}
                          />
                        </div>
                      </div>
                      
                      <div className={cn(
                        "text-right font-mono font-medium text-sm whitespace-nowrap",
                        transaction.flow === 'in' ? 'text-success' : 'text-foreground'
                      )}>
                        {transaction.flow === 'in' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Duplicates Section */}
            {duplicates.length > 0 && (
              <div className="pt-3 border-t">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-muted-foreground flex items-center gap-2">
                    <Trash2 className="h-3 w-3" />
                    {duplicates.length} duplicate(s) will be skipped
                    <span className="text-xs">(click to expand)</span>
                  </summary>
                  <div className="mt-2 space-y-1 pl-5 max-h-32 overflow-auto">
                    {duplicates.map(t => (
                      <div key={t.duplicateKey} className="text-xs text-muted-foreground">
                        {t.date} - {t.description.slice(0, 40)}... ({formatCurrency(t.amount)})
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </>
        )}

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmImport} 
            disabled={selectedCount === 0 || isImporting}
            className="min-w-[140px]"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Importing...
              </>
            ) : (
              `Confirm Import (${selectedCount})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
