import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CategorySuggestionProps {
  description: string;
  amount?: number;
  onSuggestionAccepted: (category: string) => void;
  currentCategory?: string;
}

export const CategorySuggestion = ({
  description,
  amount,
  onSuggestionAccepted,
  currentCategory,
}: CategorySuggestionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const getSuggestion = async () => {
    if (!description || description.length < 3) {
      toast({
        title: "Description required",
        description: "Please enter a transaction description first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('categorize-transaction', {
        body: { description, amount },
      });

      if (error) {
        console.error("Categorization error:", error);
        toast({
          title: "Categorization failed",
          description: error.message || "Failed to suggest category",
          variant: "destructive",
        });
        return;
      }

      if (data?.category) {
        setSuggestion(data.category);
        toast({
          title: "Category suggested",
          description: `AI suggests: ${data.category}`,
        });
      }
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get category suggestion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      onSuggestionAccepted(suggestion);
      setSuggestion(null);
      toast({
        title: "Category applied",
        description: `Transaction categorized as ${suggestion}`,
      });
    }
  };

  const dismissSuggestion = () => {
    setSuggestion(null);
  };

  return (
    <div className="space-y-2">
      {!suggestion ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getSuggestion}
          disabled={isLoading || !description}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isLoading ? "Analyzing..." : "Suggest Category"}
        </Button>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border animate-fade-in">
          <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
          <span className="text-sm flex-1">
            AI suggests: <Badge variant="outline" className="ml-1">{suggestion}</Badge>
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={acceptSuggestion}
            >
              Apply
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={dismissSuggestion}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
