import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

export interface ReferralNotification {
  user_id: string;
  source: string;
  other: string | null;
  signup_at: string;
}

export const NOTIFICATION_RECIPIENT = 'info@zeroherobudget.com';

interface Dependencies {
  cronSecret: string;
  claim: () => Promise<ReferralNotification[]>;
  send: (answer: ReferralNotification) => Promise<string>;
  markSent: (userId: string, providerId: string) => Promise<void>;
}

const sources = new Set(['A friend or family member', 'LinkedIn', 'Reddit', 'Facebook group', 'Google search', 'Product Hunt', 'Other']);

export function notificationText(answer: ReferralNotification): string {
  if (!sources.has(answer.source)) throw new Error('Invalid referral source');
  const detail = answer.source === 'Other' && answer.other?.trim()
    ? `\nOther: ${answer.other.trim().slice(0, 120)}` : '';
  return `A new Zero Hero signup answered “How did you hear about Zero Hero?”\n\nSource: ${answer.source}${detail}\nSignup time (UTC): ${answer.signup_at}\n\nAccount reference: ${answer.user_id}`;
}

export function createHandler(deps: Dependencies) {
  return async (req: Request): Promise<Response> => {
    const response = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return response(405, { error: 'Method not allowed' });
    if (!deps.cronSecret || req.headers.get('x-cron-secret') !== deps.cronSecret) {
      return response(401, { error: 'Unauthorized' });
    }
    // No caller-provided recipients, answers, or account IDs are consumed.
    try {
      const answers = await deps.claim();
      let sent = 0;
      let failed = 0;
      for (const answer of answers) {
        try {
          notificationText(answer);
          const providerId = await deps.send(answer);
          await deps.markSent(answer.user_id, providerId);
          sent++;
        } catch {
          failed++;
          console.error('Referral notification delivery failed; receipt remains pending');
        }
      }
      return response(failed ? 502 : 200, { sent, failed });
    } catch {
      console.error('Referral notification batch failed');
      return response(500, { error: 'Unable to process notifications' });
    }
  };
}