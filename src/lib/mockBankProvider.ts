/**
 * Mock bank-linking provider simulating a Plaid-like OAuth flow.
 * Replace this module with a real provider (Plaid, MX, Yodlee)
 * when integrating with actual bank APIs.
 *
 * NEVER returns real credentials — only opaque tokens and masked identifiers.
 */

import { v4 as uuidv4 } from 'uuid';

export interface MockInstitution {
  id: string;
  name: string;
  logo?: string;
}

export interface LinkedAccountMeta {
  id: string;
  institutionId: string;
  institutionName: string;
  maskedAccountName: string; // e.g. "Checking ••4821"
  accountType: 'checking' | 'savings';
  accessToken: string; // opaque, non-sensitive
  status: 'active' | 'expired';
  linkedAt: string;
}

export const MOCK_INSTITUTIONS: MockInstitution[] = [
  { id: 'chase', name: 'Chase' },
  { id: 'bofa', name: 'Bank of America' },
  { id: 'wells', name: 'Wells Fargo' },
  { id: 'citi', name: 'Citibank' },
  { id: 'usbank', name: 'U.S. Bank' },
  { id: 'capital-one', name: 'Capital One' },
  { id: 'pnc', name: 'PNC Bank' },
  { id: 'td', name: 'TD Bank' },
  { id: 'ally', name: 'Ally Bank' },
  { id: 'discover', name: 'Discover Bank' },
];

export function searchInstitutions(query: string): MockInstitution[] {
  if (!query.trim()) return MOCK_INSTITUTIONS;
  const lower = query.toLowerCase();
  return MOCK_INSTITUTIONS.filter((i) =>
    i.name.toLowerCase().includes(lower)
  );
}

/** Simulate initiating a link session — returns an opaque link token */
export async function initLinkSession(): Promise<string> {
  await delay(400);
  return `link-tok-${uuidv4().slice(0, 8)}`;
}

/** Simulate the OAuth exchange — returns mock linked accounts for chosen institution */
export async function exchangeToken(
  institutionId: string
): Promise<LinkedAccountMeta[]> {
  await delay(1800); // Simulate network latency

  // 10% chance of simulated failure
  if (Math.random() < 0.1) {
    throw new Error('CONNECTION_FAILED');
  }

  const institution = MOCK_INSTITUTIONS.find((i) => i.id === institutionId);
  if (!institution) throw new Error('INSTITUTION_NOT_FOUND');

  const lastFour = () => String(Math.floor(1000 + Math.random() * 9000));

  const accounts: LinkedAccountMeta[] = [
    {
      id: uuidv4(),
      institutionId: institution.id,
      institutionName: institution.name,
      maskedAccountName: `Checking ••${lastFour()}`,
      accountType: 'checking',
      accessToken: `access-${uuidv4()}`,
      status: 'active',
      linkedAt: new Date().toISOString(),
    },
  ];

  // 50% chance of also returning a savings account
  if (Math.random() > 0.5) {
    accounts.push({
      id: uuidv4(),
      institutionId: institution.id,
      institutionName: institution.name,
      maskedAccountName: `Savings ••${lastFour()}`,
      accountType: 'savings',
      accessToken: `access-${uuidv4()}`,
      status: 'active',
      linkedAt: new Date().toISOString(),
    });
  }

  return accounts;
}

/** Simulate re-authentication for an expired connection */
export async function reauthenticate(accessToken: string): Promise<string> {
  await delay(1200);
  if (Math.random() < 0.15) throw new Error('REAUTH_FAILED');
  // Return a new opaque token
  return `access-${uuidv4()}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
