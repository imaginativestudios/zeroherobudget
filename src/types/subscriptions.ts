export interface Subscription {
  id: string;
  name: string;
  merchantKeywords: string[]; // Keywords to match against transaction descriptions
  expectedAmount: number;
  cycle: 'monthly' | 'yearly' | 'weekly' | 'custom';
  everyN?: number; // For custom cycles (e.g., every 3 months)
  tolerance: number; // Amount tolerance for matching (default $1.00)
  nextCharge: string; // ISO date string
  lastCharge?: string; // ISO date string
  accountId: string;
  category: string; // Default: "Subscriptions"
  manageUrl?: string; // URL to manage/cancel subscription
  status: 'active' | 'paused' | 'canceled';
  notes?: string;
  createdAt: string; // ISO date string
}

export interface SubscriptionMatch {
  subscriptionId: string;
  transactionId: string;
  matchedOn: 'keyword' | 'amount' | 'interval'; // How it was matched
  confidence: number; // 0-1 confidence score
}

export interface SubscriptionSuggestion {
  id: string;
  merchantName: string;
  merchantKeywords: string[];
  expectedAmount: number;
  cycle: 'monthly' | 'yearly' | 'weekly';
  matchingTransactions: string[]; // Transaction IDs
  confidence: number;
  accountId: string;
}

export interface SubscriptionSpend {
  subscriptionId: string;
  subscriptionName: string;
  monthlyAmount: number;
  totalSpent: number;
  transactionCount: number;
}