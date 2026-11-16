import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, Plus, Trash2, TrendingDown } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { calculatePayoffPlan, type DebtItem, type PayoffPlan } from '@/lib/debtCalculations';

const MAX_DEBTS = 10;
const blankDebt = (): DebtItem => ({ id: crypto.randomUUID(), name: '', balance: 0, apr: 0, min: 0, type: 'debt' });
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
const isPaidOff = (plan: PayoffPlan) => plan.priorityOrder.every(debt => debt.payoffMonth !== null);
const payoffDate = (plan: PayoffPlan) => new Date(new Date().getFullYear(), new Date().getMonth() + plan.months - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function DebtPayoffCalculator() {
  const [debts, setDebts] = useState<DebtItem[]>([blankDebt()]);
  const [extra, setExtra] = useState('');
  const [hourlyPay, setHourlyPay] = useState('');
  const [results, setResults] = useState<{ snowball: PayoffPlan; avalanche: PayoffPlan; baseline: PayoffPlan } | null>(null);

  const updateDebt = (id: string, field: keyof Pick<DebtItem, 'name' | 'balance' | 'apr' | 'min'>, value: string) => {
    setDebts(current => current.map(debt => debt.id === id ? { ...debt, [field]: field === 'name' ? value : Number(value) } : debt));
    setResults(null);
  };
  const addDebt = () => {
    setDebts(current => current.length < MAX_DEBTS ? [...current, blankDebt()] : current);
    setResults(null);
  };
  const wage = Number(hourlyPay);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Debt-Free Date Calculator: Snowball vs Avalanche | Zero Hero" description="Free calculator: add your debts and see your debt-free date, total interest and the work hours you get back with snowball or avalanche. No sign-up." path="/debt-payoff-calculator" />
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
          <Link to="/" aria-label="Zero Hero home" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Logo variant="dark" className="h-8 dark:hidden" />
            <Logo className="hidden h-8 dark:block" />
          </Link>
          <Button asChild variant="outline" className="min-h-11"><Link to="/"><Home className="mr-2 h-4 w-4" aria-hidden="true" />Home</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-12 px-4 py-12 lg:px-8">
        <section aria-labelledby="calculator-title" className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary"><TrendingDown className="h-5 w-5" aria-hidden="true" />Your debt-free date</div>
            <h1 id="calculator-title" className="text-3xl font-bold lg:text-4xl">Debt payoff calculator</h1>
            <p className="text-lg text-muted-foreground">Compare snowball and avalanche. Find a payoff plan you can stick with.</p>
            <p className="text-sm text-muted-foreground">No sign-up. Your entries stay in this page and are not saved or sent to our servers.</p>
          </div>
          <form className="space-y-6" onSubmit={event => {
            event.preventDefault();
            setResults({
              snowball: calculatePayoffPlan(debts, Number(extra), 'Snowball'),
              avalanche: calculatePayoffPlan(debts, Number(extra), 'Avalanche'),
              baseline: calculatePayoffPlan(debts, 0, 'Snowball', false),
            });
          }}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Your debts <span className="text-sm font-normal text-muted-foreground">({debts.length}/10)</span></h2>
              <Button type="button" variant="outline" onClick={addDebt} disabled={debts.length >= MAX_DEBTS} className="min-h-11"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Add debt</Button>
            </div>
            <div className="space-y-4">
              {debts.map((debt, index) => (
                <fieldset key={debt.id} className="rounded-lg border border-border bg-card p-4 lg:p-6">
                  <legend className="px-2 text-sm font-semibold">Debt {index + 1}</legend>
                  <div className="grid items-end gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
                    <div className="space-y-2"><Label htmlFor={`${debt.id}-name`}>Name</Label><Input id={`${debt.id}-name`} value={debt.name} placeholder="e.g. Credit card" maxLength={100} onChange={event => updateDebt(debt.id, 'name', event.target.value)} className="h-11" /></div>
                    <div className="space-y-2"><Label htmlFor={`${debt.id}-balance`}>Balance</Label><CurrencyInput id={`${debt.id}-balance`} prefix="$" min="0.01" step="0.01" required value={debt.balance || ''} onChange={event => updateDebt(debt.id, 'balance', event.target.value)} className="h-11" /></div>
                    <div className="space-y-2"><Label htmlFor={`${debt.id}-apr`}>Interest rate (APR)</Label><CurrencyInput id={`${debt.id}-apr`} suffix="%" min="0" max="100" step="0.01" required value={debt.apr} onChange={event => updateDebt(debt.id, 'apr', event.target.value)} className="h-11" /></div>
                    <div className="space-y-2"><Label htmlFor={`${debt.id}-min`}>Minimum payment</Label><CurrencyInput id={`${debt.id}-min`} prefix="$" min="0.01" step="0.01" required value={debt.min || ''} onChange={event => updateDebt(debt.id, 'min', event.target.value)} className="h-11" /></div>
                    <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-destructive" title={`Remove debt ${index + 1}`} aria-label={`Remove debt ${index + 1}`} disabled={debts.length === 1} onClick={() => { setDebts(current => current.filter(item => item.id !== debt.id)); setResults(null); }}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="extra-payment">Extra monthly payment</Label><CurrencyInput id="extra-payment" prefix="$" min="0" step="0.01" value={extra} onChange={event => { setExtra(event.target.value); setResults(null); }} className="h-11" /><p className="text-sm text-muted-foreground">In addition to all minimum payments.</p></div>
              <div className="space-y-2"><Label htmlFor="hourly-pay">Hourly pay (optional)</Label><CurrencyInput id="hourly-pay" prefix="$" min="0.01" step="0.01" value={hourlyPay} onChange={event => setHourlyPay(event.target.value)} className="h-11" /><p className="text-sm text-muted-foreground">Use your take-home pay per hour.</p></div>
            </div>
            <Button type="submit" size="lg" className="min-h-11">Compare payoff plans<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button>
          </form>
        </section>
        {results && (
          <section aria-labelledby="results-title" className="space-y-6" aria-live="polite">
            <div className="space-y-2"><h2 id="results-title" className="text-2xl font-semibold">Two paths. One debt-free future.</h2><p className="text-muted-foreground">Total debt: {money(results.snowball.totalDebt)} · Extra each month: {money(Number(extra))}</p></div>
            <div className="grid gap-6 lg:grid-cols-2">
              {(['snowball', 'avalanche'] as const).map(method => {
                const plan = results[method];
                const paidOff = isPaidOff(plan);
                const hoursSaved = isPaidOff(results.baseline) && paidOff && wage > 0 ? Math.max(0, results.baseline.totalInterest - plan.totalInterest) / wage : null;
                return (
                  <Card key={method} className="rounded-lg border-border bg-card shadow-royal" aria-label={`${method} results`}>
                    <CardContent className="space-y-6 p-6">
                      <div><h3 className="text-xl font-semibold capitalize text-primary">{method}</h3><p className="mt-2 text-sm text-muted-foreground">{method === 'snowball' ? 'Smallest balance first' : 'Highest interest rate first'}</p></div>
                      {paidOff ? <dl className="space-y-4"><div><dt className="text-sm text-muted-foreground">Debt-free by</dt><dd className="text-2xl font-bold" data-testid={`${method}-date`}>{payoffDate(plan)}</dd></div><div className="flex justify-between gap-4"><dt>Months to payoff</dt><dd className="font-semibold tabular-nums" data-testid={`${method}-months`}>{plan.months}</dd></div><div className="flex justify-between gap-4"><dt>Total interest paid</dt><dd className="font-semibold tabular-nums" data-testid={`${method}-interest`}>{money(plan.totalInterest)}</dd></div></dl> : <p role="status">Not paid off within 50 years. Increase your monthly payment to get a debt-free date.</p>}
                      {wage > 0 && <div className="border-t border-border pt-4"><p className="font-semibold text-primary" data-testid={`${method}-hours`}>{hoursSaved === null ? 'Work hours saved unavailable' : `${hoursSaved.toLocaleString('en-US', { maximumFractionDigits: 1 })} work hours saved`}</p><p className="mt-2 text-sm text-muted-foreground">Interest savings divided by hourly pay, compared with minimum payments only.</p></div>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">Estimates use monthly interest, fixed minimum payments, and your extra payment starting this month. They exclude fees, rate changes, and new borrowing. This is an estimate, not financial advice.</p>
            <Button asChild size="lg" className="min-h-11"><Link to="/onboarding">Save your plan free<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
          </section>
        )}
        <section className="border-t border-border pt-12" aria-labelledby="guide-title">
          <div className="max-w-3xl space-y-6">
            <h2 id="guide-title" className="text-2xl font-semibold">Snowball vs avalanche: which is right for you?</h2>
            <p className="leading-relaxed text-muted-foreground">Both methods give every debt its minimum payment, then send extra money to one debt at a time. The difference is which debt goes first. A clear order helps you make progress without having to decide again every month. Neither method requires a perfect budget; start with an extra payment you can afford consistently.</p>
            <h3 className="text-xl font-semibold">Snowball: build momentum</h3>
            <p className="leading-relaxed text-muted-foreground">Snowball targets your smallest balance first, regardless of its interest rate. Clearing a small debt can give you an early win and one fewer bill to manage. This may help if a long list of debts feels overwhelming or you have struggled to keep a plan going. The trade-off is that higher-rate balances may collect more interest while you focus on smaller ones.</p>
            <h3 className="text-xl font-semibold">Avalanche: focus on interest</h3>
            <p className="leading-relaxed text-muted-foreground">Avalanche targets the debt with the highest interest rate first. Reducing that balance sooner generally cuts interest costs. It is a good fit if saving money is your main motivation and you are comfortable waiting longer for your first account to reach zero. When rates match, a smaller balance can be a useful next target.</p>
            <h3 className="text-xl font-semibold">Choose a sustainable payment</h3>
            <p className="leading-relaxed text-muted-foreground">Compare the dates and interest totals above, but also consider which plan you will follow. Keep enough money for essentials and unexpected expenses before increasing payments. Check your statements for accurate balances, rates, and minimums. Your lender may calculate interest differently, so treat these results as estimates rather than promises.</p>
            <p className="leading-relaxed text-muted-foreground">The calculator already rolls each paid-off debt's payment into the next debt. Revisit the calculator when your income or rates change. If you enter hourly pay, the hours shown translate estimated interest savings into working time, not a guarantee of fewer hours at your job.</p>
          </div>
        </section>
      </main>
    </div>
  );
}