import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHandler, notificationText, NOTIFICATION_RECIPIENT, type ReferralNotification } from './handler.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

Deno.serve(createHandler({
  cronSecret: Deno.env.get('CRON_SECRET') ?? '',
  claim: async () => {
    const { data, error } = await admin.rpc('claim_referral_notifications');
    if (error) throw error;
    return (data ?? []) as ReferralNotification[];
  },
  send: async answer => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY') ?? ''}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `referral-signup/${answer.user_id}`,
      },
      body: JSON.stringify({
      from: 'Zero Hero <noreply@notifications.zeroherobudget.com>',
      reply_to: 'info@zeroherobudget.com',
      to: [NOTIFICATION_RECIPIENT],
      subject: `New referral answer: ${answer.source}`,
      text: notificationText(answer),
      }),
    });
    if (!response.ok) throw new Error(`Email provider failed (${response.status})`);
    const data = await response.json();
    if (typeof data.id !== 'string') throw new Error('Email provider did not accept notification');
    return data.id;
  },
  markSent: async (userId, providerId) => {
    const { error } = await admin.from('referral_notification_receipts').update({
      status: 'sent', sent_at: new Date().toISOString(), provider_id: providerId, lease_until: null,
    }).eq('user_id', userId).eq('status', 'pending');
    if (error) throw error;
  },
  finishBatch: async () => {
    const { error } = await admin.rpc('finish_referral_notification_batch');
    if (error) throw error;
  },
}));