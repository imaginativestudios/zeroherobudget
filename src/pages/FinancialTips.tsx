import { useState } from "react";
import { Lightbulb, Search, TrendingUp, DollarSign, Target, CreditCard, PiggyBank, AlertTriangle, Award, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

      {/* Educational Disclaimer - Prominently Placed */}
      <Card className="bg-muted/50 border-primary/20">
        <CardContent className="py-5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Educational Content Disclaimer</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The information presented here reflects widely-recognized personal finance principles compiled from publicly available educational resources, government publications, and established financial literacy frameworks. This content is provided for general informational purposes only and does not constitute personalized financial, legal, or tax advice. Individual circumstances vary significantly. Before making financial decisions, consult a qualified financial advisor, accountant, or attorney licensed in your jurisdiction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories with Individual Tip Cards */}
      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            {/* Category Section Header */}
            <div className="flex items-center gap-3 pt-4 first:pt-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <category.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
            
            {/* Individual Tip Cards - Horizontal Layout */}
            <div className="space-y-4">
              {category.tips.map((tip, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Title Section - Left */}
                    <div className="lg:w-1/4 p-5 bg-primary/5 border-b lg:border-b-0 lg:border-r border-border flex items-center">
                      <CardTitle className="text-lg font-semibold">{tip.title}</CardTitle>
                    </div>
                    
                    {/* Content Section - Middle */}
                    <div className="lg:w-1/2 p-5 flex items-center">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.content}
                      </p>
                    </div>
                    
                    {/* Pro Tip Section - Right */}
                    {tip.proTip ? (
                      <div className="lg:w-1/4 p-5 bg-accent/10 border-t lg:border-t-0 lg:border-l border-accent/20 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Lightbulb className="h-3.5 w-3.5 text-accent fill-accent" aria-hidden="true" />
                          <span className="text-xs font-semibold text-accent uppercase tracking-wide">Pro Tip</span>
                        </div>
                        <p className="text-sm text-foreground">
                          {tip.proTip}
                        </p>
                      </div>
                    ) : (
                      <div className="lg:w-1/4" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
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

    </div>
  );
}
