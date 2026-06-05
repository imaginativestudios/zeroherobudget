import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, LogOut, Plus, Copy, Power, RefreshCw, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface BetaCode {
  id: string;
  code: string;
  notes: string | null;
  active: boolean;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

const randomCode = () => {
  const seg = () =>
    Array.from({ length: 4 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))
    ).join('');
  return `ZH-${seg()}-${seg()}`;
};

const AdminBetaCodes = () => {
  const { isAdmin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [codes, setCodes] = useState<BetaCode[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newCode, setNewCode] = useState(randomCode());
  const [notes, setNotes] = useState('');
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isAdmin, loading, navigate, location.pathname]);

  useEffect(() => {
    if (isAdmin) fetchCodes();
  }, [isAdmin]);

  const fetchCodes = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from('beta_invite_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load codes', { description: error.message });
    } else {
      setCodes((data ?? []) as BetaCode[]);
    }
    setIsLoadingData(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCode.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,64}$/.test(trimmed)) {
      toast.error('Invalid code format', {
        description: '3–64 chars, letters/numbers/dashes/underscores.',
      });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('beta_invite_codes').insert({
      code: trimmed,
      notes: notes.trim() || null,
      max_uses: maxUses ? Number(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      active: true,
    });
    setCreating(false);
    if (error) {
      toast.error('Could not create code', { description: error.message });
      return;
    }
    toast.success('Beta code created', { description: trimmed });
    setNewCode(randomCode());
    setNotes('');
    setMaxUses('');
    setExpiresAt('');
    fetchCodes();
  };

  const toggleActive = async (code: BetaCode) => {
    const { error } = await supabase
      .from('beta_invite_codes')
      .update({ active: !code.active })
      .eq('id', code.id);
    if (error) {
      toast.error('Update failed', { description: error.message });
      return;
    }
    toast.success(code.active ? 'Code deactivated' : 'Code reactivated');
    fetchCodes();
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  const copyJoinLink = async (code: string) => {
    const url = `${window.location.origin}/join?code=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const activeCount = codes.filter((c) => c.active).length;
  const totalRedemptions = codes.reduce((s, c) => s + (c.used_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Beta Invite Codes</h1>
            <p className="text-sm text-muted-foreground">Generate and manage tester access codes</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{codes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Power className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRedemptions}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Code</CardTitle>
            <CardDescription>
              Format: ZH-XXXX-XXXX · 3–64 chars, letters/numbers/dashes/underscores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="ZH-XXXX-XXXX"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewCode(randomCode())}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Launch batch 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max uses (optional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires at (optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Codes</CardTitle>
            <CardDescription>Manage existing beta invite codes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No codes yet
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map((c) => {
                    const expired = c.expires_at && new Date(c.expires_at) < new Date();
                    const exhausted = c.max_uses != null && c.used_count >= c.max_uses;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono">{c.code}</TableCell>
                        <TableCell>
                          {!c.active ? (
                            <Badge variant="outline">Inactive</Badge>
                          ) : expired ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                              Expired
                            </Badge>
                          ) : exhausted ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                              Exhausted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.used_count}
                          {c.max_uses != null ? ` / ${c.max_uses}` : ''}
                        </TableCell>
                        <TableCell>
                          {c.expires_at ? format(new Date(c.expires_at), 'MMM dd, yyyy') : '—'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{c.notes ?? '—'}</TableCell>
                        <TableCell>{format(new Date(c.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => copyCode(c.code)} title="Copy code">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => copyJoinLink(c.code)} title="Copy invite link">
                              <Ticket className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={c.active ? 'outline' : 'default'}
                              onClick={() => toggleActive(c)}
                            >
                              {c.active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBetaCodes;
