import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartInsight } from '@/components/ChartInsight';
import { DataFreshnessIndicator } from '@/components/DataFreshnessIndicator';
import { useLocalSubscriptions } from '@/hooks/useLocalSubscriptions';
import { useLocalAccounts } from '@/hooks/useLocalAccounts';
import { formatCurrency } from '@/lib/constants';
import { format, subMonths, startOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CreditCard } from 'lucide-react';

export function SubscriptionsReport() {
  const {
    subscriptions,
    getTotalMonthlySpend,
  } = useLocalSubscriptions();

  const { getActiveAccounts, getAccountById } = useLocalAccounts();
  const accounts = getActiveAccounts();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

  // Generate chart data for the last 6 months
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(startOfMonth(new Date()), i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // For now, use current subscriptions (in a real app, you'd have historical data)
      const monthlySpend = subscriptions
        .filter(sub => sub.is_active)
        .reduce((total, sub) => {
          const cycleFactor = sub.billing_cycle === 'yearly' ? 1/12 : 1;
          return total + (sub.amount * cycleFactor);
        }, 0);
      
      data.push({
        month: format(date, 'MMM yyyy'),
        amount: monthlySpend,
      });
    }
    return data;
  }, [subscriptions]);

  // Get current month subscription spending by service
  const currentMonthSpend = subscriptions
    .filter(s => s.is_active && (selectedAccountId === 'all' || s.id === selectedAccountId))
    .map(s => ({
      subscriptionName: s.name,
      totalSpent: s.billing_cycle === 'yearly' ? s.amount / 12 : s.amount,
    }));
  
  const pieData = currentMonthSpend.map((spend, index) => ({
    name: spend.subscriptionName,
    value: spend.totalSpent,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  // Get all active subscriptions with monthly equivalents
  const subscriptionTable = useMemo(() => {
    return subscriptions
      .filter(s => selectedAccountId === 'all' || s.id === selectedAccountId)
      .map(subscription => {
        const monthlyEquivalent = subscription.billing_cycle === 'yearly' ? subscription.amount / 12 : subscription.amount;
        const accountName = 'N/A'; // Will be implemented when account mapping is available
        
        return {
          ...subscription,
          monthlyEquivalent,
          accountName,
        };
      })
      .sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
  }, [subscriptions, selectedAccountId]);

  // Generate insights
  const subscriptionInsight = useMemo(() => {
    const activeCount = subscriptions.filter(s => s.is_active).length;
    const totalMonthly = getTotalMonthlySpend();
    
    if (activeCount === 0) return "Add your subscriptions to track recurring expenses and identify potential savings.";
    if (activeCount > 10) return `You have ${activeCount} active subscriptions. Consider auditing for unused services.`;
    if (totalMonthly > 200) return `Your monthly subscription commitment is ${formatCurrency(totalMonthly)}. Look for optimization opportunities.`;
    return `You're managing ${activeCount} subscriptions effectively.`;
  }, [subscriptions, getTotalMonthlySpend]);

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case 'paused':
        return <Badge className="bg-warning/10 text-warning">Paused</Badge>;
      case 'canceled':
        return <Badge className="bg-destructive/10 text-destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalCurrentMonth = currentMonthSpend.reduce((sum, s) => sum + s.totalSpent, 0);
  const totalMonthlyCommitment = subscriptionTable
    .filter(s => s.is_active)
    .reduce((sum, s) => sum + s.monthlyEquivalent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Report</h1>
          <div className="flex items-center gap-2">
            <DataFreshnessIndicator isLive />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              const label = format(date, 'MMMM yyyy');
              return (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">This Month Actual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentMonth)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthSpend.length} subscription{currentMonthSpend.length !== 1 ? 's' : ''} charged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Monthly Commitment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCommitment)}</div>
            <p className="text-xs text-muted-foreground">
              Expected from active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptionTable.filter(s => s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total subscriptions: {subscriptionTable.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>6-Month Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                    labelClassName="text-foreground"
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Current Month Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')} Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Spent']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No subscription charges found for this month
              </div>
            )}
            
            <div className="mt-4">
              <ChartInsight insight={subscriptionInsight} type="info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Monthly Equivalent</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Next Charge</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionTable.map(subscription => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.name}</div>
                      {subscription.category !== 'Subscriptions' && (
                        <div className="text-xs text-muted-foreground">{subscription.category}</div>
                      )}
                    </div>
                  </TableCell>
                   <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                   <TableCell className="capitalize">{subscription.billing_cycle}</TableCell>
                   <TableCell className="font-medium">
                     {formatCurrency(subscription.monthlyEquivalent)}
                   </TableCell>
                   <TableCell>{subscription.accountName}</TableCell>
                   <TableCell>
                     {subscription.next_billing_date && format(new Date(subscription.next_billing_date), 'MMM d, yyyy')}
                   </TableCell>
                   <TableCell>{getStatusBadge(subscription.is_active ? 'active' : 'inactive')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}