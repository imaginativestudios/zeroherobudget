import { ChevronDown, Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMockHouseholds as useHouseholds } from '@/hooks/useMockHouseholds';

export function HouseholdSelector() {
  const { households, currentHousehold, setCurrentHousehold } = useHouseholds();

  const selectedHousehold = households.find(h => h.id === currentHousehold);

  if (households.length === 0) {
    return null;
  }

  // If only one household, show a simple button without dropdown
  if (households.length === 1) {
    return (
      <Button variant="outline" className="w-[200px] justify-start">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4" aria-hidden="true" />
          <span className="truncate">
            {selectedHousehold?.name || households[0]?.name}
          </span>
        </div>
      </Button>
    );
  }

  // Multiple households - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">
              {selectedHousehold?.name || 'Select Household'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {households.map((household) => (
          <DropdownMenuItem
            key={household.id}
            onClick={() => setCurrentHousehold(household.id)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">{household.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}