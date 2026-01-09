import { User, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useHouseholdView } from '@/contexts/HouseholdViewContext';
import { useHouseholds } from '@/hooks/useHouseholds';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function HouseholdViewToggle() {
  const { viewMode, setViewMode, isHouseholdView, canToggle } = useHouseholdView();
  const { members } = useHouseholds();

  // Don't render if user can't toggle (no household members)
  if (!canToggle) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    setViewMode(checked ? 'household' : 'personal');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border">
          <User 
            className={`h-4 w-4 transition-colors ${!isHouseholdView ? 'text-primary' : 'text-muted-foreground'}`} 
            aria-hidden="true" 
          />
          <Label 
            htmlFor="household-view-toggle" 
            className={`text-sm cursor-pointer transition-colors ${!isHouseholdView ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            My Data
          </Label>
          <Switch
            id="household-view-toggle"
            checked={isHouseholdView}
            onCheckedChange={handleToggle}
            aria-label="Toggle between personal and household data view"
          />
          <Label 
            htmlFor="household-view-toggle" 
            className={`text-sm cursor-pointer transition-colors ${isHouseholdView ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            Household
          </Label>
          <Users 
            className={`h-4 w-4 transition-colors ${isHouseholdView ? 'text-primary' : 'text-muted-foreground'}`} 
            aria-hidden="true" 
          />
          {isHouseholdView && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({members.length})
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isHouseholdView 
          ? `Viewing combined data from ${members.length} household members` 
          : 'Viewing only your personal data'
        }</p>
      </TooltipContent>
    </Tooltip>
  );
}
