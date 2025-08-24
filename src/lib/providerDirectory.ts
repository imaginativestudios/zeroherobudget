export interface KnownProvider {
  name: string;
  keywords: string[];
  manageUrl: string;
  category: string;
  typicalAmount?: number; // Common price point
}

export const KNOWN_PROVIDERS: KnownProvider[] = [
  // Streaming
  { name: "Netflix", keywords: ["netflix"], manageUrl: "https://www.netflix.com/YourAccount", category: "Entertainment", typicalAmount: 15.49 },
  { name: "Spotify", keywords: ["spotify"], manageUrl: "https://www.spotify.com/us/account/subscription/", category: "Entertainment", typicalAmount: 9.99 },
  { name: "Apple Music", keywords: ["apple music", "apple.com/bill"], manageUrl: "https://music.apple.com/account/settings", category: "Entertainment", typicalAmount: 9.99 },
  { name: "YouTube Premium", keywords: ["youtube premium", "google youtube"], manageUrl: "https://www.youtube.com/paid_memberships", category: "Entertainment", typicalAmount: 11.99 },
  { name: "Hulu", keywords: ["hulu"], manageUrl: "https://secure.hulu.com/account", category: "Entertainment", typicalAmount: 7.99 },
  { name: "Disney+", keywords: ["disney plus", "disneyplus"], manageUrl: "https://www.disneyplus.com/account", category: "Entertainment", typicalAmount: 7.99 },
  { name: "Amazon Prime", keywords: ["amazon prime", "amzn mktp"], manageUrl: "https://www.amazon.com/mc/yoursubscriptions", category: "Shopping", typicalAmount: 14.98 },
  { name: "HBO Max", keywords: ["hbo max", "hbomax"], manageUrl: "https://play.hbomax.com/subscription", category: "Entertainment", typicalAmount: 15.99 },

  // Software/Productivity
  { name: "Adobe Creative Cloud", keywords: ["adobe"], manageUrl: "https://account.adobe.com/plans", category: "Software", typicalAmount: 52.99 },
  { name: "Microsoft 365", keywords: ["microsoft", "office 365"], manageUrl: "https://account.microsoft.com/services/", category: "Software", typicalAmount: 6.99 },
  { name: "Google One", keywords: ["google one", "google storage"], manageUrl: "https://one.google.com/settings", category: "Software", typicalAmount: 1.99 },
  { name: "Dropbox", keywords: ["dropbox"], manageUrl: "https://www.dropbox.com/account/billing", category: "Software", typicalAmount: 9.99 },
  { name: "Canva Pro", keywords: ["canva"], manageUrl: "https://www.canva.com/settings/billing", category: "Software", typicalAmount: 12.99 },

  // News/Education
  { name: "New York Times", keywords: ["nytimes", "new york times"], manageUrl: "https://myaccount.nytimes.com/seg/", category: "News", typicalAmount: 4.25 },
  { name: "Washington Post", keywords: ["washington post", "washpost"], manageUrl: "https://subscribe.washingtonpost.com/acctmgmt", category: "News", typicalAmount: 3.99 },
  { name: "Wall Street Journal", keywords: ["wsj", "wall street journal"], manageUrl: "https://customercenter.wsj.com/", category: "News", typicalAmount: 38.99 },

  // Fitness/Health
  { name: "Peloton", keywords: ["peloton"], manageUrl: "https://members.onepeloton.com/subscription", category: "Fitness", typicalAmount: 12.99 },
  { name: "MyFitnessPal", keywords: ["myfitnesspal"], manageUrl: "https://www.myfitnesspal.com/account/subscription_details", category: "Fitness", typicalAmount: 9.99 },

  // Gaming
  { name: "PlayStation Plus", keywords: ["playstation", "psn"], manageUrl: "https://www.playstation.com/en-us/support/subscriptions/", category: "Gaming", typicalAmount: 9.99 },
  { name: "Xbox Game Pass", keywords: ["xbox", "microsoft store"], manageUrl: "https://account.microsoft.com/services/", category: "Gaming", typicalAmount: 14.99 },
  { name: "Nintendo Switch Online", keywords: ["nintendo"], manageUrl: "https://accounts.nintendo.com/", category: "Gaming", typicalAmount: 3.99 },

  // Other
  { name: "iCloud", keywords: ["icloud", "apple.com/bill"], manageUrl: "https://support.apple.com/en-us/HT201238", category: "Software", typicalAmount: 2.99 },
  { name: "Zoom", keywords: ["zoom"], manageUrl: "https://zoom.us/billing", category: "Software", typicalAmount: 14.99 },
];

export const findProviderByKeyword = (description: string): KnownProvider | null => {
  const lowercaseDesc = description.toLowerCase();
  return KNOWN_PROVIDERS.find(provider => 
    provider.keywords.some(keyword => lowercaseDesc.includes(keyword.toLowerCase()))
  ) || null;
};

export const getProviderByName = (name: string): KnownProvider | null => {
  return KNOWN_PROVIDERS.find(provider => 
    provider.name.toLowerCase() === name.toLowerCase()
  ) || null;
};
