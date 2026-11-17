import { test, expect } from '@playwright/test';
import { REFERRAL_SOURCES, referralMetadata } from '../src/lib/referralSource';

test('skipping referral produces no metadata and needs no answer', () => {
  expect(referralMetadata()).toEqual({});
});

for (const source of ['A friend or family member', 'LinkedIn', 'Reddit', 'Facebook group', 'Google search', 'Product Hunt', 'Other']) {
  test(`saves ${source} as account metadata`, () => {
    expect(REFERRAL_SOURCES).toContain(source);
    expect(referralMetadata({ source }).referral_source).toBe(source);
  });
}

test('Other allows an empty answer and trims a short answer', () => {
  expect(referralMetadata({ source: 'Other' }).referral_source_other).toBe('');
  expect(referralMetadata({ source: 'Other', other: '  Newsletter  ' }).referral_source_other).toBe('Newsletter');
});

test('switching from Other does not retain its text', () => {
  expect(referralMetadata({ source: 'Google search', other: 'Newsletter' }).referral_source_other).toBe('');
});