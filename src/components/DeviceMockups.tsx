import { DollarSign, TrendingUp, TrendingDown, Target, AlertTriangle, CreditCard, Trophy, BarChart3, Menu } from "lucide-react";

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
                  {[DollarSign, Target, TrendingDown, Trophy].map((Icon, i) => (
                    <div key={i} className={`w-6 h-6 lg:w-8 lg:h-8 rounded flex items-center justify-center ${i === 0 ? 'bg-sidebar-accent' : 'bg-primary-light/30'}`}>
                      <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-2 lg:p-4 bg-gradient-to-br from-background to-secondary/30 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-2 lg:mb-3">
                  <div className="text-[7px] lg:text-[10px] font-bold text-foreground">Welcome, debt warrior!</div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 px-1 lg:px-1.5 py-0.5 bg-primary rounded text-[5px] lg:text-[7px] text-white font-medium">
                      <TrendingUp className="w-1.5 h-1.5 lg:w-2 lg:h-2" />
                      <span>Reports</span>
                    </div>
                    <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-muted" />
                  </div>
                </div>
                
                {/* Section Divider - Financial Overview */}
                <div className="flex items-center gap-1 mb-1.5 lg:mb-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="text-[5px] lg:text-[7px] text-muted-foreground font-medium">Financial Overview</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                {/* Financial Cards - 5 Cards Grid */}
                <div className="grid grid-cols-5 gap-0.5 lg:gap-1 mb-2 lg:mb-3">
                  {/* Monthly Income */}
                  <div className="bg-card rounded p-0.5 lg:p-1.5 border border-border/50">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 rounded bg-success/20 flex items-center justify-center">
                        <DollarSign className="w-1 h-1 lg:w-1.5 lg:h-1.5 text-success" />
                      </div>
                      <span className="text-[4px] lg:text-[6px] text-muted-foreground truncate">Income</span>
                    </div>
                    <div className="text-[6px] lg:text-[9px] font-bold text-success">$4,500</div>
                  </div>
                  
                  {/* Planned Expenses */}
                  <div className="bg-card rounded p-0.5 lg:p-1.5 border border-border/50">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 rounded bg-muted flex items-center justify-center">
                        <TrendingUp className="w-1 h-1 lg:w-1.5 lg:h-1.5 text-muted-foreground" />
                      </div>
                      <span className="text-[4px] lg:text-[6px] text-muted-foreground truncate">Expenses</span>
                    </div>
                    <div className="text-[6px] lg:text-[9px] font-bold text-foreground">$2,850</div>
                  </div>
                  
                  {/* Subscriptions */}
                  <div className="bg-card rounded p-0.5 lg:p-1.5 border border-border/50">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 rounded bg-muted flex items-center justify-center">
                        <CreditCard className="w-1 h-1 lg:w-1.5 lg:h-1.5 text-muted-foreground" />
                      </div>
                      <span className="text-[4px] lg:text-[6px] text-muted-foreground truncate">Subs</span>
                    </div>
                    <div className="text-[6px] lg:text-[9px] font-bold text-foreground">$185</div>
                  </div>
                  
                  {/* Available for Debt */}
                  <div className="bg-card rounded p-0.5 lg:p-1.5 border border-border/50">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 rounded bg-success/20 flex items-center justify-center">
                        <Target className="w-1 h-1 lg:w-1.5 lg:h-1.5 text-success" />
                      </div>
                      <span className="text-[4px] lg:text-[6px] text-muted-foreground truncate">Available</span>
                    </div>
                    <div className="text-[6px] lg:text-[9px] font-bold text-success">$1,465</div>
                  </div>
                  
                  {/* Net Worth */}
                  <div className="bg-card rounded p-0.5 lg:p-1.5 border border-border/50">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 rounded bg-success/20 flex items-center justify-center">
                        <AlertTriangle className="w-1 h-1 lg:w-1.5 lg:h-1.5 text-success" />
                      </div>
                      <span className="text-[4px] lg:text-[6px] text-muted-foreground truncate">Net Worth</span>
                    </div>
                    <div className="text-[6px] lg:text-[9px] font-bold text-success">$12,340</div>
                  </div>
                </div>
                
                {/* Section Divider - Analytics */}
                <div className="flex items-center gap-1 mb-1.5 lg:mb-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="text-[5px] lg:text-[7px] text-muted-foreground font-medium">Analytics</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                {/* Analytics Charts Row */}
                <div className="grid grid-cols-2 gap-1 lg:gap-2">
                  {/* Spending by Category - Pie Chart */}
                  <div className="bg-card rounded p-1 lg:p-2 border border-border/50">
                    <div className="flex items-center gap-0.5 mb-1">
                      <BarChart3 className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-accent" />
                      <span className="text-[5px] lg:text-[7px] text-foreground font-medium">Spending by Category</span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2">
                      {/* Donut Chart */}
                      <div className="relative w-10 h-10 lg:w-14 lg:h-14 flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          {/* Housing - 35% */}
                          <circle
                            cx="18" cy="18" r="12"
                            fill="none"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth="6"
                            strokeDasharray="35 65"
                            strokeDashoffset="0"
                          />
                          {/* Food - 25% */}
                          <circle
                            cx="18" cy="18" r="12"
                            fill="none"
                            stroke="hsl(var(--chart-4))"
                            strokeWidth="6"
                            strokeDasharray="25 75"
                            strokeDashoffset="-35"
                          />
                          {/* Transport - 20% */}
                          <circle
                            cx="18" cy="18" r="12"
                            fill="none"
                            stroke="hsl(var(--chart-3))"
                            strokeWidth="6"
                            strokeDasharray="20 80"
                            strokeDashoffset="-60"
                          />
                          {/* Other - 20% */}
                          <circle
                            cx="18" cy="18" r="12"
                            fill="none"
                            stroke="hsl(var(--chart-2))"
                            strokeWidth="6"
                            strokeDasharray="20 80"
                            strokeDashoffset="-80"
                          />
                        </svg>
                      </div>
                      {/* Legend */}
                      <div className="space-y-0.5 text-[4px] lg:text-[6px] flex-1">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-1" />
                          <span className="text-muted-foreground">Housing 35%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-4" />
                          <span className="text-muted-foreground">Food 25%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-3" />
                          <span className="text-muted-foreground">Transport 20%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-2" />
                          <span className="text-muted-foreground">Other 20%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Debt Payoff Projection - Line Chart */}
                  <div className="bg-card rounded p-1 lg:p-2 border border-border/50">
                    <div className="flex items-center gap-0.5 mb-1">
                      <TrendingDown className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-accent" />
                      <span className="text-[5px] lg:text-[7px] text-foreground font-medium">Debt Payoff Projection</span>
                    </div>
                    {/* Line Chart SVG */}
                    <div className="relative h-8 lg:h-12">
                      <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="0" y1="20" x2="100" y2="20" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="0" y1="30" x2="100" y2="30" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
                        
                        {/* Gradient fill under the line */}
                        <defs>
                          <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 5 Q 15 8, 25 12 T 50 20 T 75 30 T 100 38 L 100 40 L 0 40 Z"
                          fill="url(#debtGradient)"
                        />
                        
                        {/* Line */}
                        <path
                          d="M 0 5 Q 15 8, 25 12 T 50 20 T 75 30 T 100 38"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        
                        {/* Data points */}
                        <circle cx="0" cy="5" r="2" fill="hsl(var(--primary))" />
                        <circle cx="25" cy="12" r="2" fill="hsl(var(--primary))" />
                        <circle cx="50" cy="20" r="2" fill="hsl(var(--primary))" />
                        <circle cx="75" cy="30" r="2" fill="hsl(var(--primary))" />
                        <circle cx="100" cy="38" r="2" fill="hsl(var(--primary))" />
                      </svg>
                      {/* X-axis labels */}
                      <div className="flex justify-between mt-0.5 text-[4px] lg:text-[5px] text-muted-foreground">
                        <span>Now</span>
                        <span>6mo</span>
                        <span>12mo</span>
                        <span>18mo</span>
                        <span>24mo</span>
                      </div>
                    </div>
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
            <div className="h-full p-2 lg:p-3 bg-gradient-to-br from-background to-secondary/30 overflow-hidden">
              {/* Mobile Header */}
              <div className="flex justify-between items-center mb-2 lg:mb-3 pt-3 lg:pt-4">
                <Menu className="w-3 h-3 lg:w-4 lg:h-4 text-foreground" />
                <div className="text-[6px] lg:text-[8px] font-bold text-foreground">Dashboard</div>
                <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-muted" />
              </div>
              
              {/* Mobile Financial Cards */}
              <div className="space-y-1.5 lg:space-y-2 mb-2 lg:mb-3">
                {/* Available for Debt */}
                <div className="bg-card rounded-lg p-1.5 lg:p-2 border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-success/20 flex items-center justify-center">
                        <Target className="w-1.5 h-1.5 lg:w-2 lg:h-2 text-success" />
                      </div>
                      <span className="text-[6px] lg:text-[8px] text-muted-foreground">Available for Debt</span>
                    </div>
                    <span className="text-[8px] lg:text-[10px] font-bold text-success">$1,465</span>
                  </div>
                  <div className="h-1 lg:h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-gradient-to-r from-success to-success/70 rounded-full" />
                  </div>
                </div>
                
                {/* Net Worth */}
                <div className="bg-card rounded-lg p-1.5 lg:p-2 border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-success/20 flex items-center justify-center">
                        <AlertTriangle className="w-1.5 h-1.5 lg:w-2 lg:h-2 text-success" />
                      </div>
                      <span className="text-[6px] lg:text-[8px] text-muted-foreground">Net Worth</span>
                    </div>
                    <span className="text-[8px] lg:text-[10px] font-bold text-success">$12,340</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[5px] lg:text-[6px] text-success">
                    <TrendingUp className="w-1.5 h-1.5 lg:w-2 lg:h-2" />
                    <span>+8.2% this month</span>
                  </div>
                </div>
              </div>
              
              {/* Mini Pie Chart */}
              <div className="bg-card rounded-lg p-1.5 lg:p-2 border border-border/50 mb-2 lg:mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <BarChart3 className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-accent" />
                  <span className="text-[6px] lg:text-[8px] text-foreground font-medium">Spending</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  {/* Donut Chart */}
                  <div className="relative w-10 h-10 lg:w-14 lg:h-14 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="12" fill="none" stroke="hsl(var(--chart-1))" strokeWidth="6" strokeDasharray="35 65" strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="12" fill="none" stroke="hsl(var(--chart-4))" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-35" />
                      <circle cx="18" cy="18" r="12" fill="none" stroke="hsl(var(--chart-3))" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-60" />
                      <circle cx="18" cy="18" r="12" fill="none" stroke="hsl(var(--chart-2))" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-80" />
                    </svg>
                  </div>
                  {/* Legend */}
                  <div className="space-y-0.5 lg:space-y-1 text-[5px] lg:text-[7px]">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-1" />
                      <span className="text-muted-foreground">Housing 35%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-4" />
                      <span className="text-muted-foreground">Food 25%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-chart-3" />
                      <span className="text-muted-foreground">Other 40%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievements Preview */}
              <div className="bg-card rounded-lg p-1.5 lg:p-2 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-accent/20 flex items-center justify-center">
                      <Trophy className="w-1.5 h-1.5 lg:w-2 lg:h-2 text-accent" />
                    </div>
                    <span className="text-[6px] lg:text-[8px] text-foreground font-medium">Achievements</span>
                  </div>
                  <span className="text-[6px] lg:text-[8px] text-muted-foreground">3/8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
