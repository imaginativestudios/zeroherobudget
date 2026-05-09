import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { CalendarClock, CreditCard, Sparkles, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export default function SubscriptionStatus() {
  const navigate = useNavigate();
  const {
    subscribed,
    isTrialing,
    interval,
    amount,
    subscriptionEnd,
    trialEnd,
    loading,
    error,
    checkSubscription,
    openCustomerPortal,
  } = useSubscriptionStatus();

  const [portalLoading, setPortalLoading] = useState(false);

  const handlePortal = async () => {
    try {
      setPortalLoading(true);
      const url = await openCustomerPortal();
      window.open(url, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const trialDays = daysUntil(trialEnd);
  const renewalDays = daysUntil(subscriptionEnd);

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Status</h1>
          <p className="text-muted-foreground mt-1">Your current plan and billing details.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => checkSubscription()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {loading ? (
        <Card className="bg-white dark:bg-card">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-white dark:bg-card border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : !subscribed ? (
        <Card className="bg-white dark:bg-card">
          <CardHeader>
            <CardTitle>No active plan</CardTitle>
            <CardDescription>
              You don't have an active subscription yet. Start your 7-day free trial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/pricing")}>View pricing</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-white dark:bg-card">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Zero Hero {interval === "annual" ? "Annual" : "Monthly"}
                  </CardTitle>
                  {isTrialing ? (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Trial active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
                <CardDescription className="mt-1">
                  {amount != null ? `$${amount}` : "—"}
                  {interval ? ` / ${interval === "annual" ? "year" : "month"}` : ""}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTrialing && trialEnd && (
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      Free trial ends {formatDate(trialEnd)}
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      {trialDays === 0
                        ? "Your trial ends today."
                        : `${trialDays} day${trialDays === 1 ? "" : "s"} remaining. You'll be charged automatically when it ends.`}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">
                      {isTrialing ? "First charge" : "Next renewal"}
                    </p>
                    <p className="font-medium text-foreground">
                      {formatDate(subscriptionEnd)}
                    </p>
                    {renewalDays != null && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        in {renewalDays} day{renewalDays === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Billing cycle</p>
                    <p className="font-medium text-foreground capitalize">
                      {interval ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className="text-base">Manage billing</CardTitle>
              <CardDescription>
                Update your payment method, download invoices, or cancel your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={handlePortal} disabled={portalLoading}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {portalLoading ? "Opening…" : "Open billing portal"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/pricing")}>
                Change plan
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
