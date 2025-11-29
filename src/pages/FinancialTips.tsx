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
import { allFinancialTips } from "@/lib/financialTips";

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

// Build categories from shared tips data
const categories: TipCategory[] = [
  {
    id: "emergency",
    title: "Emergency Fund",
    icon: AlertTriangle,
    description: "Build your financial safety net",
    tips: allFinancialTips.filter(t => t.category === "Emergency Fund")
  },
  {
    id: "budgeting",
    title: "Budgeting Basics",
    icon: DollarSign,
    description: "Master the fundamentals of smart spending",
    tips: allFinancialTips.filter(t => t.category === "Budgeting Basics")
  },
  {
    id: "debt",
    title: "Debt Management",
    icon: Target,
    description: "Strategies for becoming debt-free",
    tips: allFinancialTips.filter(t => t.category === "Debt Management")
  },
  {
    id: "saving",
    title: "Saving Strategies",
    icon: PiggyBank,
    description: "Build wealth systematically",
    tips: allFinancialTips.filter(t => t.category === "Saving Strategies")
  },
  {
    id: "credit",
    title: "Credit Score Mastery",
    icon: CreditCard,
    description: "Understand and improve your credit",
    tips: allFinancialTips.filter(t => t.category === "Credit Score Mastery")
  },
  {
    id: "investing",
    title: "Investing Basics",
    icon: TrendingUp,
    description: "Grow wealth for the long term",
    tips: allFinancialTips.filter(t => t.category === "Investing Basics")
  },
  {
    id: "mistakes",
    title: "Common Money Mistakes",
    icon: AlertTriangle,
    description: "Avoid these financial pitfalls",
    tips: allFinancialTips.filter(t => t.category === "Common Money Mistakes")
  },
  {
    id: "milestones",
    title: "Financial Milestones",
    icon: Award,
    description: "Celebrate your progress",
    tips: allFinancialTips.filter(t => t.category === "Financial Milestones")
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
