import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type EmailType = 'waitlist_welcome' | 'household_invite' | 'deletion_code';

export interface EmailLog {
  id: string;
  user_id: string | null;
  recipient_email: string;
  email_type: EmailType;
  resend_id: string | null;
  status: EmailStatus;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
}

interface UseEmailLogsOptions {
  limit?: number;
  emailType?: EmailType;
}

export function useEmailLogs(options: UseEmailLogsOptions = {}) {
  const { limit = 50, emailType } = options;
  const { user } = useAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (emailType) {
        query = query.eq('email_type', emailType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching email logs:', fetchError);
        setError('Failed to load email logs');
        setLogs([]);
      } else {
        // Type assertion since we know the structure matches
        setLogs((data || []) as EmailLog[]);
      }
    } catch (err) {
      console.error('Error in useEmailLogs:', err);
      setError('An unexpected error occurred');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user, limit, emailType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('email_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_logs',
        },
        () => {
          // Refetch on any change
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLogs]);

  const getStatusColor = (status: EmailStatus): string => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-amber-600 dark:text-amber-400';
      case 'failed':
      case 'bounced':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: EmailStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'bounced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEmailTypeLabel = (type: EmailType): string => {
    switch (type) {
      case 'waitlist_welcome':
        return 'Waitlist Welcome';
      case 'household_invite':
        return 'Household Invite';
      case 'deletion_code':
        return 'Deletion Code';
      default:
        return type;
    }
  };

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    getStatusColor,
    getStatusBadgeVariant,
    getEmailTypeLabel,
  };
}
