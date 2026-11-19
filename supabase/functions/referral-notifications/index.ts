import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
import { createHandler, notificationText, NOTIFICATION_RECIPIENT, type ReferralNotification } from './handler.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(createHandler({
  cronSecret: Deno.env.get('CRON_SECRET') ?? '',
  claim: async () => {
    const { data, error } = await admin.rpc('claim_referral_notifications');
    if (error) throw error;
    return (data ?? []) as ReferralNotification[];
  },
  send: async answer => {
    const { data, error } = await resend.emails.send({
      from: 'Zero Hero <noreply@notifications.zeroherobudget.com>',
      replyTo: 'info@zeroherobudget.com',
      to: [NOTIFICATION_RECIPIENT],
      subject: `New referral answer: ${answer.source}`,
      text: notificationText(answer),
    }, { idempotencyKey: `referral-signup/${answer.user_id}` });
    if (error || !data?.id) throw new Error('Email provider did not accept notification');
    return data.id;
  },
  markSent: async (userId, providerId) => {
    const { error } = await admin.from('referral_notification_receipts').update({
      status: 'sent', sent_at: new Date().toISOString(), provider_id: providerId, lease_until: null,
    }).eq('user_id', userId).eq('status', 'pending');
    if (error) throw error;
  },
}));