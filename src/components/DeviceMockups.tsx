import { DollarSign, TrendingUp, TrendingDown, Target, Receipt, Trophy } from "lucide-react";

export function DeviceMockups() {
  return (
    <div className="relative flex items-end justify-center gap-4 lg:gap-8">
      {/* Desktop Monitor */}
      <div className="relative">
        {/* Monitor Frame */}
        <div className="relative bg-foreground/90 rounded-lg p-2 shadow-2xl">
          {/* Screen */}
          <div className="w-[280px] sm:w-[400px] lg:w-[520px] h-[175px] sm:h-[250px] lg:h-[325px] bg-background rounded overflow-hidden">
            {/* Dashboard Content */}
            <div className="h-full flex">
              {/* Mini Sidebar */}
              <div className="w-12 lg:w-16 bg-primary flex flex-col items-center py-2 lg:py-3 gap-2">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-accent/80" />
                <div className="space-y-2 lg:space-y-3 mt-2 lg:mt-4">
                  {[DollarSign, Target, Receipt, Trophy].map((Icon, i) => (
                    <div key={i} className={`w-6 h-6 lg:w-8 lg:h-8 rounded flex items-center justify-center ${i === 0 ? 'bg-sidebar-accent' : 'bg-primary-light/30'}`}>
                      <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-2 lg:p-4 bg-gradient-to-br from-background to-secondary/30">
                {/* Header */}
                <div className="flex justify-between items-center mb-2 lg:mb-4">
                  <div className="h-3 lg:h-4 w-20 lg:w-32 bg-foreground/20 rounded" />
                  <div className="flex gap-1 lg:gap-2">
                    <div className="w-4 h-4 lg:w-6 lg:h-6 rounded-full bg-accent/50" />
                    <div className="w-4 h-4 lg:w-6 lg:h-6 rounded-full bg-muted" />
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-1 lg:gap-2 mb-2 lg:mb-4">
                  <div className="bg-card rounded p-1 lg:p-2 border border-border/50">
                    <div className="text-[6px] lg:text-[8px] text-muted-foreground">Income</div>
                    <div className="text-[8px] lg:text-xs font-bold text-success flex items-center gap-0.5">
                      <TrendingUp className="w-2 h-2 lg:w-3 lg:h-3" />
                      $4,500
                    </div>
                  </div>
                  <div className="bg-card rounded p-1 lg:p-2 border border-border/50">
                    <div className="text-[6px] lg:text-[8px] text-muted-foreground">Expenses</div>
                    <div className="text-[8px] lg:text-xs font-bold text-destructive flex items-center gap-0.5">
                      <TrendingDown className="w-2 h-2 lg:w-3 lg:h-3" />
                      $2,850
                    </div>
                  </div>
                  <div className="bg-card rounded p-1 lg:p-2 border border-border/50">
                    <div className="text-[6px] lg:text-[8px] text-muted-foreground">Savings</div>
                    <div className="text-[8px] lg:text-xs font-bold text-primary">$1,650</div>
                  </div>
                </div>
                
                {/* Chart Area */}
                <div className="bg-card rounded p-1 lg:p-2 border border-border/50 h-16 lg:h-28">
                  <div className="text-[6px] lg:text-[8px] text-muted-foreground mb-1">Budget Overview</div>
                  <div className="flex items-end justify-around h-10 lg:h-20 gap-1">
                    {[65, 45, 80, 55, 70, 40].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-3 lg:w-6 rounded-t bg-gradient-to-t from-primary to-primary-light"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Monitor Stand */}
        <div className="mx-auto w-16 lg:w-24 h-3 lg:h-4 bg-foreground/80 rounded-b" />
        <div className="mx-auto w-24 lg:w-36 h-1.5 lg:h-2 bg-foreground/70 rounded-b-lg" />
      </div>
      
      {/* Mobile Phone */}
      <div className="relative -mb-4 lg:-mb-8">
        {/* Phone Frame */}
        <div className="relative bg-foreground/90 rounded-2xl lg:rounded-3xl p-1.5 lg:p-2 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-2 lg:top-3 left-1/2 -translate-x-1/2 w-12 lg:w-16 h-2 lg:h-3 bg-foreground/90 rounded-full z-10" />
          
          {/* Screen */}
          <div className="w-[100px] sm:w-[120px] lg:w-[160px] h-[180px] sm:h-[220px] lg:h-[300px] bg-background rounded-xl lg:rounded-2xl overflow-hidden">
            {/* Mobile Dashboard */}
            <div className="h-full p-2 lg:p-3 bg-gradient-to-br from-background to-secondary/30">
              {/* Mobile Header */}
              <div className="flex justify-between items-center mb-2 lg:mb-3 pt-2 lg:pt-3">
                <div className="w-4 h-4 lg:w-6 lg:h-6 rounded bg-primary flex items-center justify-center">
                  <DollarSign className="w-2 h-2 lg:w-3 lg:h-3 text-white" />
                </div>
                <div className="h-2 lg:h-3 w-12 lg:w-16 bg-foreground/20 rounded" />
                <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-accent/50" />
              </div>
              
              {/* Mobile Stats */}
              <div className="space-y-1.5 lg:space-y-2 mb-2 lg:mb-3">
                <div className="bg-card rounded p-1.5 lg:p-2 border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[6px] lg:text-[8px] text-muted-foreground">Available</span>
                    <span className="text-[8px] lg:text-xs font-bold text-success">$1,650</span>
                  </div>
                  <div className="mt-1 h-1 lg:h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-success to-success/70 rounded-full" />
                  </div>
                </div>
                <div className="bg-card rounded p-1.5 lg:p-2 border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[6px] lg:text-[8px] text-muted-foreground">Debt Progress</span>
                    <span className="text-[8px] lg:text-xs font-bold text-primary">62%</span>
                  </div>
                  <div className="mt-1 h-1 lg:h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-primary to-primary-light rounded-full" />
                  </div>
                </div>
              </div>
              
              {/* Mini Pie Chart */}
              <div className="bg-card rounded p-1.5 lg:p-2 border border-border/50">
                <div className="text-[6px] lg:text-[8px] text-muted-foreground mb-1">Spending</div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-[3px] lg:border-4 border-primary relative">
                    <div className="absolute inset-1 lg:inset-1.5 rounded-full border-[3px] lg:border-4 border-accent border-t-transparent border-l-transparent rotate-45" />
                  </div>
                  <div className="space-y-0.5 lg:space-y-1 text-[5px] lg:text-[7px]">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Housing 35%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-accent" />
                      <span className="text-muted-foreground">Food 25%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-3" />
                      <span className="text-muted-foreground">Other 40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
