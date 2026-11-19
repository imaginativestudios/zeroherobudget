import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { createHandler, notificationText, NOTIFICATION_RECIPIENT, type ReferralNotification } from './handler.ts';

const answer: ReferralNotification = {
  user_id: '00000000-0000-0000-0000-000000000001', source: 'Google search',
  other: '', signup_at: '2026-11-19T16:44:00Z',
};
const request = () => new Request('https://example.com', { method: 'POST', headers: { 'x-cron-secret': 'test-only' } });

Deno.test('notification destination is info@zeroherobudget.com', () => {
  assertEquals(NOTIFICATION_RECIPIENT, 'info@zeroherobudget.com');
});

Deno.test('unauthenticated calls cannot claim or send notifications', async () => {
  let claims = 0;
  const handler = createHandler({ cronSecret: 'test-only', claim: async () => { claims++; return [answer]; }, send: async () => 'id', markSent: async () => {} });
  assertEquals((await handler(new Request('https://example.com', { method: 'POST' }))).status, 401);
  assertEquals(claims, 0);
});

Deno.test('one receipt per new answer prevents repeated delivery', async () => {
  let pending = [answer];
  let sends = 0;
  const handler = createHandler({ cronSecret: 'test-only', claim: async () => pending,
    send: async () => { sends++; return 'provider-id'; }, markSent: async () => { pending = []; } });
  assertEquals((await handler(request())).status, 200);
  assertEquals((await handler(request())).status, 200);
  assertEquals(sends, 1);
});

Deno.test('skipped answers do not send notifications', async () => {
  let sends = 0;
  const handler = createHandler({ cronSecret: 'test-only', claim: async () => [], send: async () => { sends++; return 'id'; }, markSent: async () => {} });
  assertEquals((await handler(request())).status, 200);
  assertEquals(sends, 0);
});

Deno.test('provider errors do not mark an answer as sent', async () => {
  let marks = 0;
  const handler = createHandler({ cronSecret: 'test-only', claim: async () => [answer], send: async () => { throw new Error('offline'); }, markSent: async () => { marks++; } });
  assertEquals((await handler(request())).status, 502);
  assertEquals(marks, 0);
});

Deno.test('Other detail is included only for Other and limited to 120 characters', () => {
  const text = notificationText({ ...answer, source: 'Other', other: 'x'.repeat(121) });
  assertEquals(text.includes(`Other: ${'x'.repeat(120)}\n`), true);
  assertEquals(notificationText({ ...answer, other: 'ignore' }).includes('ignore'), false);
});