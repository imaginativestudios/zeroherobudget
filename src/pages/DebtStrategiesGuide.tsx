import { Link } from 'react-router-dom';
import { ArrowRight, Home, TrendingDown } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

export default function DebtStrategiesGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Debt Snowball vs. Debt Avalanche: Which Strategy Is Your Path to Freedom? | Zero Hero"
        description="Compare debt snowball and avalanche: smallest balance or highest interest first, payment rollover, and how to choose a plan you can keep. Try the free calculator."
        path="/learn/debt-strategies"
      />
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
          <Link to="/" aria-label="Zero Hero home" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Logo variant="dark" className="h-8 dark:hidden" />
            <Logo className="hidden h-8 dark:block" />
          </Link>
          <Button asChild variant="outline" className="min-h-11"><Link to="/"><Home className="mr-2 h-4 w-4" aria-hidden="true" />Home</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-12 px-4 py-12 lg:px-8">
        <article className="space-y-12">
          <header className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-medium text-primary"><TrendingDown className="h-5 w-5" aria-hidden="true" />Debt Strategy</p>
            <h1 className="text-3xl font-bold lg:text-4xl">Debt Snowball vs. Debt Avalanche: Which Strategy Is Your Path to Freedom?</h1>
            <p className="text-lg text-muted-foreground">Snowball pays the smallest balance first. Avalanche pays the highest interest rate first. Both keep minimum payments going on every other debt and roll freed payments into the next target.</p>
            <p className="text-sm text-muted-foreground">Updated November 16, 2026 · Educational information, not personalized financial, legal, or tax advice.</p>
            <Button asChild size="lg" className="min-h-11"><Link to="/debt-payoff-calculator">Compare your payoff plans<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
          </header>
          <section aria-labelledby="comparison-heading" className="space-y-6">
            <h2 id="comparison-heading" className="text-2xl font-semibold">The difference at a glance</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4"><h3 className="text-xl font-semibold text-primary">Snowball: build momentum</h3><p className="leading-relaxed text-muted-foreground">List debts from smallest to largest balance, regardless of interest rate. Put your extra payment toward the smallest one. An early payoff means one fewer bill and a visible win, which may help you stay consistent.</p><p className="leading-relaxed text-muted-foreground">The trade-off: a larger, higher-rate balance may keep collecting interest while you clear smaller debts. Snowball can cost more than avalanche with the same payments.</p></div>
              <div className="space-y-4"><h3 className="text-xl font-semibold text-primary">Avalanche: reduce interest</h3><p className="leading-relaxed text-muted-foreground">List debts from highest to lowest interest rate. Put your extra payment toward the highest-rate balance. With the same fixed payment budget and unchanged rates, this generally reduces total interest compared with paying lower-rate debts first.</p><p className="leading-relaxed text-muted-foreground">The trade-off: if the highest-rate debt is large, your first payoff may take longer. Falling balances are progress even before an account reaches zero.</p></div>
            </div>
          </section>
          <section aria-labelledby="rollover-heading" className="space-y-6 border-t border-border pt-12">
            <h2 id="rollover-heading" className="text-2xl font-semibold">Payment rollover is part of both methods</h2>
            <p className="leading-relaxed text-muted-foreground">Start with a monthly budget equal to all original minimum payments plus an affordable extra amount. When one debt is paid off, keep that total budget rather than spending the freed payment elsewhere. Send it to the next debt in your chosen order, on top of that debt's own minimum.</p>
            <p className="leading-relaxed text-muted-foreground">For example, suppose your two minimums are $25 and $60 and you add $25 extra. Your total monthly budget is $110. After the first debt is cleared, up to $110 can go toward the remaining debt—not just its $60 minimum plus the original $25 extra. If the first debt needs less than its allocated payment in its final month, the remainder can also move to the next debt that month.</p>
            <p className="leading-relaxed text-muted-foreground">Zero Hero's calculator uses this fixed-budget rollover for both strategies. Its estimates assume monthly interest and unchanged minimum payments, with no fees, new borrowing, or rate changes. Your lender's actual interest calculation and payment rules may differ.</p>
          </section>
          <section aria-labelledby="choose-heading" className="space-y-6 border-t border-border pt-12">
            <h2 id="choose-heading" className="text-2xl font-semibold">Choose the plan you can follow</h2>
            <p className="leading-relaxed text-muted-foreground">If quick wins help you continue, snowball may be worth its possible extra interest. If lower interest is your strongest motivation, avalanche may fit better. Neither method replaces an affordable budget: protect essentials and leave room for unexpected expenses before committing extra money.</p>
            <ol className="list-decimal space-y-4 pl-6 text-muted-foreground">
              <li>Collect current balances, interest rates, and minimum payments from your statements.</li>
              <li>Compare both strategies with the same extra monthly payment in the calculator.</li>
              <li>Look at months to payoff and total interest, then choose a target you will keep paying.</li>
              <li>Keep all required minimums current and review the plan when your income or rates change.</li>
            </ol>
            <p className="leading-relaxed text-muted-foreground">If you cannot cover minimum payments or have overdue, secured, or disputed debts, a simple payoff order may not address the immediate risks. Contact your lenders about available options and consider qualified nonprofit credit counseling before increasing extra payments.</p>
          </section>
          <section aria-labelledby="questions-heading" className="space-y-6 border-t border-border pt-12">
            <h2 id="questions-heading" className="text-2xl font-semibold">Common questions</h2>
            <h3 className="text-xl font-semibold">Can I change strategies?</h3>
            <p className="leading-relaxed text-muted-foreground">Yes. Recalculate using your current balances and keep required minimums paid. A deliberate change is better than abandoning a plan that no longer fits.</p>
            <h3 className="text-xl font-semibold">What if rates are equal?</h3>
            <p className="leading-relaxed text-muted-foreground">With equal rates, choosing the smaller balance can give you an earlier account payoff. Snowball and avalanche may produce similar or identical interest totals, depending on your debts and payments.</p>
            <h3 className="text-xl font-semibold">Do work hours saved mean fewer hours at my job?</h3>
            <p className="leading-relaxed text-muted-foreground">No. The calculator divides estimated interest savings by your optional hourly pay, compared with minimum payments only without rollover. It expresses money saved as working time; it does not promise changes to your schedule or income.</p>
          </section>
          <section aria-labelledby="next-heading" className="space-y-6 border-t border-border pt-12">
            <h2 id="next-heading" className="text-2xl font-semibold">See your own debt-free date</h2>
            <p className="leading-relaxed text-muted-foreground">Compare snowball and avalanche side by side with your own numbers. The public calculator needs no sign-up and does not save or send your entries to our servers.</p>
            <Button asChild size="lg" className="min-h-11"><Link to="/debt-payoff-calculator">Use the free payoff calculator<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
            <p className="text-sm leading-relaxed text-muted-foreground">Source: the <a href="https://www.consumerfinance.gov/archive/blog/how-reduce-your-debt/" className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Consumer Financial Protection Bureau's debt reduction guide</a> explains the two strategies and their motivation-versus-interest trade-offs.</p>
          </section>
        </article>
      </main>
    </div>
  );
}