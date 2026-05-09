import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Unavailable() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('subscribe-waitlist', {
        body: { email, source: 'geo_blocked' },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("You're on the list — we'll email you when we expand.");
    } catch (err) {
      toast.error('Could not add you to the list. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg bg-white dark:bg-card">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Zero Hero is US-only for now</CardTitle>
          <CardDescription className="text-base">
            We're currently available only to users in the United States while we
            navigate financial regulations in other regions. We'd love to let you
            know the moment we expand.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center text-sm">
              <p className="font-medium text-foreground">You're on the list.</p>
              <p className="text-muted-foreground mt-1">
                We'll reach out as soon as Zero Hero is available in your country.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="waitlist-email" className="text-sm font-medium">
                Get notified when we expand
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="waitlist-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={submitting}>
                  <Mail className="h-4 w-4 mr-2" />
                  {submitting ? 'Adding…' : 'Notify me'}
                </Button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
