import { useState } from "react";
import { Lightbulb, Search, TrendingUp, DollarSign, Target, CreditCard, PiggyBank, AlertTriangle, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type TipCategory = {
  id: string;
  title: string;
  icon: typeof Lightbulb;
  description: string;
  tips: {
    title: string;
    content: string;
    proTip?: string;
  }[];
};

const categories: TipCategory[] = [
  {
    id: "emergency",
    title: "Emergency Fund",
    icon: AlertTriangle,
    description: "Build your financial safety net",
    tips: [
      {
        title: "Why 3-6 Months of Expenses?",
        content: "An emergency fund covers unexpected job loss, medical bills, or major repairs without going into debt. This cushion provides peace of mind and financial stability during challenging times.",
        proTip: "Start with a goal of $1,000, then work toward 3-6 months of essential expenses."
      },
      {
        title: "Where to Keep Your Emergency Fund",
        content: "Store your emergency fund in a high-yield savings account that's easily accessible but separate from your checking account. This prevents impulsive spending while earning interest.",
        proTip: "Look for online banks offering 4-5% APY with no minimum balance requirements."
      },
      {
        title: "Building It Slowly",
        content: "Don't get discouraged if you can't save $10,000 overnight. Even saving $25-50 per paycheck adds up over time. Automate transfers on payday so you 'pay yourself first'.",
        proTip: "Treat your emergency fund contribution like a non-negotiable bill."
      }
    ]
  },
  {
    id: "budgeting",
    title: "Budgeting Basics",
    icon: DollarSign,
    description: "Master the fundamentals of smart spending",
    tips: [
      {
        title: "The 50/30/20 Rule",
        content: "Allocate 50% of income to needs (housing, utilities, food), 30% to wants (entertainment, dining out), and 20% to savings and debt payments. This simple framework balances present enjoyment with future security.",
        proTip: "If you're paying off debt, consider flipping to 50/20/30 to accelerate progress."
      },
      {
        title: "Zero-Based Budgeting",
        content: "Give every dollar a job. Your income minus expenses should equal zero at the end of the month. This doesn't mean spending everything—it means intentionally allocating funds to savings, debt, and future goals.",
        proTip: "Budget for 'unexpected' expenses by creating a miscellaneous category."
      },
      {
        title: "Pay Yourself First",
        content: "Before paying bills or spending on discretionary items, automatically transfer money to savings and investments. This ensures you prioritize your financial future.",
        proTip: "Set up automatic transfers on payday—before you see the money, it's already saved."
      }
    ]
  },
  {
    id: "debt",
    title: "Debt Management",
    icon: Target,
    description: "Strategies for becoming debt-free",
    tips: [
      {
        title: "Good Debt vs. Bad Debt",
        content: "Good debt (like mortgages or student loans) builds assets or earning potential with reasonable interest rates. Bad debt (like high-interest credit cards or payday loans) funds consumption without creating value.",
        proTip: "If your debt has an interest rate above 8%, prioritize paying it off aggressively."
      },
      {
        title: "Snowball vs. Avalanche Explained",
        content: "Snowball method: Pay smallest balances first for quick psychological wins and motivation. Avalanche method: Target highest interest rates first to minimize total interest paid. Both work—choose based on whether you need motivation (snowball) or maximum savings (avalanche).",
        proTip: "Combine methods: Start with snowball for motivation, switch to avalanche once momentum builds."
      },
      {
        title: "Avoiding Debt Traps",
        content: "Stay away from payday loans, rent-to-own schemes, and high-interest store cards. These prey on financial urgency with devastating interest rates (often 300%+ APR). Build your emergency fund to avoid these traps.",
        proTip: "If you need quick cash, ask family, use community resources, or negotiate payment plans with creditors."
      }
    ]
  },
  {
    id: "saving",
    title: "Saving Strategies",
    icon: PiggyBank,
    description: "Build wealth systematically",
    tips: [
      {
        title: "Automate Your Savings",
        content: "Set up automatic transfers from checking to savings on payday. Automation removes willpower from the equation—you save before you can spend. Start small if needed, even $25 per paycheck builds the habit.",
        proTip: "Use separate savings accounts for different goals (emergency, vacation, down payment)."
      },
      {
        title: "High-Yield Savings Accounts",
        content: "Traditional banks often pay less than 0.5% interest. Online banks frequently offer 4-5% APY, meaning your money grows faster without any extra effort. That's free money for being smart about where you park your cash.",
        proTip: "Marcus, Ally, and American Express savings accounts are popular high-yield options."
      },
      {
        title: "Sinking Funds",
        content: "Create mini-savings accounts for predictable irregular expenses: car repairs, insurance premiums, holiday gifts. By saving monthly, you avoid financial stress when these 'expected surprises' arrive.",
        proTip: "Divide your annual irregular expenses by 12 to determine monthly sinking fund contributions."
      }
    ]
  },
  {
    id: "credit",
    title: "Credit Score Mastery",
    icon: CreditCard,
    description: "Understand and improve your credit",
    tips: [
      {
        title: "How Credit Scores Work",
        content: "Your score (300-850) is based on payment history (35%), credit utilization (30%), length of history (15%), credit mix (10%), and new inquiries (10%). Understanding these factors helps you optimize your score strategically.",
        proTip: "Focus on the big two: always pay on time and keep credit utilization below 30%."
      },
      {
        title: "Improving Your Score",
        content: "Pay all bills on time (set up autopay), keep credit card balances below 30% of limits (ideally below 10%), don't close old accounts (length of history matters), and limit new credit applications.",
        proTip: "Request credit limit increases to instantly lower your utilization ratio without changing spending."
      },
      {
        title: "Monitoring Your Credit",
        content: "Check your credit reports annually for free at AnnualCreditReport.com. Many credit cards now offer free credit score monitoring. Catching errors or fraud early protects your financial reputation.",
        proTip: "Dispute errors directly with credit bureaus—they must investigate within 30 days."
      }
    ]
  },
  {
    id: "investing",
    title: "Investing Basics",
    icon: TrendingUp,
    description: "Grow wealth for the long term",
    tips: [
      {
        title: "Start Early, Even Small",
        content: "Thanks to compound interest, investing $100/month starting at age 25 can grow to $265,000 by 65 (assuming 8% returns). Wait until 35, and you'll only have $122,000. Time is your biggest advantage.",
        proTip: "Contributing to employer 401(k) match is free money—prioritize this before other investing."
      },
      {
        title: "The Power of Compound Interest",
        content: "Einstein called it the 'eighth wonder of the world.' Your investment returns generate their own returns. A $10,000 investment at 8% becomes $46,610 in 20 years—without adding another dollar.",
        proTip: "Even small regular contributions leverage compounding better than large irregular deposits."
      },
      {
        title: "Index Funds vs. Individual Stocks",
        content: "Index funds provide instant diversification across hundreds of companies with minimal fees (often 0.03-0.20%). Individual stock picking requires extensive research and carries higher risk. Most investors are better served by low-cost index funds.",
        proTip: "A simple portfolio: 70% total stock market index, 30% total bond market index, rebalanced annually."
      }
    ]
  },
  {
    id: "mistakes",
    title: "Common Money Mistakes",
    icon: AlertTriangle,
    description: "Avoid these financial pitfalls",
    tips: [
      {
        title: "Lifestyle Inflation",
        content: "When income increases, expenses often rise proportionally. The 'hedonic treadmill' keeps you feeling no wealthier despite earning more. Combat this by committing 50% of raises to savings before adjusting your lifestyle.",
        proTip: "Live like you got a 50% raise, save the other 50%—you'll still enjoy improvements."
      },
      {
        title: "Skipping the Emergency Fund",
        content: "Without savings, every unexpected expense becomes a crisis requiring high-interest debt. This creates a vicious cycle of financial stress. Breaking it requires building even a small emergency cushion first.",
        proTip: "Your emergency fund is financial insurance—you hope to never need it, but it's essential."
      },
      {
        title: "Ignoring Retirement",
        content: "Social Security replaces only about 40% of pre-retirement income. Waiting to save means missing decades of compound growth. Starting retirement savings in your 20s, even modestly, is far more effective than large contributions starting in your 40s.",
        proTip: "Aim to save 15% of gross income for retirement—including employer match if available."
      }
    ]
  },
  {
    id: "milestones",
    title: "Financial Milestones",
    icon: Award,
    description: "Celebrate your progress",
    tips: [
      {
        title: "First $1,000 Saved",
        content: "This milestone represents breaking the paycheck-to-paycheck cycle. You now have a small buffer against life's surprises. Celebrate this achievement—it's harder than it seems and proves you can build wealth.",
        proTip: "Track your progress visually with a chart or app—seeing growth motivates continued progress."
      },
      {
        title: "Becoming Debt-Free",
        content: "Eliminating consumer debt frees up cash flow for wealth building. Your former debt payments can now fund investments, creating a powerful financial turnaround. Many find this moment transformative.",
        proTip: "After becoming debt-free, redirect those payments to savings—don't inflate your lifestyle yet."
      },
      {
        title: "Six-Month Emergency Fund",
        content: "With 6 months of expenses saved, you can weather most financial storms: job loss, medical issues, major repairs. This milestone represents true financial stability and dramatically reduces financial anxiety.",
        proTip: "Once fully funded, redirect emergency fund contributions to wealth-building investments."
      }
    ]
  }
];

export default function FinancialTips() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.tips.some(tip =>
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Tips & Knowledge</h1>
            <p className="text-muted-foreground mt-1">Expert advice for your financial journey</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search financial tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="h-full">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription className="mt-1">{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.tips.map((tip, index) => (
                  <AccordionItem key={index} value={`${category.id}-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{tip.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.content}
                      </p>
                      {tip.proTip && (
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                          <Badge variant="secondary" className="mb-2">Pro Tip</Badge>
                          <p className="text-sm text-foreground">
                            {tip.proTip}
                          </p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tips found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Attribution Footer */}
      <Card className="bg-muted/50">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            These tips synthesize widely-accepted financial principles from experts including Dave Ramsey, Elizabeth Warren, Ramit Sethi, 
            and guidance from NerdWallet, Investopedia, and the Consumer Financial Protection Bureau (CFPB). 
            This information is educational and not personalized financial advice. For complex situations, consult a financial professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
