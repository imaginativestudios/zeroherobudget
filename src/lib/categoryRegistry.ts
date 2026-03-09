/**
 * Unified Category Registry
 *
 * Single source of truth for all budget categories, groups, icons,
 * chart colors, and transaction-matching keywords.
 */

// ── Types ────────────────────────────────────────────────────────────
export interface CategoryGroup {
  id: string;
  name: string;
  icon: string; // lucide icon name (kebab-case)
  color: string; // CSS variable reference e.g. "var(--chart-1)"
  isIncome: boolean;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  groupId: string;
  icon: string;
  enabledByDefault: boolean;
  keywords: string[]; // lowercase hints for transaction matching
}

// ── Default Groups ───────────────────────────────────────────────────
export const DEFAULT_GROUPS: CategoryGroup[] = [
  { id: "income",           name: "Income",              icon: "trending-up",       color: "hsl(var(--chart-8))",  isIncome: true },
  { id: "housing",          name: "Housing",             icon: "home",              color: "hsl(var(--chart-1))",  isIncome: false },
  { id: "utilities",        name: "Utilities",           icon: "zap",               color: "hsl(var(--chart-2))",  isIncome: false },
  { id: "transportation",   name: "Transportation",      icon: "car",               color: "hsl(var(--chart-3))",  isIncome: false },
  { id: "food",             name: "Food",                icon: "utensils-crossed",  color: "hsl(var(--chart-4))",  isIncome: false },
  { id: "health",           name: "Health",              icon: "heart-pulse",       color: "hsl(var(--chart-5))",  isIncome: false },
  { id: "lifestyle",        name: "Lifestyle",           icon: "sparkles",          color: "hsl(var(--chart-6))",  isIncome: false },
  { id: "financial",        name: "Financial",           icon: "piggy-bank",        color: "hsl(var(--chart-8))",  isIncome: false },
  { id: "family",           name: "Family / Personal",   icon: "users",             color: "hsl(var(--chart-9))",  isIncome: false },
  { id: "education",        name: "Children & Education",icon: "graduation-cap",    color: "hsl(var(--chart-7))",  isIncome: false },
  { id: "other",            name: "Other",               icon: "more-horizontal",   color: "hsl(var(--chart-10))", isIncome: false },
];

// ── Default Categories ───────────────────────────────────────────────
export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  // Income
  { id: "income-salary",        name: "Salary / Wages",        groupId: "income",  icon: "banknote",        enabledByDefault: true,  keywords: ["payroll", "salary", "wages", "direct deposit", "adp", "gusto"] },
  { id: "income-side",          name: "Side Income",           groupId: "income",  icon: "briefcase",       enabledByDefault: true,  keywords: ["side hustle", "freelance", "gig"] },
  { id: "income-freelance",     name: "Freelance / Contract",  groupId: "income",  icon: "file-text",       enabledByDefault: true,  keywords: ["freelance", "contract", "consulting", "1099"] },
  { id: "income-investments",   name: "Investments / Dividends",groupId: "income", icon: "trending-up",     enabledByDefault: true,  keywords: ["dividend", "interest", "capital gain", "vanguard", "fidelity"] },

  // Housing
  { id: "housing-rent",         name: "Rent / Mortgage",       groupId: "housing", icon: "home",            enabledByDefault: true,  keywords: ["rent", "mortgage", "landlord", "zillow", "lease"] },
  { id: "housing-tax",          name: "Property Taxes",        groupId: "housing", icon: "landmark",        enabledByDefault: true,  keywords: ["property tax", "county tax"] },
  { id: "housing-insurance",    name: "Home Insurance",        groupId: "housing", icon: "shield",          enabledByDefault: true,  keywords: ["home insurance", "homeowner", "renters insurance"] },
  { id: "housing-maintenance",  name: "Home Maintenance",      groupId: "housing", icon: "wrench",          enabledByDefault: false, keywords: ["home depot", "lowes", "plumber", "electrician", "repair"] },

  // Utilities
  { id: "utilities-electric",   name: "Electric",              groupId: "utilities", icon: "zap",           enabledByDefault: true,  keywords: ["electric", "power", "energy", "duke energy", "pge"] },
  { id: "utilities-water",      name: "Water / Sewer",         groupId: "utilities", icon: "droplets",      enabledByDefault: false, keywords: ["water", "sewer", "utility"] },
  { id: "utilities-internet",   name: "Internet",              groupId: "utilities", icon: "wifi",          enabledByDefault: true,  keywords: ["internet", "comcast", "xfinity", "spectrum", "att", "verizon fios"] },
  { id: "utilities-phone",      name: "Phone",                 groupId: "utilities", icon: "smartphone",    enabledByDefault: true,  keywords: ["t-mobile", "verizon", "at&t", "phone bill", "cell"] },

  // Transportation
  { id: "transport-car",        name: "Car Payment",           groupId: "transportation", icon: "car",       enabledByDefault: true,  keywords: ["car payment", "auto loan", "vehicle"] },
  { id: "transport-gas",        name: "Gas / Fuel",            groupId: "transportation", icon: "fuel",      enabledByDefault: true,  keywords: ["shell", "chevron", "exxon", "bp", "speedway", "gas", "fuel"] },
  { id: "transport-insurance",  name: "Car Insurance",         groupId: "transportation", icon: "shield-check", enabledByDefault: true, keywords: ["geico", "progressive", "state farm", "allstate", "auto insurance"] },
  { id: "transport-maintenance",name: "Maintenance / Repairs", groupId: "transportation", icon: "wrench",    enabledByDefault: true,  keywords: ["oil change", "tire", "mechanic", "auto repair", "jiffy lube"] },
  { id: "transport-public",     name: "Public Transportation", groupId: "transportation", icon: "train-front", enabledByDefault: false, keywords: ["metro", "subway", "bus", "uber", "lyft", "transit"] },

  // Food
  { id: "food-groceries",       name: "Groceries",             groupId: "food", icon: "shopping-cart",      enabledByDefault: true,  keywords: ["whole foods", "kroger", "aldi", "trader joe", "walmart grocery", "costco", "safeway", "publix"] },
  { id: "food-restaurants",     name: "Restaurants / Takeout", groupId: "food", icon: "utensils",           enabledByDefault: true,  keywords: ["doordash", "uber eats", "grubhub", "chipotle", "mcdonald", "restaurant", "takeout"] },
  { id: "food-coffee",          name: "Coffee / Snacks",       groupId: "food", icon: "coffee",             enabledByDefault: true,  keywords: ["starbucks", "dunkin", "coffee", "cafe", "snack"] },

  // Health
  { id: "health-insurance",     name: "Health Insurance",      groupId: "health", icon: "heart-pulse",      enabledByDefault: true,  keywords: ["health insurance", "blue cross", "aetna", "united health", "cigna"] },
  { id: "health-medical",       name: "Medical / Doctor",      groupId: "health", icon: "stethoscope",      enabledByDefault: true,  keywords: ["doctor", "medical", "copay", "hospital", "clinic", "urgent care"] },
  { id: "health-pharmacy",      name: "Pharmacy",              groupId: "health", icon: "pill",             enabledByDefault: true,  keywords: ["cvs", "walgreens", "pharmacy", "prescription", "rx"] },
  { id: "health-fitness",       name: "Gym / Fitness",         groupId: "health", icon: "dumbbell",         enabledByDefault: false, keywords: ["gym", "planet fitness", "la fitness", "peloton", "yoga"] },

  // Lifestyle
  { id: "lifestyle-shopping",   name: "Shopping",              groupId: "lifestyle", icon: "shopping-bag",   enabledByDefault: true,  keywords: ["amazon", "target", "walmart", "shopping", "bestbuy", "nordstrom"] },
  { id: "lifestyle-entertainment", name: "Entertainment",      groupId: "lifestyle", icon: "clapperboard",   enabledByDefault: true,  keywords: ["movies", "concert", "tickets", "amc", "event"] },
  { id: "lifestyle-hobbies",    name: "Hobbies",               groupId: "lifestyle", icon: "palette",        enabledByDefault: true,  keywords: ["hobby", "craft", "sport", "game"] },
  { id: "lifestyle-subscriptions", name: "Subscriptions",      groupId: "lifestyle", icon: "repeat",         enabledByDefault: true,  keywords: ["netflix", "spotify", "hulu", "disney+", "apple music", "hbo", "youtube premium"] },

  // Financial
  { id: "financial-savings",    name: "Savings",               groupId: "financial", icon: "piggy-bank",     enabledByDefault: true,  keywords: ["savings", "deposit", "transfer to savings"] },
  { id: "financial-investments",name: "Investments",           groupId: "financial", icon: "line-chart",     enabledByDefault: true,  keywords: ["investment", "brokerage", "robinhood", "schwab", "etrade"] },
  { id: "financial-debt",       name: "Debt Payments",         groupId: "financial", icon: "credit-card",    enabledByDefault: true,  keywords: ["credit card payment", "student loan", "loan payment"] },
  { id: "financial-emergency",  name: "Emergency Fund",        groupId: "financial", icon: "shield",         enabledByDefault: true,  keywords: ["emergency fund"] },

  // Family / Personal
  { id: "family-childcare",     name: "Childcare",             groupId: "family", icon: "baby",              enabledByDefault: false, keywords: ["daycare", "childcare", "nanny", "babysitter"] },
  { id: "family-pets",          name: "Pets",                  groupId: "family", icon: "paw-print",         enabledByDefault: false, keywords: ["pet", "vet", "petsmart", "petco"] },
  { id: "family-personal-care", name: "Personal Care",         groupId: "family", icon: "sparkles",          enabledByDefault: true,  keywords: ["salon", "barber", "spa", "beauty", "haircut"] },

  // Children & Education
  { id: "edu-tuition",          name: "Tuition / School Fees", groupId: "education", icon: "graduation-cap", enabledByDefault: false, keywords: ["tuition", "school", "university", "college"] },
  { id: "edu-supplies",         name: "School Supplies",       groupId: "education", icon: "book-open",      enabledByDefault: false, keywords: ["school supplies", "textbook", "book"] },
  { id: "edu-activities",       name: "Activities / Lessons",  groupId: "education", icon: "music",          enabledByDefault: false, keywords: ["lesson", "tutoring", "class", "camp"] },

  // Other
  { id: "other-gifts",          name: "Gifts / Donations",     groupId: "other", icon: "gift",              enabledByDefault: true,  keywords: ["gift", "donation", "charity", "tithe", "church"] },
  { id: "other-travel",         name: "Travel",                groupId: "other", icon: "plane",             enabledByDefault: true,  keywords: ["airline", "hotel", "airbnb", "travel", "booking", "expedia"] },
  { id: "other-misc",           name: "Miscellaneous",         groupId: "other", icon: "more-horizontal",   enabledByDefault: true,  keywords: ["atm", "cash", "misc"] },
];

// ── Helper Functions ─────────────────────────────────────────────────

/** Get group definition by id */
export function getGroupById(groupId: string): CategoryGroup | undefined {
  return DEFAULT_GROUPS.find((g) => g.id === groupId);
}

/** Get all categories belonging to a group */
export function getCategoriesByGroup(groupId: string): CategoryDefinition[] {
  return DEFAULT_CATEGORIES.filter((c) => c.groupId === groupId);
}

/** Get only enabled-by-default categories */
export function getEnabledCategories(): CategoryDefinition[] {
  return DEFAULT_CATEGORIES.filter((c) => c.enabledByDefault);
}

/** Find a category by its display name (case-insensitive) */
export function getCategoryByName(name: string): CategoryDefinition | undefined {
  const lower = name.toLowerCase();
  return DEFAULT_CATEGORIES.find((c) => c.name.toLowerCase() === lower);
}

/** Flat array of enabled category names — backward-compatible with old BUDGET_CATEGORIES */
export function getEnabledCategoryNames(): string[] {
  return getEnabledCategories().map((c) => c.name);
}

/** Flat array of ALL category names */
export function getAllCategoryNames(): string[] {
  return DEFAULT_CATEGORIES.map((c) => c.name);
}

/** Get the group name for a given category name */
export function getGroupNameForCategory(categoryName: string): string {
  const cat = getCategoryByName(categoryName);
  if (!cat) return "Other";
  const group = getGroupById(cat.groupId);
  return group?.name ?? "Other";
}

/** Get distinct group names used by enabled categories (for AI prompt) */
export function getGroupNamesForAI(): string[] {
  return DEFAULT_GROUPS.filter((g) => !g.isIncome).map((g) => g.name);
}

/** Build keyword hint string for AI categorization prompt */
export function buildKeywordHints(): string {
  return DEFAULT_CATEGORIES
    .filter((c) => c.keywords.length > 0 && !DEFAULT_GROUPS.find((g) => g.id === c.groupId)?.isIncome)
    .map((c) => `- "${c.name}" (${getGroupById(c.groupId)?.name}): ${c.keywords.slice(0, 5).join(", ")}`)
    .join("\n");
}

/** Generate CATEGORY_COLORS map from groups */
export function buildCategoryColorMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const group of DEFAULT_GROUPS) {
    map[group.name] = group.color;
  }
  return map;
}
