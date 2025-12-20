import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionSuggestion } from '@/types/subscriptions';
import { formatCurrency } from '@/lib/constants';
import { CheckCircle, X, TrendingUp } from 'lucide-react';

interface SubscriptionSuggestionListProps {
  suggestions: SubscriptionSuggestion[];
  onAccept: (suggestion: SubscriptionSuggestion) => void;
  onIgnore: (suggestionId: string) => void;
}

export function SubscriptionSuggestionList({ 
  suggestions, 
  onAccept, 
  onIgnore 
}: SubscriptionSuggestionListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-success/10 text-success';
    if (confidence >= 0.6) return 'bg-warning/10 text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      case 'weekly': return 'Weekly';
      default: return 'Custom';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Detected Subscriptions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          We found {suggestions.length} potential subscription{suggestions.length !== 1 ? 's' : ''} based on your transaction history.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">{suggestion.merchantName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatCurrency(suggestion.expectedAmount)}</span>
                  <Badge variant="outline" className="text-xs">
                    {getCycleLabel(suggestion.cycle)}
                  </Badge>
                  <Badge 
                    className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                  >
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onIgnore(suggestion.id)}
                  className="h-8 px-3"
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAccept(suggestion)}
                  className="h-8 px-3"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Found {suggestion.matchingTransactions.length} matching transaction{suggestion.matchingTransactions.length !== 1 ? 's' : ''}
              {suggestion.merchantKeywords.length > 0 && (
                <span className="ml-2">
                  Keywords: {suggestion.merchantKeywords.slice(0, 3).join(', ')}
                  {suggestion.merchantKeywords.length > 3 && '...'}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}