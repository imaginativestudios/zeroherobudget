export const REFERRAL_SOURCES = [
  'A friend or family member',
  'LinkedIn',
  'Reddit',
  'Facebook group',
  'Google search',
  'Product Hunt',
  'Other',
] as const;

export interface ReferralAnswer {
  source: string;
  other?: string;
}

export function referralMetadata(answer?: ReferralAnswer) {
  if (!answer || !REFERRAL_SOURCES.some(source => source === answer.source)) return {};
  return {
    referral_source: answer.source,
    referral_source_other: answer.source === 'Other' ? (answer.other ?? '').trim().slice(0, 120) : '',
  };
}