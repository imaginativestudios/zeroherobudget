import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type EmailType = 'waitlist_welcome' | 'household_invite' | 'deletion_code';
export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface EmailLogEntry {
  userId?: string;
  recipientEmail: string;
  emailType: EmailType;
  resendId?: string;
  status: EmailStatus;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an email attempt to the email_logs table
 * @returns The log entry ID if successful, null if failed
 */
export async function logEmail(
  supabaseAdmin: SupabaseClient,
  entry: EmailLogEntry
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_logs')
      .insert({
        user_id: entry.userId || null,
        recipient_email: entry.recipientEmail,
        email_type: entry.emailType,
        resend_id: entry.resendId || null,
        status: entry.status,
        error_message: entry.errorMessage || null,
        metadata: entry.metadata || {},
        sent_at: entry.status === 'sent' ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log email:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Error in logEmail:', err);
    return null;
  }
}

/**
 * Update an existing email log entry with new status
 */
export async function updateEmailStatus(
  supabaseAdmin: SupabaseClient,
  logId: string,
  status: EmailStatus,
  updates?: {
    resendId?: string;
    errorMessage?: string;
  }
): Promise<boolean> {
  try {
    const updateData: Record<string, unknown> = { status };

    if (updates?.resendId) {
      updateData.resend_id = updates.resendId;
    }

    if (updates?.errorMessage) {
      updateData.error_message = updates.errorMessage;
    }

    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from('email_logs')
      .update(updateData)
      .eq('id', logId);

    if (error) {
      console.error('Failed to update email status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateEmailStatus:', err);
    return false;
  }
}
