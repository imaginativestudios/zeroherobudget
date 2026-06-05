import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FlaskConical, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useBetaAccess } from "@/hooks/useBetaAccess";
import { toast } from "sonner";
import { z } from "zod";

const codeSchema = z
  .string()
  .trim()
  .min(3, "Code is too short")
  .max(64, "Code is too long")
  .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, dashes, and underscores only");

export default function JoinBeta() {
  const navigate = useNavigate();
  const { enable, isBeta } = useBetaAccess();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("redeem-beta-code", {
        body: { code: parsed.data },
      });

      if (fnError || !data?.valid) {
        setError(data?.error || "That code didn't work. Double-check and try again.");
        setLoading(false);
        return;
      }

      // Grant device-level beta UI
      enable();
      // Also keep legacy flag for any older code paths
      localStorage.setItem("beta_access", "true");

      toast.success("Welcome to the beta!");
      navigate("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary to-background">
      <header className="container mx-auto px-6 py-6">
        <Link to="/" className="inline-flex">
          <Logo className="h-8 w-auto" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-white dark:bg-card shadow-royal">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Join the Beta</CardTitle>
            <CardDescription>
              Have an invite code? Enter it below to unlock early access to Zero Hero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isBeta ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  You already have beta access on this device.
                </p>
                <Button onClick={() => navigate("/")} className="w-full">
                  Continue to Zero Hero
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite code</Label>
                  <div className="relative">
                    <KeyRound
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="invite-code"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        if (error) setError(null);
                      }}
                      placeholder="ZH-XXXX-XXXX"
                      autoComplete="off"
                      autoCapitalize="characters"
                      autoFocus
                      maxLength={64}
                      className="pl-9 tracking-wider uppercase"
                      aria-invalid={!!error}
                      aria-describedby={error ? "invite-code-error" : undefined}
                    />
                  </div>
                  {error && (
                    <p id="invite-code-error" className="text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Checking…
                    </>
                  ) : (
                    <>
                      Unlock Beta
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have a code?{" "}
                  <Link to="/" className="underline hover:text-foreground">
                    Join the waitlist
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
