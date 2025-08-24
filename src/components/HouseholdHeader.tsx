import { HouseholdSelector } from './HouseholdSelector';
import { InvitationForm } from './InvitationForm';

export function HouseholdHeader() {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Household Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your shared financial household and invite family members
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <HouseholdSelector />
          <InvitationForm />
        </div>
      </div>
    </div>
  );
}