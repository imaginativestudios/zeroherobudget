import { Expense, Debt, Asset } from './csvUtils';
import { Account, Transaction } from '@/types/transactions';
import { DEMO_EXPENSES, DEMO_DEBTS, DEMO_ASSETS } from './constants';
import { ConnectedInstitution, LinkedAccount } from '@/types/bankConnections';
import { Subscription } from '@/types/subscriptions';

export const DEMO_INCOME = 8500;

export const DEMO_ACCOUNTS: Account[] = [
  { id: "demo-checking", name: "Main Checking", type: "checking", balance: 0, isActive: true },
  { id: "demo-savings", name: "Emergency Savings", type: "savings", balance: 0, isActive: true },
  { id: "demo-credit", name: "Chase Freedom", type: "credit", balance: 0, isActive: true },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  // Recent income - bi-weekly paychecks
  { id: "t1", date: "2025-01-15", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t2", date: "2025-01-01", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t50", date: "2024-12-18", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  
  // Recent expenses - Food
  { id: "t3", date: "2025-01-20", description: "Whole Foods", amount: 156.43, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t4", date: "2025-01-18", description: "Starbucks", amount: 12.50, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e19" },
  { id: "t5", date: "2025-01-17", description: "Chipotle", amount: 28.75, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e18" },
  { id: "t6", date: "2025-01-15", description: "Trader Joe's", amount: 89.23, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t7", date: "2025-01-12", description: "Safeway", amount: 123.16, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t51", date: "2025-01-10", description: "Panera Bread", amount: 24.88, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e18" },
  { id: "t52", date: "2025-01-08", description: "Costco", amount: 234.19, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  
  // Transportation
  { id: "t8", date: "2025-01-19", description: "Shell Gas Station", amount: 65.20, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e13" },
  { id: "t9", date: "2025-01-10", description: "Jiffy Lube", amount: 45.00, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e15" },
  { id: "t53", date: "2025-01-05", description: "Shell Gas Station", amount: 58.42, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e13" },
  { id: "t54", date: "2024-12-28", description: "Chevron Gas", amount: 62.15, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e13" },
  
  // Entertainment & Subscriptions
  { id: "t10", date: "2025-01-18", description: "Netflix", amount: 15.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t11", date: "2025-01-18", description: "Spotify", amount: 10.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t12", date: "2025-01-14", description: "AMC Theatres", amount: 42.00, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e30" },
  { id: "t55", date: "2025-01-12", description: "Adobe Creative Cloud", amount: 54.99, category: "Miscellaneous", accountId: "demo-credit", flow: "out", expenseId: "e38" },
  { id: "t56", date: "2025-01-10", description: "Amazon Prime", amount: 14.99, category: "Miscellaneous", accountId: "demo-checking", flow: "out", expenseId: "e38" },
  { id: "t57", date: "2025-01-08", description: "Apple iCloud+", amount: 9.99, category: "Utilities", accountId: "demo-credit", flow: "out", expenseId: "e11" },
  { id: "t58", date: "2025-01-05", description: "The New York Times", amount: 4.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t59", date: "2025-01-03", description: "Planet Fitness", amount: 24.99, category: "Personal Care", accountId: "demo-checking", flow: "out", expenseId: "e26" },
  { id: "t60", date: "2024-12-22", description: "Canva Pro", amount: 12.99, category: "Miscellaneous", accountId: "demo-credit", flow: "out", expenseId: "e38" },
  
  // Personal Care
  { id: "t13", date: "2025-01-16", description: "Target", amount: 67.89, category: "Personal Care", accountId: "demo-checking", flow: "out", expenseId: "e26" },
  { id: "t14", date: "2025-01-11", description: "Great Clips", amount: 18.00, category: "Personal Care", accountId: "demo-checking", flow: "out", expenseId: "e27" },
  { id: "t61", date: "2025-01-06", description: "CVS Pharmacy", amount: 32.45, category: "Personal Care", accountId: "demo-checking", flow: "out", expenseId: "e26" },
  
  // Monthly recurring - Housing
  { id: "t15", date: "2025-01-01", description: "Mortgage Payment", amount: 1800, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  { id: "t16", date: "2025-01-01", description: "Property Tax", amount: 250, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e2" },
  { id: "t17", date: "2025-01-01", description: "Home Insurance", amount: 125, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e3" },
  { id: "t62", date: "2024-12-01", description: "Mortgage Payment", amount: 1800, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  
  // Utilities
  { id: "t18", date: "2025-01-15", description: "Electric Bill - PG&E", amount: 145.45, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t19", date: "2025-01-14", description: "Verizon Wireless", amount: 120.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e11" },
  { id: "t20", date: "2025-01-10", description: "Comcast Internet", amount: 75.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e10" },
  { id: "t21", date: "2025-01-08", description: "Gas Company", amount: 78.50, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e7" },
  { id: "t63", date: "2025-01-05", description: "Water & Sewer", amount: 65.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e8" },
  
  // Transportation recurring
  { id: "t22", date: "2025-01-05", description: "Honda Finance", amount: 450, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e12" },
  { id: "t23", date: "2025-01-05", description: "State Farm Auto", amount: 150, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e14" },
  
  // Insurance & Healthcare
  { id: "t24", date: "2025-01-01", description: "Health Insurance Premium", amount: 400, category: "Insurance & Healthcare", accountId: "demo-checking", flow: "out", expenseId: "e20" },
  { id: "t25", date: "2025-01-10", description: "CVS Pharmacy", amount: 45.00, category: "Insurance & Healthcare", accountId: "demo-checking", flow: "out", expenseId: "e23" },
  { id: "t64", date: "2025-01-08", description: "Kaiser Medical Co-pay", amount: 25.00, category: "Insurance & Healthcare", accountId: "demo-checking", flow: "out", expenseId: "e22" },
  
  // Debt Payments
  { id: "t26", date: "2025-01-05", description: "Student Loan Payment", amount: 350, category: "Debt Payments", accountId: "demo-checking", flow: "out", expenseId: "e34" },
  { id: "t27", date: "2025-01-05", description: "Credit Card Payment", amount: 200, category: "Debt Payments", accountId: "demo-checking", flow: "out", expenseId: "e35" },
  
  // Savings
  { id: "t28", date: "2025-01-01", description: "Transfer to Emergency Fund", amount: 500, category: "Savings & Investments", accountId: "demo-checking", flow: "out", expenseId: "e31" },
  { id: "t29", date: "2025-01-01", description: "401k Contribution", amount: 600, category: "Savings & Investments", accountId: "demo-checking", flow: "out", expenseId: "e32" },
  
  // Shopping & Miscellaneous
  { id: "t65", date: "2025-01-19", description: "Amazon - Home Supplies", amount: 87.43, category: "Miscellaneous", accountId: "demo-credit", flow: "out" },
  { id: "t66", date: "2025-01-15", description: "PetSmart", amount: 54.23, category: "Miscellaneous", accountId: "demo-checking", flow: "out", expenseId: "e37" },
  { id: "t67", date: "2025-01-12", description: "Target - Gifts", amount: 62.17, category: "Miscellaneous", accountId: "demo-checking", flow: "out", expenseId: "e36" },
  { id: "t68", date: "2025-01-09", description: "Amazon - Books", amount: 34.98, category: "Entertainment", accountId: "demo-credit", flow: "out", expenseId: "e29" },
  { id: "t69", date: "2025-01-04", description: "Veterinary Clinic", amount: 125.00, category: "Miscellaneous", accountId: "demo-checking", flow: "out", expenseId: "e37" },
  
  // December 2024 - Full month history
  { id: "t70", date: "2024-12-20", description: "Netflix", amount: 15.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t71", date: "2024-12-20", description: "Spotify", amount: 10.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t72", date: "2024-12-18", description: "Whole Foods", amount: 142.67, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t73", date: "2024-12-15", description: "Electric Bill - PG&E", amount: 138.22, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t74", date: "2024-12-14", description: "Verizon Wireless", amount: 120.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e11" },
  { id: "t75", date: "2024-12-12", description: "Shell Gas Station", amount: 61.30, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e13" },
  { id: "t76", date: "2024-12-10", description: "Amazon Prime", amount: 14.99, category: "Miscellaneous", accountId: "demo-checking", flow: "out", expenseId: "e38" },
  { id: "t77", date: "2024-12-08", description: "Apple iCloud+", amount: 9.99, category: "Utilities", accountId: "demo-credit", flow: "out", expenseId: "e11" },
  { id: "t78", date: "2024-12-05", description: "Honda Finance", amount: 450, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e12" },
  { id: "t79", date: "2024-12-05", description: "Student Loan Payment", amount: 350, category: "Debt Payments", accountId: "demo-checking", flow: "out", expenseId: "e34" },
  { id: "t80", date: "2024-12-01", description: "Mortgage Payment", amount: 1800, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  { id: "t81", date: "2024-12-01", description: "Transfer to Emergency Fund", amount: 500, category: "Savings & Investments", accountId: "demo-checking", flow: "out", expenseId: "e31" },
  
  // November 2024
  { id: "t82", date: "2024-11-28", description: "Target - Black Friday", amount: 284.52, category: "Miscellaneous", accountId: "demo-credit", flow: "out" },
  { id: "t83", date: "2024-11-27", description: "Thanksgiving Dinner", amount: 156.78, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t84", date: "2024-11-22", description: "Shell Gas Station", amount: 59.45, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e13" },
  { id: "t85", date: "2024-11-20", description: "Netflix", amount: 15.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t86", date: "2024-11-20", description: "Spotify", amount: 10.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t87", date: "2024-11-15", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t88", date: "2024-11-15", description: "Electric Bill - PG&E", amount: 132.88, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t89", date: "2024-11-10", description: "Comcast Internet", amount: 75.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e10" },
  { id: "t90", date: "2024-11-05", description: "Honda Finance", amount: 450, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e12" },
  { id: "t91", date: "2024-11-01", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t92", date: "2024-11-01", description: "Mortgage Payment", amount: 1800, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  
  // October 2024
  { id: "t93", date: "2024-10-31", description: "Halloween Decorations", amount: 67.32, category: "Miscellaneous", accountId: "demo-checking", flow: "out" },
  { id: "t94", date: "2024-10-25", description: "Costco", amount: 198.45, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t95", date: "2024-10-20", description: "Netflix", amount: 15.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t96", date: "2024-10-20", description: "Spotify", amount: 10.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t97", date: "2024-10-18", description: "Shell Gas Station", amount: 64.20, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e13" },
  { id: "t98", date: "2024-10-15", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t99", date: "2024-10-15", description: "Electric Bill - PG&E", amount: 128.55, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t100", date: "2024-10-10", description: "Adobe Creative Cloud", amount: 54.99, category: "Miscellaneous", accountId: "demo-credit", flow: "out", expenseId: "e38" },
  { id: "t101", date: "2024-10-05", description: "Honda Finance", amount: 450, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e12" },
  { id: "t102", date: "2024-10-05", description: "Credit Card Payment", amount: 200, category: "Debt Payments", accountId: "demo-checking", flow: "out", expenseId: "e35" },
  { id: "t103", date: "2024-10-01", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t104", date: "2024-10-01", description: "Mortgage Payment", amount: 1800, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
];

export const DEMO_CONNECTED_INSTITUTIONS: ConnectedInstitution[] = [
  {
    id: "demo-inst-chase",
    name: "Chase",
    logo: "🏦",
    primaryColor: "#117ACA",
    connectionStatus: "connected",
    lastSync: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    itemId: "item_demo_chase_12345",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
  },
  {
    id: "demo-inst-boa",
    name: "Bank of America",
    logo: "🏛️",
    primaryColor: "#E31837",
    connectionStatus: "connected",
    lastSync: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    itemId: "item_demo_boa_67890",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days ago
  },
];

export const DEMO_LINKED_ACCOUNTS: LinkedAccount[] = [
  {
    id: "demo-linked-chase-checking",
    institutionId: "demo-inst-chase",
    name: "Chase Checking",
    type: "checking",
    balance: 3245.67,
    isActive: true,
    mask: "4829",
    officialName: "Chase Total Checking Account",
    subtype: "checking",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "demo-linked-chase-credit",
    institutionId: "demo-inst-chase",
    name: "Chase Freedom",
    type: "credit_card",
    balance: -1247.32,
    isActive: true,
    mask: "8742",
    officialName: "Chase Freedom Unlimited Credit Card",
    subtype: "credit",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "demo-linked-boa-savings",
    institutionId: "demo-inst-boa",
    name: "BofA Savings",
    type: "savings",
    balance: 8920.15,
    isActive: true,
    mask: "3391",
    officialName: "Bank of America Advantage Savings",
    subtype: "savings",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub1",
    name: "Netflix",
    merchantKeywords: ["netflix", "nflx"],
    expectedAmount: 15.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
    lastCharge: "2025-01-18",
    accountId: "demo-checking",
    category: "Entertainment",
    manageUrl: "https://netflix.com/account",
    status: "active",
    notes: "Premium plan with 4K streaming",
    createdAt: "2024-06-15T00:00:00.000Z",
  },
  {
    id: "sub2",
    name: "Spotify",
    merchantKeywords: ["spotify"],
    expectedAmount: 10.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
    lastCharge: "2025-01-18",
    accountId: "demo-checking",
    category: "Entertainment",
    manageUrl: "https://spotify.com/account",
    status: "active",
    notes: "Premium individual plan",
    createdAt: "2024-05-20T00:00:00.000Z",
  },
  {
    id: "sub3",
    name: "Adobe Creative Cloud",
    merchantKeywords: ["adobe", "creative cloud"],
    expectedAmount: 54.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString().split('T')[0],
    accountId: "demo-credit",
    category: "Miscellaneous",
    manageUrl: "https://adobe.com/account",
    status: "active",
    notes: "Photography plan with Photoshop & Lightroom",
    createdAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "sub4",
    name: "Amazon Prime",
    merchantKeywords: ["amazon prime", "amzn prime"],
    expectedAmount: 14.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0],
    accountId: "demo-checking",
    category: "Miscellaneous",
    manageUrl: "https://amazon.com/prime",
    status: "active",
    notes: "Includes free shipping and Prime Video",
    createdAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "sub5",
    name: "Apple iCloud+",
    merchantKeywords: ["apple", "icloud"],
    expectedAmount: 9.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
    accountId: "demo-credit",
    category: "Utilities",
    manageUrl: "https://icloud.com",
    status: "active",
    notes: "2TB storage plan",
    createdAt: "2024-08-12T00:00:00.000Z",
  },
  {
    id: "sub6",
    name: "The New York Times",
    merchantKeywords: ["new york times", "nytimes"],
    expectedAmount: 4.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0],
    accountId: "demo-checking",
    category: "Entertainment",
    manageUrl: "https://nytimes.com/subscriptions",
    status: "active",
    notes: "Digital subscription with games access",
    createdAt: "2024-07-05T00:00:00.000Z",
  },
  {
    id: "sub7",
    name: "Planet Fitness",
    merchantKeywords: ["planet fitness", "planetfitness"],
    expectedAmount: 24.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
    accountId: "demo-checking",
    category: "Personal Care",
    manageUrl: "",
    status: "active",
    notes: "Black Card membership with guest privileges",
    createdAt: "2024-02-14T00:00:00.000Z",
  },
  {
    id: "sub8",
    name: "Canva Pro",
    merchantKeywords: ["canva"],
    expectedAmount: 12.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString().split('T')[0],
    accountId: "demo-credit",
    category: "Miscellaneous",
    manageUrl: "https://canva.com/settings",
    status: "active",
    notes: "For design work and social media graphics",
    createdAt: "2024-09-22T00:00:00.000Z",
  },
  {
    id: "sub9",
    name: "Hulu",
    merchantKeywords: ["hulu"],
    expectedAmount: 7.99,
    cycle: "monthly",
    tolerance: 1.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString().split('T')[0],
    accountId: "demo-checking",
    category: "Entertainment",
    manageUrl: "https://hulu.com/account",
    status: "paused",
    notes: "Currently on hold, considering cancellation",
    createdAt: "2024-04-08T00:00:00.000Z",
  },
  {
    id: "sub10",
    name: "Costco Membership",
    merchantKeywords: ["costco"],
    expectedAmount: 60,
    cycle: "yearly",
    tolerance: 5.00,
    nextCharge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().split('T')[0],
    accountId: "demo-checking",
    category: "Miscellaneous",
    manageUrl: "https://costco.com/myaccount",
    status: "active",
    notes: "Gold Star membership, renews in June",
    createdAt: "2023-06-01T00:00:00.000Z",
  },
];

// Function to set up demo data in localStorage
export function setupDemoData(userId: string): void {
  localStorage.setItem(`${userId}_bdt_income`, JSON.stringify(DEMO_INCOME));
  localStorage.setItem(`${userId}_bdt_expenses`, JSON.stringify(DEMO_EXPENSES));
  localStorage.setItem(`${userId}_bdt_debts`, JSON.stringify(DEMO_DEBTS));
  localStorage.setItem(`${userId}_bdt_assets`, JSON.stringify(DEMO_ASSETS));
  localStorage.setItem(`${userId}_bdt_accounts`, JSON.stringify(DEMO_ACCOUNTS));
  localStorage.setItem(`${userId}_bdt_transactions`, JSON.stringify(DEMO_TRANSACTIONS));
  localStorage.setItem(`${userId}_bdt_strategy`, JSON.stringify("Avalanche"));
  localStorage.setItem(`${userId}_bdt_subscriptions`, JSON.stringify(DEMO_SUBSCRIPTIONS));
  localStorage.setItem(`${userId}_connected_institutions`, JSON.stringify(DEMO_CONNECTED_INSTITUTIONS));
  localStorage.setItem(`${userId}_linked_accounts`, JSON.stringify(DEMO_LINKED_ACCOUNTS));
  
  // Also populate the expenses key for useLocalExpenses hook
  const expensesForLocalHook = DEMO_EXPENSES.map(expense => ({
    id: expense.id,
    name: expense.name,
    amount: expense.planned,
    category: expense.category,
    is_income: false,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  localStorage.setItem(`${userId}_expenses`, JSON.stringify(expensesForLocalHook));
  
  // Set up achievements data to show some progress
  const achievementsData = {
    firstVictory: { unlocked: false, unlockedAt: null },
    halfwayHero: { unlocked: false, unlockedAt: null },
    threeQuartersCrusader: { unlocked: false, unlockedAt: null },
    financialFreedom: { unlocked: false, unlockedAt: null },
  };
  localStorage.setItem(`${userId}_achievements`, JSON.stringify(achievementsData));
}

// Function to clear demo data
export function clearDemoData(userId: string): void {
  localStorage.removeItem(`${userId}_bdt_income`);
  localStorage.removeItem(`${userId}_bdt_expenses`);
  localStorage.removeItem(`${userId}_bdt_debts`);
  localStorage.removeItem(`${userId}_bdt_assets`);
  localStorage.removeItem(`${userId}_bdt_accounts`);
  localStorage.removeItem(`${userId}_bdt_transactions`);
  localStorage.removeItem(`${userId}_bdt_group_order`);
  localStorage.removeItem(`${userId}_bdt_strategy`);
  localStorage.removeItem(`${userId}_bdt_subscriptions`);
  localStorage.removeItem(`${userId}_expenses`);
  localStorage.removeItem(`${userId}_connected_institutions`);
  localStorage.removeItem(`${userId}_linked_accounts`);
  localStorage.removeItem(`${userId}_achievements`);
}

// Check if demo data is already set up
export function isDemoDataSetup(userId: string): boolean {
  const storedIncome = localStorage.getItem(`${userId}_bdt_income`);
  return storedIncome !== null && JSON.parse(storedIncome) > 0;
}